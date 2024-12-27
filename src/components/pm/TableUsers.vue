<template>
  <div class="user-table-container">
    <!-- Desktop/Tablet View -->
    <div class="desktop-view d-none d-md-block">
      <div class="table-scroll-container">
        <CTable align="middle" small hover bordered class="user-table">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="w-15">Username</CTableHeaderCell>
              <CTableHeaderCell class="w-15">Role</CTableHeaderCell>
              <CTableHeaderCell class="w-20">Assignment</CTableHeaderCell>
              <CTableHeaderCell class="w-10">Status</CTableHeaderCell>
              <CTableHeaderCell class="w-20">Created Date</CTableHeaderCell>
              <CTableHeaderCell class="w-20">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-if="loading">
              <CTableDataCell class="text-center" colspan="6">
                <CSpinner component="span" size="sm" aria-hidden="true" />
                Loading...
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-else-if="users.length <= 0">
              <CTableDataCell class="text-center" colspan="6">
                No users found
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-else v-for="user in users" :key="user._id">
              <CTableDataCell class="cell-content">
                {{ user.username }}
              </CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <CBadge
                  :color="getRoleBadgeColor(user.role)"
                  shape="rounded-pill"
                >
                  {{ formatRole(user.role) }}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell class="cell-content">
                <div class="d-flex flex-column">
                  <small v-if="user.assignments?.plant" class="text-muted mb-1">
                    Plant:
                    {{ getResolvedName("plant", user.assignments.plant) }}
                  </small>
                  <small v-if="user.assignments?.shop" class="text-muted mb-1">
                    Shop: {{ getResolvedName("shop", user.assignments.shop) }}
                  </small>
                  <small v-if="user.assignments?.line" class="text-muted mb-1">
                    Line: {{ getResolvedName("line", user.assignments.line) }}
                  </small>
                  <small v-if="user.assignments?.station" class="text-muted">
                    Station:
                    {{ getResolvedName("station", user.assignments.station) }}
                  </small>
                </div>
              </CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <CBadge
                  :color="user.is_active ? 'success' : 'danger'"
                  shape="rounded-pill"
                >
                  {{ user.is_active ? "Active" : "Inactive" }}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell class="cell-content">
                {{ formatDate(user.created_dt) }}
              </CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <div class="d-flex gap-2 justify-content-center">
                  <CButton
                    color="info"
                    class="text-white btn-sm"
                    @click="$emit('edit-user', user)"
                    :disabled="isSubmitting"
                  >
                    <CIcon icon="cil-pencil" class="me-1" />
                    Edit
                  </CButton>
                  <CButton
                    color="danger"
                    class="text-white btn-sm"
                    @click="handleDelete(user)"
                    :disabled="
                      isSubmitting ||
                      user.role === 'admin' ||
                      (user.role === 'Admin' && user._id === currentUserId)
                    "
                  >
                    <CIcon icon="cil-trash" class="me-1" />
                    Delete
                  </CButton>
                </div>
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
      <div v-else-if="users.length <= 0" class="text-center p-3">
        No users found
      </div>
      <div v-else v-for="user in users" :key="user._id" class="mobile-card">
        <div class="mobile-card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ user.username }}</h5>
            <CBadge :color="getRoleBadgeColor(user.role)" shape="rounded-pill">
              {{ formatRole(user.role) }}
            </CBadge>
          </div>
        </div>
        <div class="mobile-card-body">
          <div class="mb-2">
            <div class="mobile-label">Status</div>
            <CBadge
              :color="user.is_active ? 'success' : 'danger'"
              shape="rounded-pill"
            >
              {{ user.is_active ? "Active" : "Inactive" }}
            </CBadge>
          </div>
          <div class="mb-2">
            <div class="mobile-label">Created Date</div>
            <div class="mobile-value">
              {{ formatDate(user.created_dt) }}
            </div>
          </div>
          <div class="mb-2" v-if="hasAssignments(user)">
            <div class="mobile-label">Assignments</div>
            <div class="mobile-value">
              <div v-if="user.assignments?.plant">
                Plant: {{ getResolvedName("plant", user.assignments.plant) }}
              </div>
              <div v-if="user.assignments?.shop">
                Shop: {{ getResolvedName("shop", user.assignments.shop) }}
              </div>
              <div v-if="user.assignments?.line">
                Line: {{ getResolvedName("line", user.assignments.line) }}
              </div>
              <div v-if="user.assignments?.station">
                Station:
                {{ getResolvedName("station", user.assignments.station) }}
              </div>
            </div>
          </div>
          <div class="mobile-card-actions">
            <div class="d-flex gap-2">
              <CButton
                color="info"
                class="text-white flex-grow-1"
                @click="$emit('edit-user', user)"
                :disabled="isSubmitting"
              >
                <CIcon icon="cil-pencil" class="me-1" />
                Edit
              </CButton>
              <CButton
                color="danger"
                class="text-white flex-grow-1"
                @click="handleDelete(user)"
                :disabled="
                  isSubmitting ||
                  (user.role === 'admin' && user._id === currentUserId)
                "
              >
                <CIcon icon="cil-trash" class="me-1" />
                Delete
              </CButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "TableUsers",
  props: {
    users: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    isSubmitting: {
      type: Boolean,
      required: true,
    },
    currentUserId: {
      type: String,
      default: () => JSON.parse(localStorage.getItem("user"))?._id,
    },
  },

  emits: ["edit-user", "delete-user"],

  computed: {
    ...mapGetters("user", ["getLocationName"]),
  },

  methods: {
    formatRole(role) {
      return role
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },

    getRoleBadgeColor(role) {
      const colors = {
        admin: "danger",
        team_leader: "warning",
        team_member: "info",
      };
      return colors[role] || "secondary";
    },

    formatDate(date) {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    hasAssignments(user) {
      return (
        user.assignments?.plant ||
        user.assignments?.shop ||
        user.assignments?.line ||
        user.assignments?.station
      );
    },

    getResolvedName(type, id) {
      console.log(`🔍 [getResolvedName] Getting name for ${type}:`, id);

      if (!id || typeof id !== "string" || !id.trim()) {
        console.log(`⚠️ [getResolvedName] Invalid ID for ${type}`);
        return "-";
      }

      const name = this.getLocationName(type, id);
      console.log(
        `📍 [getResolvedName] Retrieved name for ${type} ${id}:`,
        name
      );
      return name;
    },

    async handleDelete(user) {
      if (user.role === "admin" && user._id === this.currentUserId) {
        Swal.fire({
          title: "Error",
          text: "You cannot delete your own admin account",
          icon: "error",
        });
        return;
      }

      this.$emit("delete-user", user._id);
    },
  },

  mounted() {
    console.log("🚀 [TableUsers] Component mounted");
    console.log("Initial users:", this.users);

    this.users.forEach((user) => {
      if (user.assignments) {
        console.log(
          `📌 [TableUsers] Fetching locations for user:`,
          user.username
        );
        this.$store
          .dispatch("user/fetchUserLocationNames", user)
          .then((result) => {
            console.log(
              `✅ [TableUsers] Locations fetched for ${user.username}:`,
              result
            );
          })
          .catch((error) => {
            console.error(
              `❌ [TableUsers] Error fetching locations for ${user.username}:`,
              error
            );
          });
      }
    });
  },
};
</script>

<style scoped>
.user-table-container {
  width: 100%;
  position: relative;
}

.table-scroll-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.mobile-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.mobile-card-header {
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #dee2e6;
}

.mobile-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.mobile-value {
  color: #212529;
}

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
