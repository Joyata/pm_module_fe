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
      <CCol :xs="12" :lg="3">
        <!-- Profile Card -->
        <CCard class="mb-3">
          <CCardBody>
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
                <h5 class="mb-1">{{ teamLeader.name }}</h5>
                <p class="mb-1">{{ formatRole(teamLeader.role) }}</p>
              </div>
            </div>
          </CCardBody>
        </CCard>

        <!-- Charts Accordion -->
        <CAccordion class="chart-accordion mb-3">
          <CAccordionItem
            v-for="(chart, index) in charts"
            :key="index"
            :item-key="index.toString()"
          >
            <CAccordionHeader>{{ chart.title }}</CAccordionHeader>
            <CAccordionBody>
              <ChartComponentTL2
                :title="chart.title"
                :type="chart.type"
                :series="
                  chart.type === 'radar'
                    ? [{ name: 'Total Tasks', data: chart.series[0].data }]
                    : chart.series
                "
                :options="chart.options"
                :colors="['#4CB050', '#FFA827', '#EE534F']"
              />
            </CAccordionBody>
          </CAccordionItem>
        </CAccordion>
      </CCol>

      <!-- Activity Content -->
      <CCol :xs="12" :lg="9">
        <CCard class="mb-3">
          <CCardBody>
            <!-- Status Filter Row -->
            <CRow class="mb-3">
              <CCol>
                <TaskStatusFilterTL
                  v-model="statusFilter"
                  :statusButtons="statusButtons"
                  :isHorizontal="true"
                ></TaskStatusFilterTL>
              </CCol>
            </CRow>

            <!-- Date Picker Row -->
            <CRow class="mb-3 justify-content-between">
              <CCol :sm="6" :lg="4">
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

            <!-- Checksheets Table -->
            <TableSubmittedChecksheets
              :filteredChecksheets="filteredChecksheets"
              :currentPage="currentPage"
              :itemsPerPage="itemsPerPage"
              @refresh="fetchChecksheets"
              :statusFilter="statusFilter"
              @update:totalPages="updateTotalPages"
            ></TableSubmittedChecksheets>

            <!-- Pagination Controls -->
            <CPagination
              v-if="filteredChecksheets.length > 0"
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
import { mapState, mapActions, mapGetters } from "vuex";
import LocationCard from "../../components/pm/LocationCard.vue";
import Notifications from "../../components/pm/Notifications.vue";
import TableSubmittedChecksheets from "../../components/pm/TableSubmittedChecksheets.vue";
import TaskStatusFilterTL from "../../components/pm/TaskStatusFilterTL.vue";
import ChartComponentTL2 from "../charts/ChartComponentTL2.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

export default {
  name: "Activity-TL",
  components: {
    LocationCard,
    Notifications,
    TableSubmittedChecksheets,
    TaskStatusFilterTL,
    ChartComponentTL2,
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
      checksheets: [],

      charts: [
        {
          title: "PM Completeness Ratio",
          type: "donut",
          series: [0, 0, 0],
          options: {
            labels: ["Approved", "Pending", "Rejected"],
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
    ...mapGetters("checksheets", ["allChecksheets"]),
    ...mapGetters("notifications", ["getUnreadNotifications"]),

    teamLeader() {
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

      console.log("Profile image URL:", imageUrl);
      return imageUrl;
    },

    filteredChecksheets() {
      console.log("Computing filtered checksheets");
      const checksheets = this.allChecksheets || [];

      return checksheets.filter((checksheet) => {
        // Check team leader match first (most restrictive)
        const matchesTeamLeader =
          checksheet.work_order?.created_by === this.user?._id;
        if (!matchesTeamLeader) return false;

        // Then check review_status
        const matchesStatus =
          this.statusFilter === "ALL" ||
          (checksheet.work_order?.review_status || "PENDING") ===
            this.statusFilter;
        if (!matchesStatus) return false;

        // Finally check date if selected
        if (this.selectedDate) {
          const checksheetDate = new Date(
            checksheet.created_dt
          ).toLocaleDateString();
          const selectedDate = new Date(this.selectedDate).toLocaleDateString();
          return checksheetDate === selectedDate;
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
      const totalCount = this.allChecksheets ? this.allChecksheets.length : 0;
      const pendingCount = this.allChecksheets
        ? this.allChecksheets.filter(
            (c) => c.work_order?.review_status === "PENDING"
          ).length
        : 0;
      const approvedCount = this.allChecksheets
        ? this.allChecksheets.filter(
            (c) => c.work_order?.review_status === "APPROVED"
          ).length
        : 0;
      const rejectedCount = this.allChecksheets
        ? this.allChecksheets.filter(
            (c) => c.work_order?.review_status === "REJECTED"
          ).length
        : 0;
      return [
        { label: "TOTAL", status: "ALL", count: totalCount },
        { label: "PENDING", status: "PENDING", count: pendingCount },
        { label: "APPROVED", status: "APPROVED", count: approvedCount },
        { label: "REJECTED", status: "REJECTED", count: rejectedCount },
      ];
    },

    unreadCount() {
      return this.getUnreadNotifications.length;
    },
  },
  methods: {
    ...mapActions("user", ["fetchUserLocationNames"]),
    ...mapActions("checksheets", ["fetchChecksheets"]),

    async initializeComponent() {
      this.loading = true;
      try {
        await Promise.all([
          this.$store.dispatch(
            "notifications/initializeNotifications",
            this.user?.role
          ),
          this.fetchChecksheets(),
          this.fetchUserLocationNames(this.user),
          this.updateChartData(),
        ]);
      } catch (error) {
        console.error("Error initializing component:", error);
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
      const userChecksheets =
        this.allChecksheets?.filter(
          (c) => c.work_order?.created_by === this.user?._id
        ) || [];

      // Update PM Completeness Chart
      const pending = userChecksheets.filter(
        (c) => c.work_order?.review_status === "PENDING"
      ).length;
      const approved = userChecksheets.filter(
        (c) => c.work_order?.review_status === "APPROVED"
      ).length;
      const rejected = userChecksheets.filter(
        (c) => c.work_order?.review_status === "REJECTED"
      ).length;
      this.charts[0].series = [approved, pending, rejected];

      // Update BIRA Chart (using similar logic)
      // const biraApproved = userChecksheets.filter(
      //   (c) => c.status === "COMPLETED" && c.type === "BIRA"
      // ).length;
      // const biraPending = userChecksheets.filter(
      //   (c) => c.status === "PENDING" && c.type === "BIRA"
      // ).length;
      // const biraRejected = userChecksheets.filter(
      //   (c) => c.status === "DELAY" && c.type === "BIRA"
      // ).length;
      // this.charts[1].series = [biraApproved, biraPending, biraRejected];

      // Update PM Delay Categories
      const pmCategories = ["PM1", "PM2", "PM3", "PM4", "PM5", "PM6"];
      const pmDelays = pmCategories.map((category) => {
        return userChecksheets.filter(
          (c) => c.status === "DELAY" && c.pmCategory === category
        ).length;
      });
      this.charts[1].series = [{ name: "Total Tasks", data: pmDelays }];
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

    matchesSelectedDate(checksheetDate) {
      if (!this.selectedDate) return true;
      const formattedSelectedDate = this.formatDate(this.selectedDate);
      return formattedSelectedDate === checksheetDate;
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
    allChecksheets: {
      handler() {
        this.updateChartData();
      },
      deep: true,
    },

    statusFilter: {
      handler() {
        this.currentPage = 1;
        this.updateChartData();
      },
    },
    selectedDate() {
      this.currentPage = 1;
    },
    "filteredChecksheets.length": {
      handler(newLength) {
        const newTotalPages = Math.ceil(newLength / this.itemsPerPage);
        if (this.totalPages !== newTotalPages) {
          this.totalPages = newTotalPages;
        }
      },
      immediate: true,
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

// Chart Accordion
.chart-accordion {
  :deep(.accordion-button) {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-weight: 500;

    &:not(.collapsed) {
      background-color: #f8f9fa;
    }

    &:focus {
      box-shadow: none;
      border-color: rgba(0, 0, 0, 0.125);
    }
  }

  :deep(.accordion-body) {
    padding: 1rem;
    background-color: #fff;
    // min-height: 350px;

    @media (max-width: 575.98px) {
      // min-height: 300px;
      padding: 0.5rem;
    }
  }
}
</style>
