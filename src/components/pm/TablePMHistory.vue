<template>
  <div class="pm-history-container">
    <!-- Desktop/Tablet View -->
    <div class="desktop-view d-none d-md-block">
      <div class="table-scroll-container">
        <CTable align="middle" hover bordered class="pm-table">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="min-w-date">Date</CTableHeaderCell>
              <CTableHeaderCell class="min-w-kanban"
                >Kanban No.</CTableHeaderCell
              >
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
              <CTableDataCell class="text-center" colspan="6">
                <CSpinner component="span" size="sm" aria-hidden="true" />
                Loading...
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-else-if="paginatedPMHistory.length <= 0">
              <CTableDataCell class="text-center" colspan="6"
                >Data not found</CTableDataCell
              >
            </CTableRow>
            <CTableRow
              v-for="checksheet in paginatedPMHistory"
              :key="checksheet.id"
            >
              <CTableDataCell scope="row" class="cell-content">{{
                checksheet.date
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                checksheet.kanbanNo
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                checksheet.submittedBy
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                checksheet.reviewedBy
              }}</CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <CBadge
                  :color="getStatusColor(checksheet.status)"
                  shape="rounded-pill"
                >
                  {{ checksheet.status }}
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
        Data not found
      </div>
      <div
        v-else
        v-for="checksheet in paginatedPMHistory"
        :key="checksheet.id"
        class="mobile-card"
      >
        <div class="mobile-card-header">
          <div class="mobile-card-date">{{ checksheet.date }}</div>
          <CBadge
            :color="getStatusColor(checksheet.status)"
            shape="rounded-pill"
          >
            {{ checksheet.status }}
          </CBadge>
        </div>

        <div class="mobile-card-body">
          <div class="mobile-card-row">
            <span class="mobile-label">Kanban No:</span>
            <span class="mobile-value">{{ checksheet.kanbanNo }}</span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-label">Submitted By:</span>
            <span class="mobile-value">{{ checksheet.submittedBy }}</span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-label">Reviewed By:</span>
            <span class="mobile-value">{{ checksheet.reviewedBy }}</span>
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
    };
  },
  computed: {
    ...mapGetters("checksheets", ["selectedChecksheet", "isLoading"]),
    paginatedPMHistory() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.pmHistory.slice(start, end);
    },
  },
  methods: {
    ...mapActions("checksheets", ["fetchChecksheets", "selectChecksheet"]),
    getStatusColor(status) {
      switch (status) {
        case "APPROVED":
          return "success";
        case "REJECTED":
          return "danger";
        default:
          return "secondary";
      }
    },
    async viewChecksheet(checksheet) {
      if (checksheet && checksheet.id) {
        await this.selectChecksheet(checksheet);
        this.showHistoryChecksheet = true;
      } else {
        console.error("Invalid checksheet data:", checksheet);
      }
    },
    closeHistoryChecksheet() {
      this.showHistoryChecksheet = false;
      this.selectChecksheet(null);
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

.min-w-submitted {
  min-width: 150px;
}

.min-w-reviewed {
  min-width: 150px;
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
