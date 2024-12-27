<template>
  <div>
    <CCard class="mb-4">
      <CCardBody>
        <div class="d-flex justify-content-between mb-4">
          <h4>Change Log</h4>
          <div class="d-flex gap-2">
            <CButton
              color="primary"
              size="sm"
              @click="refreshLogs"
              :disabled="isLoading"
            >
              <CIcon icon="cil-reload" /> Refresh
            </CButton>
          </div>
        </div>

        <!-- Filters -->
        <CRow class="mb-4">
          <CCol sm="6" lg="3">
            <CFormSelect
              label="Date Range"
              v-model="localFilters.dateRange"
              @change="handleFilterChange"
            >
              <option value="last24h">Last 24 hours</option>
              <option value="last7days">Last 7 days</option>
              <option value="last30days">Last 30 days</option>
            </CFormSelect>
          </CCol>
          <CCol sm="6" lg="3">
            <CFormSelect
              label="Entity Type"
              v-model="localFilters.entityType"
              @change="handleFilterChange"
            >
              <option value="all">All Types</option>
              <option value="itemcheck">Item Check</option>
              <option value="tools">Tools</option>
              <option value="kanban">Kanban</option>
              <option value="users">Users</option>
              <option value="spare_part">Spare Parts</option>
              <option value="machine">Machine</option>
              <option value="station">Station</option>
              <option value="line">Line</option>
            </CFormSelect>
          </CCol>
          <CCol sm="6" lg="3">
            <CFormSelect
              label="Change Type"
              v-model="localFilters.changeType"
              @change="handleFilterChange"
            >
              <option value="all">All Changes</option>
              <option value="edit">Updates</option>
              <option value="delete">Deletions</option>
            </CFormSelect>
          </CCol>
          <CCol sm="6" lg="3">
            <CFormSelect
              label="Modified By"
              v-model="localFilters.modifiedBy"
              @change="handleFilterChange"
            >
              <option value="all">All Users</option>
              <option v-for="user in users" :key="user._id" :value="user._id">
                {{ user.username }}
              </option>
            </CFormSelect>
          </CCol>
        </CRow>

        <!-- Table -->
        <TableLog
          :logs="paginatedLogs"
          :users="users"
          :isLoading="isLoading"
          @view-details="viewDetails"
        ></TableLog>

        <!-- Pagination -->
        <CPagination
          v-if="totalPages > 1"
          align="end"
          class="mt-3"
          aria-label="Page navigation"
        >
          <CPaginationItem :disabled="currentPage === 1" @click="prevPage">
            Previous
          </CPaginationItem>
          <CPaginationItem
            v-for="page in totalPages"
            :key="page"
            :active="currentPage === page"
            @click="goToPage(page)"
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

    <!-- Detail Modal -->
    <CModal
      size="lg"
      :visible="showDetailModal"
      @close="showDetailModal = false"
    >
      <CModalHeader>
        <CModalTitle>Change Log Details</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div v-if="selectedLog">
          <CRow>
            <CCol :md="6">
              <h6>Previous State</h6>
              <pre class="p-2 bg-light">{{
                formatJson(selectedLog.old_data)
              }}</pre>
            </CCol>
            <CCol :md="6">
              <h6>New State</h6>
              <pre class="p-2 bg-light">{{
                formatJson(selectedLog.new_data || selectedLog)
              }}</pre>
            </CCol>
          </CRow>
          <div class="mt-3 small text-muted">
            <p>
              Modified by:
              {{
                getModalUserName(
                  selectedLog.updated_by || selectedLog.deleted_by
                )
              }}
            </p>
            <p>
              Date:
              {{ formatDate(selectedLog.updated_dt || selectedLog.deleted_dt) }}
            </p>
          </div>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="showDetailModal = false"
          >Close</CButton
        >
      </CModalFooter>
    </CModal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { format } from "date-fns";
import api from "@/apis/CommonAPI";
import TableLog from "../../components/pm/TableLog.vue";

export default {
  name: "ChangeLog",

  components: {
    TableLog,
  },

  data() {
    return {
      showDetailModal: false,
      selectedLog: null,
      localFilters: {
        dateRange: "last7days",
        entityType: "all",
        changeType: "all",
        modifiedBy: "all",
      },
      users: [],
      currentPage: 1,
      itemsPerPage: 5,
    };
  },

  computed: {
    ...mapGetters("changelog", [
      "filteredLogs",
      "isLoading",
      "hasError",
      "errorMessage",
      "currentFilters",
    ]),

    // Pagination computeds
    paginatedLogs() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredLogs.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredLogs.length / this.itemsPerPage);
    },
  },

  methods: {
    ...mapActions("changelog", [
      "loadEntityLogs",
      "updateFilters",
      "fetchUpdateComparison",
      "fetchDeleteComparison",
    ]),

    formatDate(date) {
      if (!date) return "-";

      try {
        // Check if it's a Unix timestamp in milliseconds (13 digits)
        if (typeof date === "number" && date.toString().length === 13) {
          return format(date, "yyyy-MM-dd HH:mm:ss");
        }

        // Otherwise treat as ISO string
        return format(new Date(date), "yyyy-MM-dd HH:mm:ss");
      } catch (error) {
        console.error("Invalid date:", date);
        return "-";
      }
    },

    formatJson(data) {
      return JSON.stringify(data, null, 2);
    },

    handleFilterChange() {
      this.updateFilters(this.localFilters);
      this.currentPage = 1; // Reset to first page when filters change
    },

    getModalUserName(userId) {
      const user = this.users.find((u) => u._id === userId);
      return user ? user.username : "Unknown User";
    },

    async viewDetails(log) {
      this.selectedLog = log;
      try {
        const comparison = await (log.type === "edit"
          ? this.fetchUpdateComparison({
              id: log.data_id || log._id,
              collection: log.collection,
            })
          : this.fetchDeleteComparison({
              id: log.data_id || log._id,
              collection: log.collection,
            }));

        if (comparison) {
          this.selectedLog = {
            ...this.selectedLog,
            ...comparison,
          };
        }

        this.showDetailModal = true;
      } catch (error) {
        console.error("Error fetching comparison:", error);
      }
    },

    async refreshLogs() {
      this.currentPage = 1;
      const collections = [
        "itemcheck",
        "tools",
        "kanban",
        "users",
        "spare_part",
        "machine",
        "station",
        "line",
      ];

      try {
        for (const collection of collections) {
          await this.loadEntityLogs(collection);
        }
      } catch (error) {
        console.error("Error refreshing logs:", error);
      }
    },

    async loadUsers() {
      try {
        const response = await api.get("/user/list-user", "?");
        if (response?.data?.status === 200) {
          this.users = response.data.data;
        }
      } catch (error) {
        console.error("Error loading users:", error);
      }
    },

    // Pagination methods
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

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },

  async created() {
    try {
      await Promise.all([this.refreshLogs(), this.loadUsers()]);
    } catch (error) {
      console.error("Error initializing change log:", error);
    }
  },

  beforeDestroy() {
    this.currentPage = 1;
  },

  watch: {
    filteredLogs() {
      // Reset to first page if current page is out of bounds
      if (this.currentPage > this.totalPages) {
        this.currentPage = 1;
      }
    },
  },
};
</script>
