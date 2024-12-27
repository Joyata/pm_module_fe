<template>
  <!-- Search Filter -->
  <CRow>
    <CCol :md="12">
      <SearchFilter
        @search="handleSearch"
        :unreadCount="unreadCount"
        @toggleNotifications="toggleNotificationsModal"
      ></SearchFilter>
    </CCol>
  </CRow>

  <!-- Filter Section -->
  <CRow>
    <CCol :md="12">
      <CCard class="mb-3">
        <CCardBody>
          <CRow>
            <!-- Team Member Filter -->
            <CCol :md="4" class="mb-3">
              <CFormLabel>Team Member</CFormLabel>
              <CFormSelect
                v-model="filters.teamMember"
                @change="handleFilterChange"
                :disabled="!selectedStation"
              >
                <option value="ALL">All</option>
                <option
                  v-for="member in availableTeamMembers"
                  :key="member._id"
                  :value="member._id"
                >
                  {{ member.username }}
                </option>
              </CFormSelect>
            </CCol>

            <!-- Period Filter -->
            <CCol :md="4" class="mb-3">
              <CFormLabel>Period</CFormLabel>
              <CFormSelect
                v-model="filters.period"
                @change="handleFilterChange"
                :disabled="!selectedStation"
              >
                <option value="ALL">All</option>
                <option value="A">A - 1 Month</option>
                <option value="B">B - 3 Months</option>
                <option value="C">C - 6 Months</option>
                <option value="D">D - 1 Year</option>
              </CFormSelect>
            </CCol>

            <!-- Status Filter -->
            <CCol :md="4" class="mb-3">
              <CFormLabel>Status</CFormLabel>
              <CFormSelect
                v-model="filters.status"
                @change="handleFilterChange"
                :disabled="!selectedStation"
              >
                <option value="ALL">All</option>
                <option value="PLAN">PLAN</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="DELAY">DELAYED</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Caledar Card -->
  <CRow>
    <CCol :md="12">
      <CCard class="mb-3">
        <CCardBody>
          <CRow class="mb-3">
            <CCol class="text-end">
              <CButton
                color="secondary"
                @click="showBulkModal = true"
                :disabled="!selectedStation"
                class="me-2"
              >
                <CIcon icon="cil-spreadsheet" class="me-2"></CIcon>
                Bulk Import
              </CButton>
              <CButton
                color="primary"
                @click="showAssignModal = true"
                :disabled="!selectedStation"
              >
                <CIcon icon="cil-plus" class="me-2"></CIcon>
                Add Task
              </CButton>
            </CCol>
          </CRow>

          <!-- Loading State -->
          <div v-if="loading" class="text-center p-5">
            <CSpinner />
            <div class="mt-3">Loading schedule...</div>
          </div>

          <!-- Calendar -->
          <vue-cal
            v-else
            ref="vuecal"
            :selected-date="selectedDate"
            :events="calendarEvents"
            :time="false"
            :disable-views="['years', 'year']"
            default-view="month"
            today-button
            :editable-events="{
              title: false,
              drag: true,
              resize: false,
              delete: false,
              create: false,
            }"
            style="height: 600px; background-color: whitesmoke"
            class="vuecal--blue-theme"
            @cell-click="handleDayClick"
            @event-click="handleTaskClick"
            @event-drag-create="handleDragCreate"
            @event-drop="handleEventDrop"
          >
            <!-- Event content template -->
            <template #event="{ event }">
              <div class="event-content">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-details">
                  <small>{{ event.machineName }}</small>
                  <div class="event-status" :class="event.status.toLowerCase()">
                    {{ event.assignedToName || "Unassigned" }}
                  </div>
                </div>
              </div>
            </template>
          </vue-cal>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Modals -->
  <AssignTaskModal
    :visible="showAssignModal"
    :selectedDate="selectedModalDate"
    @close="showAssignModal = false"
    @submit="handleAssignSubmit"
  />

  <TaskDetailsModal
    :visible="showDetailsModal"
    :work-order="selectedWorkOrder"
    @close="showDetailsModal = false"
    @assign="handleAssignExisting"
  />

  <Notifications
    :visible="showNotificationsModal"
    @close="toggleNotificationsModal"
  ></Notifications>

  <BulkOperationsModal
    :visible="showBulkModal"
    @close="showBulkModal = false"
  />
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import SearchFilter from "../../components/pm/SearchFilter.vue";
import Notifications from "../../components/pm/Notifications.vue";
import VueCal from "vue-cal";
import "vue-cal/dist/vuecal.css";
import AssignTaskModal from "../../components/pm/AssignTaskModal.vue";
import TaskDetailsModal from "../../components/pm/TaskDetailsModal.vue";
import BulkOperationsModal from "../../components/pm/BulkOperationsModal.vue";
import Swal from "sweetalert2";
import { CButton } from "@coreui/vue";

export default {
  name: "PMScheduler",

  components: {
    SearchFilter,
    Notifications,
    VueCal,
    AssignTaskModal,
    TaskDetailsModal,
    BulkOperationsModal,
  },

  data() {
    return {
      selectedDate: new Date(),
      selectedModalDate: null,
      showAssignModal: false,
      showDetailsModal: false,
      showNotificationsModal: false,
      showBulkModal: false,
      selectedStation: null,
      locationHierarchy: {
        plant_id: null,
        shop_id: null,
        line_id: null,
        station_id: null,
      },
      filters: {
        teamMember: "ALL",
        period: "ALL",
        status: "ALL",
      },
      draggedDate: null,
    };
  },

  // async created() {
  //   await this.$store.dispatch(
  //     "notifications/initializeNotifications",
  //     this.user?.role
  //   );
  // },

  computed: {
    ...mapState("schedule", ["loading", "selectedWorkOrder"]),
    ...mapState("user", { usersLoading: "loading" }),
    ...mapGetters("schedule", ["filteredWorkOrders"]),
    ...mapGetters("user", ["allUsers"]),
    ...mapGetters("notifications", ["getUnreadNotifications"]),

    unreadCount() {
      return this.getUnreadNotifications.length;
    },

    // Filter team members based on station assignment
    availableTeamMembers() {
      if (!this.selectedStation) return [];

      return this.allUsers.filter((user) => {
        // Check if user is active and is a team member
        const isValidUser = user.role === "team_member" && !user.deleted_by;

        // Check if user has the correct station assignment
        const hasStationAssignment =
          user.assignments?.station === this.selectedStation;

        // Team leaders can see all stations
        const isTeamLeader = user.role === "team_leader";

        console.log(`Filtering user ${user.username}:`, {
          isValidUser,
          hasStationAssignment,
          isTeamLeader,
        });

        return isValidUser && (hasStationAssignment || isTeamLeader);
      });
    },

    calendarEvents() {
      console.log("Computing calendar events. Current filters:", this.filters);
      console.log("Available work orders:", this.filteredWorkOrders);

      if (!Array.isArray(this.$store.state.schedule.workOrders)) {
        console.warn("workOrders is not an array");
        return [];
      }

      // Filter from complete dataset each time
      const filteredEvents = this.$store.state.schedule.workOrders.filter(
        (workOrder) => {
          const teamMemberMatch =
            this.filters.teamMember === "ALL" ||
            workOrder.assignedTo === this.filters.teamMember;

          const periodMatch =
            this.filters.period === "ALL" ||
            workOrder.period === this.filters.period;

          const statusMatch =
            this.filters.status === "ALL" ||
            workOrder.status === this.filters.status;

          return teamMemberMatch && periodMatch && statusMatch;
        }
      );

      // Then map the filtered work orders to calendar events
      return filteredEvents
        .map((workOrder) => {
          try {
            if (!workOrder.date) {
              console.warn("Work order missing date:", workOrder);
              return null;
            }

            const startDate = this.parseDate(workOrder.date);

            return {
              start: startDate,
              end: startDate,
              title: workOrder.kanbanNo || "No Kanban",
              class: this.getEventClass(workOrder),
              workOrderId: workOrder._id,
              status: workOrder.status || "PLAN",
              machineName: workOrder.machineName || "No Machine",
              assignedTo: workOrder.assignedTo,
              assignedToName: this.getTeamMemberName(workOrder.assignedTo),
              period: workOrder.period,
            };
          } catch (error) {
            console.error("Error processing work order:", workOrder, error);
            return null;
          }
        })
        .filter(Boolean);
    },
  },

  methods: {
    ...mapActions("schedule", [
      "fetchWorkOrders",
      "addWorkOrder",
      "updateWorkOrder",
    ]),

    // Handle search from SearchFilter
    async handleSearch(searchParams) {
      console.log("Search params received:", searchParams);

      // Store the complete location hierarchy
      this.locationHierarchy = searchParams;
      this.selectedStation = searchParams.station_id;

      // Reset filters
      this.filters = {
        teamMember: "ALL",
        period: "ALL",
        status: "ALL",
      };

      // Log current states before setting store filters
      console.log("Location hierarchy:", this.locationHierarchy);
      console.log("Current filters:", this.filters);

      // Update store filters
      this.$store.commit("schedule/SET_FILTERS", {
        ...this.filters,
        ...this.locationHierarchy,
      });

      // Log store state after commit
      console.log(
        "Store filters after commit:",
        this.$store.state.schedule.filters
      );

      // Fetch work orders
      await this.fetchWorkOrders();

      // Log results after fetch
      console.log(
        "Work orders after initial fetch:",
        this.$store.state.schedule.workOrders
      );
    },

    async handleFilterChange() {
      console.log("Filter changed to:", {
        teamMember: this.filters.teamMember,
        period: this.filters.period,
        status: this.filters.status,
      });

      // Update store filters with complete state
      this.$store.commit("schedule/SET_FILTERS", {
        ...this.filters,
        ...this.locationHierarchy,
      });

      // Fetch fresh data instead of filtering existing
      await this.fetchWorkOrders();

      console.log("Calendar refreshed with new filters");
    },

    handleFilterClick(event) {
      if (!this.selectedStation) {
        // Prevent the value from changing
        event.preventDefault();

        Swal.fire({
          title: "Warning!",
          text: "Please select location first.",
          icon: "warning",
        });
        return;
      }

      // If location is selected, proceed with filter change
      this.handleFilterChange();
    },

    handleDayClick(date) {
      if (!this.selectedStation) {
        Swal.fire({
          title: "Warning!",
          text: "Please select location first.",
          icon: "warning",
        });
        return;
      }

      // Ensure date is properly formatted
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );
      this.selectedModalDate = localDate;
      this.showAssignModal = true;
    },

    handleTaskClick(event) {
      console.log("Clicked event:", event);

      // Use store's workOrders directly instead of filtered ones
      const workOrder = this.$store.state.schedule.workOrders.find(
        (wo) => wo._id === event.workOrderId
      );
      console.log("Found work order:", workOrder);

      if (workOrder) {
        console.log("Setting selected work order");
        this.$store.commit("schedule/SET_SELECTED_WORK_ORDER", {
          ...workOrder,
        });
        this.showDetailsModal = true;
      } else {
        console.warn("Work order not found for ID:", event.workOrderId);
      }
    },

    handleDragCreate(event) {
      event.preventDefault();
    },

    handleEventDrop({ event, originalDate }) {
      const formattedDate = [
        String(event.start.getDate()).padStart(2, "0"),
        String(event.start.getMonth() + 1).padStart(2, "0"),
        event.start.getFullYear(),
      ].join("-");

      const workOrder = this.filteredWorkOrders.find(
        (wo) => wo._id === event.workOrderId
      );
      if (workOrder) {
        event.start = originalDate;
        event.end = originalDate;

        this.$store.commit("schedule/SET_SELECTED_WORK_ORDER", {
          ...workOrder,
          date: formattedDate,
        });
        this.showDetailsModal = true;
      }
    },

    getEventClass(workOrder) {
      const classes = [];

      // Add assignment status
      classes.push(workOrder.assignedTo ? "assigned" : "unassigned");

      // Add period class if available
      if (workOrder.period) {
        classes.push(`pm${workOrder.period}`);
      }

      // Add status class
      if (workOrder.status) {
        classes.push(workOrder.status.toLowerCase());
      }

      return classes.join(" ");
    },

    parseDate(dateString) {
      if (!dateString) return new Date();

      try {
        // For dates in YYYY-MM-DD format (from API)
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return new Date(dateString);
        }

        // For dates in DD-MM-YYYY format
        if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
          const [day, month, year] = dateString.split("-");
          return new Date(year, month - 1, day);
        }

        // If neither format matches, try direct parsing
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date;
        }

        console.warn("Unrecognized date format:", dateString);
        return new Date();
      } catch (error) {
        console.error("Error parsing date:", dateString, error);
        return new Date();
      }
    },

    getTeamMemberName(userId) {
      if (!userId) return "Unassigned";
      if (!Array.isArray(this.allUsers)) return "Unknown";

      const user = this.allUsers.find((u) => u._id === userId);
      return user ? user.username : "Unknown";
    },

    async handleAssignSubmit(taskData) {
      const enrichedTaskData = {
        ...taskData,
        ...this.locationHierarchy,
      };

      const success = await this.addWorkOrder(enrichedTaskData);
      if (success) {
        this.showAssignModal = false;
        await this.fetchWorkOrders();
      }
    },

    toggleNotificationsModal() {
      this.showNotificationsModal = !this.showNotificationsModal;
    },
  },

  async mounted() {
    // Initialize users first
    await this.$store.dispatch("user/fetchUsers");

    // Set initial filters
    this.$store.commit("schedule/SET_FILTERS", {
      ...this.filters,
      ...this.locationHierarchy,
    });

    // Initialize notifications
    if (this.$store.state.auth.user?.role) {
      await this.$store.dispatch(
        "notifications/initializeNotifications",
        this.$store.state.auth.user.role
      );
    }
  },
};
</script>

<style lang="scss" scoped>
.event-content {
  padding: 4px;
  height: 100%;
}

.event-title {
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 2px;
}

.event-details {
  font-size: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}

/* Event Classes */
:deep(.vuecal__event) {
  &.unassigned {
    background-color: #f3f4f6;
    border-left: 3px solid #9ca3af;
  }

  &.pmA {
    background-color: #ecfdf5;
    border-left: 3px solid #059669;
  }

  &.pmB {
    background-color: #eff6ff;
    border-left: 3px solid #3b82f6;
  }

  &.pmC {
    background-color: #f5f3ff;
    border-left: 3px solid #8b5cf6;
  }

  &.pmD {
    background-color: #fffbeb;
    border-left: 3px solid #d97706;
  }

  &.plan {
    opacity: 0.9;
  }

  &.completed {
    .event-status {
      background-color: #059669;
      color: white;
    }
  }

  &.delay {
    .event-status {
      background-color: #dc2626;
      color: white;
    }
  }
}
</style>
