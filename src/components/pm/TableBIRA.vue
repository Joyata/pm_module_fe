<template>
  <div class="bira-table-container">
    <!-- Desktop/Tablet View with Horizontal Scroll -->
    <div class="desktop-view d-none d-md-block">
      <div class="table-scroll-container">
        <CTable align="middle" hover bordered class="bira-table">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="min-w-date">Date</CTableHeaderCell>
              <CTableHeaderCell class="min-w-kanban"
                >Kanban No.</CTableHeaderCell
              >
              <CTableHeaderCell class="min-w-line">Line</CTableHeaderCell>
              <CTableHeaderCell class="min-w-machine"
                >Machine Name</CTableHeaderCell
              >
              <CTableHeaderCell class="min-w-machine-no"
                >Machine No.</CTableHeaderCell
              >
              <CTableHeaderCell class="min-w-pic">PIC</CTableHeaderCell>
              <CTableHeaderCell class="min-w-problem">Problem</CTableHeaderCell>
              <CTableHeaderCell class="min-w-countermeasure"
                >Countermeasure</CTableHeaderCell
              >
              <CTableHeaderCell class="min-w-status">Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-if="loading">
              <CTableDataCell class="text-center" colspan="9">
                <CSpinner component="span" size="sm" aria-hidden="true" />
                Loading...
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-else-if="paginatedBIRA.length <= 0">
              <CTableDataCell class="text-center" colspan="9"
                >Data not found</CTableDataCell
              >
            </CTableRow>
            <CTableRow v-for="(item, index) in paginatedBIRA" :key="index">
              <CTableDataCell scope="row" class="cell-content">{{
                item.date
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                item.kanbanNo
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                item.line
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                item.machineName
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                item.machineNo
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                item.pic
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                item.problem
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                item.countermeasure
              }}</CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <CBadge color="warning" shape="rounded-pill">{{
                  item.status
                }}</CBadge>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>

    <!-- Mobile View -->
    <div class="mobile-view d-md-none">
      <div
        v-for="(item, index) in paginatedBIRA"
        :key="index"
        class="mobile-card"
      >
        <div class="mobile-card-header">
          <div class="mobile-card-date">{{ item.date }}</div>
          <CBadge color="warning" shape="rounded-pill">{{
            item.status
          }}</CBadge>
        </div>

        <div class="mobile-card-body">
          <div class="mobile-card-row">
            <span class="mobile-label">Machine:</span>
            <span class="mobile-value">{{ item.machineName }}</span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-label">Problem:</span>
            <span class="mobile-value">{{ item.problem }}</span>
          </div>

          <div
            class="mobile-card-expandable"
            :class="{ expanded: expandedItems.includes(item.id) }"
          >
            <div class="mobile-card-row">
              <span class="mobile-label">Kanban No:</span>
              <span class="mobile-value">{{ item.kanbanNo }}</span>
            </div>
            <div class="mobile-card-row">
              <span class="mobile-label">Line:</span>
              <span class="mobile-value">{{ item.line }}</span>
            </div>
            <div class="mobile-card-row">
              <span class="mobile-label">Machine No:</span>
              <span class="mobile-value">{{ item.machineNo }}</span>
            </div>
            <div class="mobile-card-row">
              <span class="mobile-label">PIC:</span>
              <span class="mobile-value">{{ item.pic }}</span>
            </div>
            <div class="mobile-card-row">
              <span class="mobile-label">Countermeasure:</span>
              <span class="mobile-value">{{ item.countermeasure }}</span>
            </div>
          </div>

          <button class="mobile-expand-btn" @click="toggleExpand(item)">
            {{ expandedItems.includes(item.id) ? "Show Less" : "Show More" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "TableBIRA",
  props: {
    currentPageBIRA: {
      type: Number,
      required: true,
    },
    itemsPerPage: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      currentUser: "John Doe",
      items: [],
      expandedItems: [], // Using array instead of Set for better reactivity
      loading: false,
    };
  },
  computed: {
    ...mapGetters("BIRA", ["allBIRA", "selectedBIRA"]),
    paginatedBIRA() {
      console.log(this.allBIRA);
      console.log(this.currentPageBIRA);
      const start = (this.currentPageBIRA - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      console.log(this.itemsPerPage);
      return this.allBIRA.slice(start, end);
    },
  },
  mounted() {
    this.fetchBIRA();
  },
  methods: {
    ...mapActions("BIRA", ["fetchBIRA", "selectBIRA", "updateBIRAStatus"]),

    toggleExpand(item) {
      const index = this.expandedItems.indexOf(item.id);
      if (index === -1) {
        // Item not expanded, so expand it
        this.expandedItems.push(item.id);
      } else {
        // Item is expanded, so collapse it
        this.expandedItems.splice(index, 1);
      }
    },
  },
};
</script>

<style scoped>
.bira-table-container {
  width: 100%;
  position: relative;
}

.table-scroll-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  position: relative;
  /* Add subtle fade on right edge to indicate scrollable content */
  background: linear-gradient(
    to right,
    transparent 30%,
    rgba(0, 0, 0, 0.01) 100%
  );
}

.bira-table {
  margin-bottom: 0;
  white-space: nowrap; /* Prevent text wrapping */
  border-collapse: collapse;
  width: 100%;
}

.cell-content {
  padding: 0.75rem !important;
  vertical-align: middle !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* Minimum Column Widths */
.min-w-date {
  min-width: 100px;
  max-width: 120px;
}

.min-w-kanban {
  min-width: 120px;
  max-width: 150px;
}

.min-w-line {
  min-width: 80px;
  max-width: 100px;
}

.min-w-machine {
  min-width: 150px;
  max-width: 200px;
}

.min-w-machine-no {
  min-width: 120px;
  max-width: 150px;
}

.min-w-pic {
  min-width: 100px;
  max-width: 130px;
}

.min-w-problem {
  min-width: 200px;
  max-width: 300px;
}

.min-w-countermeasure {
  min-width: 200px;
  max-width: 300px;
}

.min-w-status {
  min-width: 100px;
  max-width: 120px;
}

/* Responsive Breakpoints */
@media (min-width: 768px) and (max-width: 991px) {
  /* iPad/Tablet Specific Styles */
  .table-scroll-container {
    /* Add subtle shadows on both sides to indicate scrollable content */
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.01) 0%,
      transparent 5%,
      transparent 95%,
      rgba(0, 0, 0, 0.01) 100%
    );
  }

  .cell-content {
    padding: 0.5rem !important; /* Slightly smaller padding for tablet */
  }
}

@media (min-width: 992px) {
  /* Desktop Specific Styles */
  .table-scroll-container {
    /* Smoother scroll behavior on larger screens */
    scroll-behavior: smooth;
  }

  .cell-content {
    padding: 0.75rem !important;
  }
}

/* Hide scrollbar but keep functionality */
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

.mobile-card-row {
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
}

.mobile-label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.875rem;
}

.mobile-value {
  color: #212529;
  word-break: break-word;
}

.mobile-card-expandable {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  opacity: 0;
  transition: opacity 0.3s ease-out, max-height 0.3s ease-out;
}

.mobile-card-expandable.expanded {
  max-height: 500px;
  opacity: 1;
}

.mobile-expand-btn {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #6c757d;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.mobile-expand-btn:hover {
  background: #e9ecef;
}

/* Utility Classes */
@media (max-width: 767.98px) {
  .d-md-none {
    display: block;
  }
  .d-none {
    display: none;
  }

  /* Additional mobile optimizations */
  .mobile-card {
    margin-left: -0.5rem;
    margin-right: -0.5rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
}

@media (min-width: 768px) {
  .d-md-block {
    display: block;
  }
  .d-md-none {
    display: none;
  }
}
</style>
