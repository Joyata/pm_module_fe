<template>
  <div>
    <!-- Location Info Card -->
    <CRow>
      <CCol :md="12">
        <LocationCard
          :locationFields="locationFields"
          :unreadCount="unreadCount"
          @toggleNotifications="toggleNotificationsModal"
        />
      </CCol>
    </CRow>

    <!-- User Info and Charts Card -->
    <CRow>
      <CCol :xs="12">
        <CCard class="mb-3">
          <CCardBody>
            <CRow class="g-3">
              <!-- User Profile Section -->
              <CCol :xs="12" :sm="6" :lg="2">
                <div class="profile-section">
                  <div class="profile-picture-container">
                    <template v-if="profilePicture">
                      <img
                        :src="profilePicture"
                        alt="Profile Picture"
                        class="profile-picture"
                      />
                    </template>
                    <template v-else>
                      <div class="profile-picture-placeholder">
                        <CIcon
                          icon="cil-user"
                          size="xxl"
                          class="text-secondary"
                        ></CIcon>
                      </div>
                    </template>
                  </div>

                  <div class="profile-info">
                    <h5 class="mb-1">{{ teamMember.name }}</h5>
                    <p class="mb-1">{{ formatRole(teamMember.role) }}</p>
                  </div>
                </div>
              </CCol>

              <!-- Task Status Filter -->
              <CCol :xs="12" :sm="6" :lg="2">
                <TaskStatusFilterTM
                  v-model="statusFilter"
                  :statusButtons="statusButtons"
                  :isHorizontal="false"
                ></TaskStatusFilterTM>
              </CCol>

              <!-- Charts Section -->
              <CCol :xs="12" :lg="8">
                <CRow class="g-2">
                  <CCol
                    :xs="12"
                    :sm="6"
                    :lg="4"
                    v-for="(chart, index) in charts"
                    :key="index"
                  >
                    <ChartComponentTM
                      :title="chart.title"
                      :type="chart.type"
                      :series="
                        chart.type === 'radar'
                          ? [
                              {
                                name: 'Total Tasks',
                                data: chart.series[0].data,
                              },
                            ]
                          : chart.series
                      "
                      :options="chart.options"
                      :colors="['#4CB050', '#FFA827', '#EE534F']"
                    ></ChartComponentTM>
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Worklist Activity Card -->
    <CRow class="mb-3">
      <CCol :xs="12">
        <CCard>
          <CCardHeader>
            <CCardTitle>Worklist Activity</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <!-- Date Picker -->
            <CRow class="mb-3">
              <CCol sm="4">
                <VueDatePicker
                  v-model="selectedDate"
                  auto-apply
                  partial-flow
                  :format="datePickerFormat"
                  placeholder="Select Date"
                  :enable-time-picker="false"
                  :clearable="true"
                  @update:model-value="handleDateChange"
                  @closed="closeDatepicker"
                  ref="datepicker"
                ></VueDatePicker>
              </CCol>
            </CRow>

            <!-- Activities Table -->
            <TableActivities
              :filteredActivities="filteredActivities"
              :currentPage="currentPage"
              :itemsPerPage="itemsPerPage"
              :updateTaskStatus="updateTaskStatus"
              :currentUser="teamMember.name"
              :statusFilter="statusFilter"
              @update:totalPages="updateTotalPages"
            ></TableActivities>

            <!-- Pagination Controls -->
            <CPagination
              v-if="filteredActivities.length > 0"
              align="end"
              :pages="totalPages"
              :active-page="currentPage"
              @update:active-page="changePage"
              aria-label="Page navigation example"
            >
              <CPaginationItem :disabled="currentPage === 1" @click="prevPage">
                Previous
              </CPaginationItem>
              <CPaginationItem
                v-for="page in totalPages"
                :key="page"
                :active="page === currentPage"
                @click="changePage(page)"
              >
                {{ page }}
              </CPaginationItem>
              <CPaginationItem
                :disabled="currentPage === totalPages"
                @click="nextPage"
              >
                Next
              </CPaginationItem>
            </CPagination>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Notifications Modal -->
    <Notifications
      :visible="showNotificationsModal"
      @close="toggleNotificationsModal"
    ></Notifications>
  </div>
</template>

<script>
import api from "../../apis/CommonAPI";
import { mapState, mapActions, mapGetters } from "vuex";
import LocationCard from "../../components/pm/LocationCard.vue";
import Notifications from "../../components/pm/Notifications.vue";
import TableActivities from "../../components/pm/TableActivities.vue";
import TaskStatusFilterTM from "../../components/pm/TaskStatusFilterTM.vue";
import ChartComponentTM from "../charts/ChartComponentTM.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

export default {
  name: "Activity-TM",
  components: {
    LocationCard,
    Notifications,
    TableActivities,
    TaskStatusFilterTM,
    ChartComponentTM,
    VueDatePicker,
  },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 5,
      totalPages: 0,
      statusFilter: "ALL",
      showNotificationsModal: false,
      selectedDate: null,
      datePickerFormat: "dd/MM/yyyy",

      charts: [
        {
          title: "PM Completeness Ratio",
          type: "donut",
          series: [0, 0, 0],
          options: {
            labels: ["Completed", "Plan", "Delay"],
            colors: ["#4CB050", "#FFA827", "#EE534F"],
          },
        },
        {
          title: "BIRA Closing Ratio",
          type: "donut",
          series: [0, 0, 0],
          options: {
            labels: ["Completed", "Plan", "Delay"],
            colors: ["#4CB050", "#FFA827", "#EE534F"],
          },
        },
        {
          title: "PM Delay Category",
          type: "radar",
          series: [
            {
              name: "Total Tasks",
              data: [0, 0, 0, 0, 0, 0],
            },
          ],
          options: {
            categories: ["PM1", "PM2", "PM3", "PM4", "PM5", "PM6"],
            colors: ["#FF4560"],
          },
        },
      ],
    };
  },

  computed: {
    ...mapState("auth", ["user"]),
    ...mapState("user", ["locationNames"]),
    ...mapGetters("activities", ["allActivities"]),
    ...mapGetters("notifications", ["getUnreadNotifications"]),

    teamMember() {
      return {
        name: this.user?.username || "",
        role: this.user?.role || "",
        plant: this.user?.assignments?.plant || "",
        shop: this.user?.assignments?.shop || "",
        line: this.user?.assignments?.line || "",
        station: this.user?.assignments?.station || "",
      };
    },

    profilePicture() {
      if (!this.user?.path) {
        return null;
      }

      // Clean up the path
      const cleanPath = this.user.path
        .replace(/^\.\//, "") // Remove leading ./
        .replace(/^\/+/, "") // Remove leading slashes
        .replace(/\\/g, "/"); // Replace backslashes with forward slashes

      const baseUrl = process.env.VUE_APP_API_URL.replace(/\/+$/, "");
      const imageUrl = `${baseUrl}/${cleanPath}`;

      return imageUrl;
    },

    filteredActivities() {
      if (!this.allActivities) return [];

      return this.allActivities.filter((activity) => {
        // Check status
        const matchesStatus =
          this.statusFilter === "ALL" || activity.status === this.statusFilter;
        if (!matchesStatus) return false;

        // Check user
        const matchesUser = activity.assignedTo === this.user?._id;
        if (!matchesUser) return false;

        // Check date
        if (this.selectedDate) {
          const matchesDate = this.matchesSelectedDate(activity.date);
          if (!matchesDate) return false;
        }

        return true;
      });
    },

    locationFields() {
      return [
        {
          id: "plant",
          label: "Plant",
          value: this.locationNames.plant || "-",
        },
        {
          id: "shop",
          label: "Shop",
          value: this.locationNames.shop || "-",
        },
        {
          id: "line",
          label: "Line",
          value: this.locationNames.line || "-",
        },
        {
          id: "station",
          label: "Station",
          value: this.locationNames.station || "-",
        },
      ];
    },

    statusButtons() {
      const totalCount = this.allActivities ? this.allActivities.length : 0;
      const planCount = this.allActivities
        ? this.allActivities.filter((a) => a.status === "PLAN").length
        : 0;
      const completedCount = this.allActivities
        ? this.allActivities.filter((a) => a.status === "COMPLETED").length
        : 0;
      const delayCount = this.allActivities
        ? this.allActivities.filter((a) => a.status === "DELAY").length
        : 0;
      return [
        { label: "TOTAL", status: "ALL", count: totalCount },
        { label: "PLAN", status: "PLAN", count: planCount },
        { label: "COMPLETED", status: "COMPLETED", count: completedCount },
        { label: "DELAY", status: "DELAY", count: delayCount },
      ];
    },

    unreadCount() {
      return this.getUnreadNotifications.length;
    },
  },

  methods: {
    ...mapActions("user", ["fetchUserLocationNames"]),
    ...mapActions("activities", ["fetchActivities", "updateActivityStatus"]),

    async initializeComponent() {
      this.loading = true;
      try {
        const currentUser =
          this.user || JSON.parse(localStorage.getItem("user"));
        if (!currentUser) {
          console.log("⚠️ No user found");
          return;
        }

        console.log("👤 Current user:", currentUser);

        // Run all initialization tasks in parallel
        await Promise.all([
          // Initialize notifications
          this.$store.dispatch(
            "notifications/initializeNotifications",
            currentUser.role
          ),

          // Fetch activities
          this.fetchActivities(),

          // Fetch location names - explicitly pass the current user
          this.fetchUserLocationNames(currentUser).catch((error) => {
            console.error("Error fetching location names:", error);
          }),

          // Update chart data
          this.updateChartData(),
        ]);

        console.log("✅ Component initialization complete");
      } catch (error) {
        console.error("❌ Error initializing component:", error);
      } finally {
        this.loading = false;
      }
    },

    formatRole(role) {
      return role
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },

    updateChartData() {
      const userActivities =
        this.allActivities?.filter((a) => a.assignedTo === this.user?._id) ||
        [];

      // Update PM Completeness Chart
      const completed = userActivities.filter(
        (a) => a.status === "COMPLETED"
      ).length;
      const planned = userActivities.filter((a) => a.status === "PLAN").length;
      const delayed = userActivities.filter((a) => a.status === "DELAY").length;
      this.charts[0].series = [completed, planned, delayed];

      // Update BIRA Chart (using similar logic)
      const biraCompleted = userActivities.filter(
        (a) => a.status === "COMPLETED" && a.type === "BIRA"
      ).length;
      const biraPlanned = userActivities.filter(
        (a) => a.status === "PLAN" && a.type === "BIRA"
      ).length;
      const biraDelayed = userActivities.filter(
        (a) => a.status === "DELAY" && a.type === "BIRA"
      ).length;
      this.charts[1].series = [biraCompleted, biraPlanned, biraDelayed];

      // Update PM Delay Categories
      const pmCategories = ["PM1", "PM2", "PM3", "PM4", "PM5", "PM6"];
      const pmDelays = pmCategories.map((category) => {
        return userActivities.filter(
          (a) => a.status === "DELAY" && a.pmCategory === category
        ).length;
      });
      this.charts[2].series = [{ name: "Total Tasks", data: pmDelays }];
    },

    formatDate(date) {
      if (!date) return null;
      const formattedDate = new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }); // Use toLocaleDateString for consistent comparison
      console.log(formattedDate);
      return formattedDate;
    },

    async updateTaskStatus(taskId, status) {
      try {
        const success = await this.updateActivityStatus({
          workOrderId: taskId,
          newStatus: status,
        });

        if (success) {
          // Refresh activities after status update
          await this.fetchActivities();
          // Update charts
          this.updateChartData();
          // Show success message
          toast.success("Status updated successfully");
        }
      } catch (error) {
        console.error("Error updating task status:", error);
        toast.error("Failed to update task status");
      }
    },

    updateTotalPages(newTotalPages) {
      this.totalPages = newTotalPages;
    },

    changePage(page) {
      this.currentPage = page;
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    matchesSelectedDate(activityDate) {
      if (!this.selectedDate) return true;

      const selectedDate = this.formatDate(this.selectedDate);
      const dateToCompare = this.formatDate(activityDate);

      console.log("Comparing dates:", {
        activityDate: dateToCompare,
        selectedDate: selectedDate,
      });

      return dateToCompare === selectedDate;
    },

    handleDateChange(newDate) {
      console.log("Date changed:", newDate);
      // Reset pagination when date changes
      this.currentPage = 1;
      this.selectedDate = newDate;

      this.$nextTick(() => {
        this.$refs.datepicker.closeMenu();
      });
    },

    closeDatepicker() {
      // This method will be called when the datepicker is closed
      console.log("Datepicker closed");
    },

    toggleNotificationsModal() {
      this.showNotificationsModal = !this.showNotificationsModal;
    },
  },

  mounted() {
    this.initializeComponent();
  },

  watch: {
    selectedDate() {
      this.currentPage = 1;
    },
    statusFilter() {
      this.currentPage = 1;
    },
    "filteredActivities.length": {
      handler(newLength) {
        const newTotalPages = Math.ceil(newLength / this.itemsPerPage);
        if (this.totalPages !== newTotalPages) {
          this.totalPages = newTotalPages;
        }
      },
      immediate: true,
    },
    user: {
      immediate: true,
      handler(newUser) {
        if (newUser) {
          console.log("👤 User changed, fetching location names");
          this.fetchUserLocationNames(newUser);
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
// Global styles for modal and list items
.modal-backdrop {
  z-index: 2000;
}

.modal-dialog {
  z-index: 2001;
}

.list-group-item {
  transition: background-color 0.3s ease;

  &:hover {
    filter: brightness(95%);
  }
}

// Animation classes
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// User Profile
.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;

  .profile-picture-container {
    width: 180px;
    height: 180px;
    margin-bottom: 1rem;
    border-radius: 8px;
    overflow: hidden;
    background-color: #f8f9fa;
    border: 2px solid #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .profile-picture {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-picture-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;

    :deep(svg) {
      width: 64px;
      height: 64px;
      color: #adb5bd;
    }
  }

  .profile-info {
    text-align: center;

    h5 {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    p {
      color: #6c757d;
      margin: 0;
    }
  }

  // Responsive styles
  @media (max-width: 575.98px) {
    .profile-picture-container {
      width: 120px;
      height: 120px;
    }

    .profile-picture-placeholder {
      :deep(svg) {
        width: 48px;
        height: 48px;
      }
    }
  }

  @media (min-width: 576px) and (max-width: 991.98px) {
    .profile-picture-container {
      width: 150px;
      height: 150px;
    }

    .profile-picture-placeholder {
      :deep(svg) {
        width: 56px;
        height: 56px;
      }
    }
  }

  @media (min-width: 992px) {
    .profile-picture-container {
      width: 180px;
      height: 180px;
    }
  }
}
</style>
