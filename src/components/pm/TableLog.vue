<!-- components/pm/TableLog.vue -->
<template>
  <div class="log-table-container">
    <!-- Desktop/Tablet View -->
    <div class="desktop-view d-none d-md-block">
      <div class="table-scroll-container">
        <CTable align="middle" small hover bordered class="log-table">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell>Timestamp</CTableHeaderCell>
              <CTableHeaderCell>Entity Type</CTableHeaderCell>
              <CTableHeaderCell>Change Type</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Modified By</CTableHeaderCell>
              <CTableHeaderCell>Details</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-if="isLoading">
              <CTableDataCell class="text-center" colspan="7">
                <CSpinner component="span" size="sm" aria-hidden="true" />
                Loading...
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-else-if="logs.length <= 0">
              <CTableDataCell class="text-center" colspan="7">
                No logs available
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-else v-for="log in logs" :key="log._id">
              <CTableDataCell class="cell-content">
                {{ formatDate(log.updated_dt || log.deleted_dt) }}
              </CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <CBadge
                  :color="getEntityColor(log.collection)"
                  shape="rounded-pill"
                >
                  {{ formatCollectionName(log.collection) }}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <CBadge
                  :color="log.type === 'edit' ? 'info' : 'danger'"
                  shape="rounded-pill"
                >
                  {{ log.type === "edit" ? "Updated" : "Deleted" }}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell class="cell-content">
                {{ getItemName(log) }}
              </CTableDataCell>
              <CTableDataCell class="cell-content">
                {{ getUserName(log.updated_by || log.deleted_by) }}
              </CTableDataCell>
              <CTableDataCell class="cell-content">
                <template
                  v-if="log.type === 'edit' && log.old_data && log.new_data"
                >
                  <div
                    v-for="(change, field) in getChanges(log)"
                    :key="field"
                    class="small"
                  >
                    <strong>{{ formatFieldName(field) }}:</strong>
                    <span class="text-danger text-decoration-line-through me-1">
                      {{ change.old || "none" }}
                    </span>
                    <span class="text-success">{{ change.new }}</span>
                  </div>
                </template>
                <span v-else-if="log.type === 'delete'" class="text-muted">
                  Item was deleted
                </span>
              </CTableDataCell>
              <CTableDataCell style="text-align: center">
                <CButton
                  color="info"
                  class="text-white btn-sm"
                  @click="$emit('view-details', log)"
                  :disabled="isLoading"
                >
                  <CIcon icon="cil-pencil" class="me-1" />
                  View
                </CButton>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>

    <!-- Mobile View -->
    <div class="mobile-view d-md-none">
      <div v-if="isLoading" class="text-center p-3">
        <CSpinner component="span" size="sm" aria-hidden="true" />
        Loading...
      </div>
      <div v-else-if="logs.length <= 0" class="text-center p-3">
        No logs available
      </div>
      <div v-else v-for="log in logs" :key="log._id" class="mobile-card">
        <div class="mobile-card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              {{ formatDate(log.updated_dt || log.deleted_dt) }}
            </h5>
            <CBadge
              :color="getEntityColor(log.collection)"
              shape="rounded-pill"
            >
              {{ formatCollectionName(log.collection) }}
            </CBadge>
          </div>
        </div>
        <div class="mobile-card-body">
          <div class="mobile-card-row">
            <div class="mobile-card-label">Change Type:</div>
            <div class="mobile-card-value">
              <CBadge
                :color="log.type === 'edit' ? 'info' : 'danger'"
                shape="rounded-pill"
              >
                {{ log.type === "edit" ? "Updated" : "Deleted" }}
              </CBadge>
            </div>
          </div>
          <div class="mobile-card-row">
            <div class="mobile-card-label">Name:</div>
            <div class="mobile-card-value">{{ getItemName(log) }}</div>
          </div>
          <div class="mobile-card-row">
            <div class="mobile-card-label">Modified By:</div>
            <div class="mobile-card-value">
              {{ getUserName(log.updated_by || log.deleted_by) }}
            </div>
          </div>
          <div class="mobile-card-row">
            <div class="mobile-card-label">Details:</div>
            <div class="mobile-card-value">
              <template
                v-if="log.type === 'edit' && log.old_data && log.new_data"
              >
                <div
                  v-for="(change, field) in getChanges(log)"
                  :key="field"
                  class="small"
                >
                  <strong>{{ formatFieldName(field) }}:</strong>
                  <span class="text-danger text-decoration-line-through me-1">
                    {{ change.old || "none" }}
                  </span>
                  <span class="text-success">{{ change.new }}</span>
                </div>
              </template>
              <span v-else-if="log.type === 'delete'" class="text-muted">
                Item was deleted
              </span>
            </div>
          </div>
        </div>
        <div class="mobile-card-footer mt-3">
          <CButton
            color="info"
            class="text-white w-100"
            @click="$emit('view-details', log)"
            :disabled="isLoading"
          >
            <CIcon icon="cil-pencil" class="me-1" />
            View Details
          </CButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { format } from "date-fns";

export default {
  name: "TableLog",

  props: {
    logs: {
      type: Array,
      required: true,
    },
    users: {
      type: Array,
      required: true,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
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

    formatCollectionName(collection) {
      return collection
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },

    formatFieldName(field) {
      return field
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },

    getEntityColor(collection) {
      const colors = {
        itemcheck: "purple",
        tools: "warning",
        kanban: "info",
        users: "success",
        spare_part: "danger",
        machine: "primary",
        station: "dark",
        line: "secondary",
      };
      return colors[collection] || "light";
    },

    getItemName(log) {
      const nameFields = {
        itemcheck: "itemcheck_nm",
        tools: "tool_nm",
        kanban: "kanban_nm",
        users: "username",
        spare_part: "spare_part_nm",
        machine: "machine_nm",
        station: "station_nm",
        line: "line_nm",
      };
      const field = nameFields[log.collection];
      return log.new_data?.[field] || log.old_data?.[field] || "Unknown";
    },

    getUserName(userId) {
      const user = this.users.find((u) => u._id === userId);
      return user ? user.username : "Unknown User";
    },

    getChanges(log) {
      const changes = {};
      const oldData = log.old_data || {};
      const newData = log.new_data || {};

      Object.keys({ ...oldData, ...newData }).forEach((key) => {
        if (oldData[key] !== newData[key]) {
          changes[key] = {
            old: oldData[key],
            new: newData[key],
          };
        }
      });

      return changes;
    },
  },
};
</script>

<style scoped>
.mobile-card-actions {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #dee2e6;
}

.cell-content {
  vertical-align: middle !important;
  padding: 0.75rem !important;
}

.w-10 {
  width: 10% !important;
}

.w-15 {
  width: 15% !important;
}

.w-20 {
  width: 20% !important;
}

@media (max-width: 767.98px) {
  .mobile-card {
    margin-left: -0.5rem;
    margin-right: -0.5rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
}

/* Badge styles */
.badge {
  padding: 0.5em 0.75em;
}

/* Table row hover effect */
.user-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
