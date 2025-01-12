<template>
  <div class="pm-history-container">
    <!-- Desktop/Tablet View -->
    <div class="desktop-view d-none d-md-block">
      <div class="table-scroll-container">
        <CTable align="middle" hover bordered class="pm-table">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="min-w-date"
                >Date Submitted</CTableHeaderCell
              >
              <CTableHeaderCell class="min-w-kanban"
                >Kanban No.</CTableHeaderCell
              >
              <CTableHeaderCell class="min-w-machine"
                >Machine Name</CTableHeaderCell
              >
              <CTableHeaderCell class="min-w-period">Period</CTableHeaderCell>
              <CTableHeaderCell class="min-w-submitted"
                >Submitted By</CTableHeaderCell
              >
              <CTableHeaderCell class="min-w-reviewed"
                >Reviewed By</CTableHeaderCell
              >
              <CTableHeaderCell class="min-w-status">Status</CTableHeaderCell>
              <CTableHeaderCell class="min-w-action">Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-if="loading">
              <CTableDataCell class="text-center" colspan="8">
                <CSpinner component="span" size="sm" aria-hidden="true" />
                Loading...
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-else-if="paginatedPMHistory.length <= 0">
              <CTableDataCell class="text-center" colspan="8"
                >No reviewed checksheets found</CTableDataCell
              >
            </CTableRow>
            <CTableRow
              v-for="checksheet in paginatedPMHistory"
              :key="checksheet._id"
            >
              <CTableDataCell scope="row" class="cell-content">{{
                formatDate(checksheet.created_dt)
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                getKanbanName(checksheet.kanban_id)
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                getMachineName(checksheet.kanban_id)
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                getPeriod(checksheet.kanban_id)
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                getUserName(checksheet.team_member)
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                getUserName(checksheet.team_leader)
              }}</CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <CBadge
                  :color="getStatusColor(checksheet.work_order?.review_status)"
                  shape="rounded-pill"
                >
                  {{ checksheet.work_order?.review_status }}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <CButton
                  color="warning"
                  @click="viewChecksheet(checksheet)"
                  class="text-white"
                >
                  View Checksheet
                </CButton>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>

    <!-- Mobile View -->
    <div class="mobile-view d-md-none">
      <div v-if="loading" class="text-center p-3">
        <CSpinner component="span" size="sm" aria-hidden="true" />
        Loading...
      </div>
      <div v-else-if="paginatedPMHistory.length <= 0" class="text-center p-3">
        No reviewed checksheets found
      </div>
      <div
        v-else
        v-for="checksheet in paginatedPMHistory"
        :key="checksheet._id"
        class="mobile-card"
      >
        <div class="mobile-card-header">
          <div class="mobile-card-date">
            {{ formatDate(checksheet.created_dt) }}
          </div>
          <CBadge
            :color="getStatusColor(checksheet.work_order?.review_status)"
            shape="rounded-pill"
          >
            {{ checksheet.work_order?.review_status }}
          </CBadge>
        </div>

        <div class="mobile-card-body">
          <div class="mobile-card-row">
            <span class="mobile-label">Kanban No:</span>
            <span class="mobile-value">{{
              getKanbanName(checksheet.kanban_id)
            }}</span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-label">Machine Name:</span>
            <span class="mobile-value">{{
              getMachineName(checksheet.kanban_id)
            }}</span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-label">Period:</span>
            <span class="mobile-value">{{
              getPeriod(checksheet.kanban_id)
            }}</span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-label">Submitted By:</span>
            <span class="mobile-value">{{
              getUserName(checksheet.team_member)
            }}</span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-label">Reviewed By:</span>
            <span class="mobile-value">{{
              getUserName(checksheet.team_leader)
            }}</span>
          </div>

          <CButton
            color="warning"
            @click="viewChecksheet(checksheet)"
            class="text-white w-100 mt-3"
          >
            View Checksheet
          </CButton>
        </div>
      </div>
    </div>
  </div>

  <!-- Fullscreen History Check Sheet Modal -->
  <Teleport to="body">
    <CModal
      fullscreen
      :visible="showHistoryChecksheet"
      backdrop="static"
      @close="closeHistoryChecksheet"
    >
      <CModalBody>
        <HistoryChecksheet
          v-if="selectedChecksheet"
          :checksheet="selectedChecksheet"
          @back="closeHistoryChecksheet"
        />
      </CModalBody>
    </CModal>
  </Teleport>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import HistoryChecksheet from "./HistoryChecksheet.vue";
import api from "@/apis/CommonAPI";

export default {
  name: "TablePMHistory",
  components: {
    HistoryChecksheet,
  },
  props: {
    pmHistory: {
      type: Array,
      default: () => [],
    },
    currentPage: {
      type: Number,
      required: true,
    },
    itemsPerPage: {
      type: Number,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showHistoryChecksheet: false,
      userMap: new Map(), // Cache for user names
      kanbanMap: new Map(), // Cache for kanban details
      currentLoadPromise: null,
      loading: false,
    };
  },
  computed: {
    ...mapGetters("checksheets", ["selectedChecksheet"]),
    paginatedPMHistory() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.pmHistory.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.pmHistory.length / this.itemsPerPage);
    },
  },

  watch: {
    totalPages: {
      immediate: true,
      handler(newValue) {
        this.$emit("update:totalPages", newValue);
      },
    },
  },

  mounted() {
    this.fetchPMHistory();
  },

  methods: {
    ...mapActions("checksheets", ["fetchPMHistory", "selectChecksheet"]),

    async loadDetailsForChecksheets(checksheets) {
      if (!checksheets?.length) return;

      this.loading = true;
      try {
        // Get unique IDs not in cache
        const uniqueUserIds = [
          ...new Set([
            ...checksheets.map((c) => c.team_member),
            ...checksheets.map((c) => c.team_leader),
          ]),
        ].filter((id) => id && !this.userMap.has(id));

        const uniqueKanbanIds = [
          ...new Set(checksheets.map((c) => c.kanban_id)),
        ].filter((id) => id && !this.kanbanMap.has(id));

        // Load user details
        const userPromises = uniqueUserIds.map((id) => this.loadUserName(id));

        // Load kanban details
        const kanbanPromises = uniqueKanbanIds.map((id) =>
          this.loadKanbanDetails(id)
        );

        // Wait for all promises to resolve
        await Promise.all([...userPromises, ...kanbanPromises]);

        console.log("User Map:", this.userMap);
        console.log("Kanban Map:", this.kanbanMap);
      } catch (error) {
        console.error("Error loading details:", error);
      } finally {
        this.loading = false;
      }
    },

    formatDate(date) {
      if (!date) return "-";
      try {
        // Handle both ISO strings and Date objects
        const dateObj = typeof date === "string" ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return "-"; // Invalid date

        return dateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } catch (error) {
        console.error("Error formatting date:", error);
        return "-";
      }
    },

    getStatusColor(status) {
      const colors = {
        PENDING: "warning",
        COMPLETED: "success",
        REJECTED: "danger",
      };
      const color = colors[status] || "secondary";
      return color;
    },

    async loadUserName(userId) {
      if (!userId) {
        return "Unknown";
      }

      try {
        // Check if already in cache
        if (this.userMap.has(userId)) {
          const cachedName = this.userMap.get(userId);
          return cachedName;
        }

        const response = await api.get(`/user/list-user?id=${userId}`, "?");

        // Extract username from the response
        const username = response?.data?.data?.username;

        if (username) {
          // Store in cache
          this.userMap.set(userId, username);
          return username;
        }

        return userId;
      } catch (error) {
        console.error("Error fetching user name:", error);
        return userId;
      }
    },

    async loadKanbanDetails(kanbanId) {
      if (!kanbanId) {
        return null;
      }

      try {
        // Check cache first
        if (this.kanbanMap.has(kanbanId)) {
          const cachedKanban = this.kanbanMap.get(kanbanId);
          return cachedKanban;
        }

        const response = await api.get(
          `/kanban/list-kanban?id=${kanbanId}`,
          "?"
        );
        console.log("Kanban API response:", response);

        // Extract kanban from the response
        const kanban = response?.data?.data[0];
        console.log("Extracted kanban:", kanban);

        if (kanban) {
          // Store complete kanban object in cache
          this.kanbanMap.set(kanbanId, {
            kanban_nm: kanban.kanban_nm,
            period: kanban.period,
            machine: {
              machine_nm: kanban.machine?.machine_nm || "-",
            },
            itemcheck: kanban.itemcheck || [],
          });

          return this.kanbanMap.get(kanbanId);
        }

        return null;
      } catch (error) {
        console.error("Error fetching kanban details:", error);
        return null;
      }
    },

    getUserName(userId) {
      const username = this.userMap.get(userId) || userId;
      return username;
    },

    getKanbanName(kanbanId) {
      const kanban = this.kanbanMap.get(kanbanId);
      return kanban?.kanban_nm || kanbanId;
    },

    getMachineName(kanbanId) {
      const kanban = this.kanbanMap.get(kanbanId);
      return kanban?.machine?.machine_nm || "-";
    },

    getPeriod(kanbanId) {
      const kanban = this.kanbanMap.get(kanbanId);
      return kanban?.period || "-";
    },

    async viewChecksheet(checksheet) {
      try {
        // Ensure we have kanban details
        if (!this.kanbanMap.has(checksheet.kanban_id)) {
          await this.loadKanbanDetails(checksheet.kanban_id);
        }
        // Ensure we have user details
        if (!this.userMap.has(checksheet.created_by)) {
          await this.loadUserName(checksheet.created_by);
        }

        const kanbanDetails = this.kanbanMap.get(checksheet.kanban_id);
        console.log("Kanban details:", kanbanDetails);

        if (!kanbanDetails) {
          throw new Error("Failed to load kanban details");
        }

        // Format checksheet with additional details
        const formattedChecksheet = {
          ...checksheet,
          kanbanNo: kanbanDetails.kanban_nm,
          machineName: kanbanDetails.machine?.machine_nm || "-",
          period: kanbanDetails.period,
          date: this.formatDate(checksheet.created_dt),
          submittedBy: this.getUserName(checksheet.team_member),
          reviewedBy: this.getUserName(checksheet.team_leader),
          items: checksheet.itemcheck.map((item) => {
            const itemcheckDetails = kanbanDetails.itemcheck.find(
              (i) => i._id === item.itemcheck_id
            );

            return {
              id: item.itemcheck_id,
              part_id: itemcheckDetails?.part_id || null,
              itemCheck: itemcheckDetails?.itemcheck_nm || "-",
              period: itemcheckDetails?.period || "-",
              standard: itemcheckDetails?.std || "-",
              minValue: itemcheckDetails?.min || "-",
              maxValue: itemcheckDetails?.max || "-",
              unit: itemcheckDetails?.unit || "-",
              input: item.value,
              ocrValue: item.ocr_value,
              capturedImage: item.filename
                ? `${process.env.VUE_APP_API_URL}/uploads/itemcheck/${item.filename}`
                : null,
              result: item.result,
              review: item.review,
              reject: item.reject,
            };
          }),
        };

        await this.selectChecksheet(formattedChecksheet);
        this.showHistoryChecksheet = true;
      } catch (error) {
        console.error("Error viewing checksheet:", error);
        Swal.fire("Error", "Failed to view checksheet", "error");
      }
    },

    determineResult(value, min, max, standard) {
      if (standard === "ok") {
        return value?.toLowerCase() === "ok" ? "OK" : "NG";
      }

      if (standard === "value") {
        const numValue = parseFloat(value);
        const minVal = parseFloat(min);
        const maxVal = parseFloat(max);

        if (isNaN(numValue) || isNaN(minVal) || isNaN(maxVal)) {
          return "NG";
        }

        return numValue >= minVal && numValue <= maxVal ? "OK" : "NG";
      }

      return "NG";
    },

    closeHistoryChecksheet() {
      this.showHistoryChecksheet = false;
      this.selectChecksheet(null);
    },
  },

  watch: {
    pmHistory: {
      immediate: true,
      handler(newChecksheets) {
        this.loadDetailsForChecksheets(newChecksheets);
      },
    },
  },
};
</script>

<style scoped>
/* Container Styles */
.pm-history-container {
  width: 100%;
  position: relative;
}

/* Table Scroll Container */
.table-scroll-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

/* Table Styles */
.pm-table {
  margin-bottom: 0;
  white-space: nowrap;
  border-collapse: collapse;
  width: 100%;
}

/* Cell Content */
.cell-content {
  padding: 0.75rem !important;
  vertical-align: middle !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* Minimum Column Widths */
.min-w-date {
  min-width: 120px;
}

.min-w-kanban {
  min-width: 120px;
}

.min-w-machine {
  min-width: 150px;
}

.min-w-submitted {
  min-width: 150px;
}

.min-w-reviewed {
  min-width: 150px;
}

.min-w-period {
  min-width: 100px;
}

.min-w-status {
  min-width: 100px;
}

.min-w-action {
  min-width: 150px;
}

/* Mobile Card Styles */
.mobile-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.mobile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.mobile-card-date {
  font-weight: bold;
  color: #495057;
}

.mobile-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-card-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.875rem;
}

.mobile-value {
  color: #212529;
}

/* Responsive Breakpoints */
@media (max-width: 767.98px) {
  .mobile-card {
    margin-left: -0.5rem;
    margin-right: -0.5rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .cell-content {
    padding: 0.5rem !important;
    font-size: 0.9rem;
  }
}

/* Scrollbar Styling */
.table-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.table-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.table-scroll-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.table-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
