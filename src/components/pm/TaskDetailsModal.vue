<template>
  <CModal :visible="visible" @close="$emit('close')" size="lg">
    <CModalHeader>
      <CModalTitle>Task Details</CModalTitle>
    </CModalHeader>

    <CModalBody>
      <template v-if="workOrder">
        <!-- Header Info -->
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="mb-0">{{ workOrder.kanbanNo }}</h5>
          <CBadge :color="getStatusColor(workOrder.status)">
            {{ workOrder.status }}
          </CBadge>
        </div>

        <!-- Basic Info Card -->
        <CCard class="mb-3">
          <CCardBody>
            <CRow>
              <!-- Machine Info -->
              <CCol :sm="6">
                <div class="info-item">
                  <div class="info-label">Machine</div>
                  <div class="info-value">{{ workOrder.machineName }}</div>
                </div>
              </CCol>

              <!-- Period Info -->
              <CCol :sm="6">
                <div class="info-item">
                  <div class="info-label">Period</div>
                  <div class="info-value">
                    {{ getPeriodLabel(workOrder.period) }}
                  </div>
                </div>
              </CCol>

              <!-- Date Section -->
              <CCol :sm="6">
                <div class="info-item">
                  <div class="info-label d-flex justify-content-between">
                    <span>Scheduled Date</span>
                    <CButton
                      v-if="
                        workOrder.status === 'PLAN' ||
                        (workOrder.status === 'DELAY' && !isEditingDate)
                      "
                      color="info"
                      size="sm"
                      @click="startEditingDate"
                    >
                      <CIcon icon="cil-pencil" size="sm" />
                    </CButton>
                  </div>
                  <div class="info-value">
                    <template v-if="!isEditingDate">
                      {{ formatDate(workOrder.date) }}
                    </template>
                    <template v-else>
                      <CInputGroup size="sm">
                        <CFormInput
                          type="date"
                          v-model="editForm.date"
                          :min="minDate"
                        />
                        <CButton color="success" @click="saveDate">
                          <CIcon icon="cil-check" size="sm" />
                        </CButton>
                        <CButton color="danger" @click="cancelEditDate">
                          <CIcon icon="cil-x" size="sm" />
                        </CButton>
                      </CInputGroup>
                      <div
                        v-if="dateValidationMessage"
                        class="text-danger small mt-1"
                      >
                        {{ dateValidationMessage }}
                      </div>
                    </template>
                  </div>
                </div>
              </CCol>

              <!-- Assignment Section -->
              <CCol :sm="6">
                <div class="info-item">
                  <div class="info-label">Assigned To</div>
                  <div class="info-value">
                    <template v-if="!isEditingAssignment">
                      <div
                        class="d-flex justify-content-between align-items-center"
                      >
                        <span>{{
                          workOrder.assignedTo
                            ? getTeamMemberName(workOrder.assignedTo)
                            : "Unassigned"
                        }}</span>
                        <CButton
                          v-if="
                            workOrder.status === 'PLAN' ||
                            workOrder.status === 'DELAY'
                          "
                          color="info"
                          size="sm"
                          @click="startEditingAssignment"
                        >
                          {{ workOrder.assignedTo ? "Change" : "Assign" }}
                        </CButton>
                      </div>
                    </template>
                    <template v-else>
                      <CInputGroup size="sm">
                        <CFormSelect
                          v-model="editForm.assignedTo"
                          :state="validationState.assignedTo"
                        >
                          <option value="">Select Team Member</option>
                          <option
                            v-for="member in availableTeamMembers"
                            :key="member._id"
                            :value="member._id"
                          >
                            {{ member.username }}
                          </option>
                        </CFormSelect>
                        <CButton color="success" @click="saveAssignment">
                          <CIcon icon="cil-check" size="sm" />
                        </CButton>
                        <CButton color="danger" @click="cancelEditAssignment">
                          <CIcon icon="cil-x" size="sm" />
                        </CButton>
                      </CInputGroup>
                    </template>
                  </div>
                </div>
              </CCol>
            </CRow>

            <!-- Schedule Info -->
            <div class="mt-4">
              <h6>Schedule Information</h6>
              <div class="schedule-info mt-2">
                <div class="info-item">
                  <div class="info-label">Last Check</div>
                  <div class="info-value">
                    {{ formatDate(workOrder.last_check_dt) }}
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">Next Check</div>
                  <div class="info-value">
                    {{ formatDate(workOrder.next_check_dt) }}
                  </div>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </template>
      <template v-else>
        <div class="text-center py-4">
          <div class="text-muted">No work order details available</div>
        </div>
      </template>
    </CModalBody>

    <CModalFooter class="d-flex justify-content-between">
      <div class="d-flex gap-2">
        <CButton
          v-if="workOrder?.status === 'PLAN'"
          color="danger"
          variant="outline"
          @click="markAsDelayed"
        >
          Mark as Delayed
        </CButton>
        <CButton color="primary" @click="confirmDelete">Delete</CButton>
      </div>
      <CButton color="secondary" @click="$emit('close')">Close</CButton>
    </CModalFooter>
  </CModal>
</template>

<script>
import { CButton } from "@coreui/vue";
import { mapGetters, mapActions } from "vuex";
import Swal from "sweetalert2";

export default {
  name: "TaskDetailsModal",

  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    workOrder: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      isEditingDate: false,
      isEditingAssignment: false,
      editForm: {
        date: "",
        assignedTo: "",
      },
      dateValidationMessage: "",
      validationState: {
        assignedTo: null,
      },
      loading: false,
    };
  },

  computed: {
    ...mapGetters("user", ["allUsers"]),
    ...mapGetters("schedule"),

    availableTeamMembers() {
      if (!this.workOrder) return [];

      return (
        this.allUsers?.filter((user) => {
          const isTeamMember = user.role === "team_member" && !user.deleted_by;
          const hasStationAssignment =
            user.assignments?.station === this.workOrder.station_id;
          const isTeamLeader = user.role === "team_leader";

          return isTeamMember && (hasStationAssignment || isTeamLeader);
        }) || []
      );
    },

    minDate() {
      const today = new Date();
      // Adjust for GMT+7
      const jakartaOffset = 7 * 60; // Jakarta offset in minutes
      const localOffset = today.getTimezoneOffset(); // Local offset in minutes
      const totalOffset = jakartaOffset + localOffset;

      // Adjust the date by adding the offset
      today.setMinutes(today.getMinutes() + totalOffset);

      // Format as YYYY-MM-DD for the date input
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },
  },

  methods: {
    ...mapActions("schedule", ["updateWorkOrder", "deleteWorkOrder"]),

    getStatusColor(status) {
      const colors = {
        PLAN: "warning",
        COMPLETED: "success",
        DELAY: "danger",
      };
      return colors[status] || "secondary";
    },

    getPeriodLabel(period) {
      const labels = {
        A: "A - 1 Month",
        B: "B - 3 Months",
        C: "C - 6 Months",
        D: "D - 1 Year",
      };
      return labels[period] || period;
    },

    formatDate(date) {
      if (!date) return "N/A";
      try {
        // Handle both YYYY-MM-DD and DD-MM-YYYY formats
        const d = new Date(date);
        if (isNaN(d.getTime())) {
          // Try DD-MM-YYYY format
          const [day, month, year] = date.split("-");
          return new Date(year, month - 1, day).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
        return d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch (error) {
        console.error("Error formatting date:", date, error);
        return "Invalid Date";
      }
    },

    formatDateForAPI(date) {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },

    getTeamMemberName(userId) {
      if (!userId) return "Unassigned";
      const user = this.allUsers?.find((u) => u._id === userId);
      return user ? user.username : "Unknown";
    },

    // Date editing methods
    startEditingDate() {
      this.editForm.date = this.workOrder.date;
      this.isEditingDate = true;
      this.dateValidationMessage = "";
    },

    async saveDate() {
      if (!this.editForm.date) {
        this.dateValidationMessage = "Please select a date";
        return;
      }

      // // Validate date based on period
      // if (
      //   !this.isDateValid(
      //     this.editForm.date,
      //     this.workOrder.period,
      //     this.workOrder.kanbanId
      //   )
      // ) {
      //   this.dateValidationMessage =
      //     "Selected date is too far from recommended maintenance date";
      //   return;
      // }

      try {
        const success = await this.updateWorkOrder({
          workOrderId: this.workOrder._id,
          updates: {
            work_dt: this.formatDateForAPI(this.editForm.date),
          },
        });

        if (success) {
          this.isEditingDate = false;
          this.$emit("refresh");
        }
      } catch (error) {
        console.error("Error updating date:", error);
      }
    },

    cancelEditDate() {
      this.isEditingDate = false;
      this.dateValidationMessage = "";
    },

    // Assignment editing methods
    startEditingAssignment() {
      this.editForm.assignedTo = this.workOrder.assignedTo || "";
      this.isEditingAssignment = true;
    },

    async saveAssignment() {
      try {
        const success = await this.updateWorkOrder({
          workOrderId: this.workOrder._id,
          updates: {
            user_id: this.editForm.assignedTo || null,
          },
        });

        if (success) {
          this.isEditingAssignment = false;
          this.$emit("refresh");
        }
      } catch (error) {
        console.error("Error updating assignment:", error);
      }
    },

    cancelEditAssignment() {
      this.isEditingAssignment = false;
      this.editForm.assignedTo = "";
    },

    // Delay handling
    async markAsDelayed() {
      try {
        const success = await this.updateWorkOrder({
          workOrderId: this.workOrder._id,
          updates: {
            status: "DELAY",
          },
        });

        if (success) {
          this.$emit("close");
          this.$emit("refresh");
        }
      } catch (error) {
        console.error("Error marking as delayed:", error);
      }
    },

    async confirmDelete() {
      const result = await Swal.fire({
        title: "Delete Work Order",
        text: "Are you sure you want to delete this work order?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
        cancelButtonText: "No, cancel",
      });

      if (result.isConfirmed) {
        const success = await this.deleteWorkOrder(this.workOrder._id);
        if (success) {
          this.$emit("close");
          this.$emit("refresh");
        }
      }
    },
  },

  watch: {
    workOrder: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal) {
          // Reset editing states when work order changes
          this.isEditingDate = false;
          this.isEditingAssignment = false;
          this.dateValidationMessage = "";
          this.editForm = {
            date: "",
            assignedTo: "",
          };
        }
      },
    },
  },
};
</script>

<style scoped>
.info-item {
  margin-bottom: 1rem;
}

.info-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.info-value {
  font-weight: 500;
}

.schedule-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
}

.input-group-sm {
  .form-control {
    height: calc(1.5em + 0.5rem + 2px);
  }
}
</style>
