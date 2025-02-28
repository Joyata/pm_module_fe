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
            <!-- Status Filter -->
            <CCol :md="4" class="mb-3">
              <CFormLabel>Status</CFormLabel>
              <CFormSelect
                v-model="filters.status"
                @change="handleFilterChange"
                :disabled="!selectedStation"
              >
                <option value="ALL">All Status</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </CFormSelect>
            </CCol>

            <!-- Kanban Filter -->
            <CCol :md="4" class="mb-3">
              <CFormLabel>Kanban No.</CFormLabel>
              <CFormSelect
                v-model="filters.kanbanNo"
                @change="handleFilterChange"
                :disabled="!selectedStation"
              >
                <option value="ALL">All Kanbans</option>
                <option
                  v-for="kanban in uniqueKanbanNosInHistory"
                  :key="kanban"
                  :value="kanban"
                >
                  {{ kanban }}
                </option>
              </CFormSelect>
            </CCol>

            <!-- Machine Filter -->
            <CCol :md="4" class="mb-3">
              <CFormLabel>Machine</CFormLabel>
              <CFormSelect
                v-model="filters.machineName"
                @change="handleFilterChange"
                :disabled="!selectedStation"
              >
                <option value="ALL">All Machines</option>
                <option
                  v-for="machine in uniqueMachineNamesInHistory"
                  :key="machine"
                  :value="machine"
                >
                  {{ machine }}
                </option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <CRow>
    <CCol :md="12">
      <CCard class="mb-3">
        <CCardBody>
          <!-- Date Range Picker -->
          <CRow class="mb-3">
            <CCol sm="6" lg="4">
              <VueDatePicker
                v-model="dateRange"
                range
                auto-apply
                :format="datePickerFormat"
                placeholder="Select Date Range"
                :enable-time-picker="false"
                :clearable="true"
                @update:model-value="handleDateRangeChange"
                @closed="closeDatepicker"
                ref="datepicker"
              ></VueDatePicker>
            </CCol>
          </CRow>

          <!-- PM History Table -->
          <TablePMHistory
            :pmHistory="filteredPMHistory"
            :currentPage="currentPage"
            :itemsPerPage="itemsPerPage"
            :loading="isLoading"
            @refresh="fetchChecksheets"
            @update:totalPages="updateTotalPages"
          ></TablePMHistory>

          <!-- Pagination Controls -->
          <CPagination
            align="end"
            :pages="totalPages"
            :active-page="currentPage"
            @update:active-page="changePage"
            aria-label="Page navigation example"
          >
            <CPaginationItem :disabled="currentPage === 1" @click="prevPage">
              Previous</CPaginationItem
            >
            <CPaginationItem
              v-for="page in totalPages"
              :key="page"
              :active="page === currentPage"
              @click="changePage(page)"
              >{{ page }}</CPaginationItem
            >
            <CPaginationItem
              :disabled="currentPage === totalPages"
              @click="nextPage"
              >Next</CPaginationItem
            >
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
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import SearchFilter from "../../components/pm/SearchFilter.vue";
import Notifications from "../../components/pm/Notifications.vue";
import TablePMHistory from "../../components/pm/TablePMHistory.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

export default {
  name: "PMHistory",
  components: {
    SearchFilter,
    Notifications,
    TablePMHistory,
    VueDatePicker,
  },
  data() {
    return {
      loading: false,
      currentPage: 1,
      itemsPerPage: 5,
      totalPages: 0,
      showNotificationsModal: false,
      dateRange: null,
      datePickerFormat: "dd/MM/yyyy",
      selectedStation: null,
      filters: {
        status: "ALL",
        kanbanNo: "ALL",
        machineName: "ALL",
      },
    };
  },

  computed: {
    ...mapState("auth", ["user"]),
    ...mapGetters("checksheets", [
      "filteredReviewedChecksheets",
      "uniqueKanbanNosInHistory",
      "uniqueMachineNamesInHistory",
      "isLoading",
    ]),
    ...mapGetters("notifications", ["getUnreadNotifications"]),

    filteredPMHistory() {
      let filtered = [...this.filteredReviewedChecksheets];
      console.log("Filtered PM History:", filtered);

      // Apply date range filter
      if (this.dateRange && this.dateRange.length === 2) {
        const [startDate, endDate] = this.dateRange;
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.created_dt);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }

      return filtered;
    },

    unreadCount() {
      return this.getUnreadNotifications.length;
    },

    isLoading() {
      return this.$store.getters["checksheets/isLoading"];
    },
  },

  methods: {
    ...mapActions("checksheets", ["fetchPMHistory"]),

    // Handle search from SearchFilter
    async handleSearch(searchParams) {
      console.log("Search params received:", searchParams);

      // Store the complete location hierarchy
      this.locationHierarchy = searchParams;
      this.selectedStation = searchParams.station_id;
    },

    updateTotalPages(newTotalPages) {
      this.totalPages = newTotalPages;
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    changePage(page) {
      this.currentPage = page;
    },
    async fetchChecksheets() {
      this.loading = true;
      try {
        await this.$store.dispatch("checksheets/fetchChecksheets");
      } catch (error) {
        console.error("Error fetching checksheets:", error);
        // Optionally, show an error message to the user
      } finally {
        this.loading = false;
      }
    },
    handleDateRangeChange(newDateRange) {
      console.log("Date range changed:", newDateRange);
      this.dateRange = newDateRange;
      this.currentPage = 1; // Reset to first page when changing date range
    },

    handleFilterChange() {
      this.$store.dispatch("checksheets/updateFilters", this.filters);
      this.currentPage = 1; // Reset to first page when filters change
    },

    formatDate(date) {
      if (!date) return "";
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}/${month}/${day}`;
    },

    closeDatepicker() {
      // This method will be called when the datepicker is closed
      console.log("Datepicker closed");
    },

    toggleNotificationsModal() {
      this.showNotificationsModal = !this.showNotificationsModal;
    },

    async initializeComponent() {
      this.loading = true;
      try {
        await Promise.all([
          this.$store.dispatch(
            "notifications/initializeNotifications",
            this.user?.role
          ),
          this.fetchChecksheets(),
        ]);
      } catch (error) {
        console.error("Error initializing component:", error);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.initializeComponent();
    // Initialize filters
    this.filters = {
      status: "ALL",
      kanbanNo: "ALL",
      machineName: "ALL",
    };
  },

  watch: {
    filters: {
      deep: true,
      handler(newFilters) {
        this.$store.dispatch("checksheets/updateFilters", newFilters);
      },
    },
  },
};
</script>
