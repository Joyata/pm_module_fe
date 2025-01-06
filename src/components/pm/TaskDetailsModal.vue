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
                  <div class="info-label">Scheduled Date</div>
                  <div class="info-value">
                    <template v-if="!isEditingDate">
                      <div
                        class="d-flex justify-content-between align-items-center"
                      >
                        <span>{{ formatDate(workOrder.date) }}</span>
                        <CButton
                          v-if="
                            workOrder.status === 'PLAN' ||
                            workOrder.status === 'DELAY'
                          "
                          color="info"
                          size="sm"
                          @click="startEditingDate"
                        >
                          <CIcon icon="cil-pencil" size="sm" />
                        </CButton>
                      </div>
                    </template>
                    <template v-else>
                      <CInputGroup size="sm">
                        <CFormInput
                          type="date"
                          v-model="editForm.date"
                          :min="minDate"
                          :disabled="loading"
                        />
                        <CButton
                          color="success"
                          @click="saveDate"
                          :disabled="loading"
                        >
                          <CSpinner v-if="loading" size="sm" />
                          <CIcon icon="cil-check" size="sm" />
                        </CButton>
                        <CButton
                          color="danger"
                          @click="cancelEditDate"
                          :disabled="loading"
                        >
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
                          :disabled="loading"
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
                        <CButton
                          color="success"
                          @click="saveAssignment"
                          :disabled="loading"
                        >
                          <CSpinner v-if="loading" size="sm" />
                          <CIcon icon="cil-check" size="sm" />
                        </CButton>
                        <CButton
                          color="danger"
                          @click="cancelEditAssignment"
                          :disabled="loading"
                        >
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
          :disabled="loading"
        >
          <CSpinner v-if="loading" size="sm" />
          <span>Mark as Delayed</span>
        </CButton>
        <CButton color="primary" @click="confirmDelete" :disabled="loading"
          >Delete</CButton
        >
      </div>
      <CButton color="secondary" @click="$emit('close')" :disabled="loading"
        >Close</CButton
      >
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
    ...mapGetters("schedule", ["getLoading"]),

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
      // Convert DD-MM-YYYY to YYYY-MM-DD for input
      if (this.workOrder.date) {
        const [day, month, year] = this.workOrder.date.split("-");
        this.editForm.date = `${year}-${month}-${day}`;
      } else {
        this.editForm.date = "";
      }
      this.isEditingDate = true;
      this.dateValidationMessage = "";
    },

    async saveDate() {
      try {
        if (!this.editForm.date) {
          this.dateValidationMessage = "Please select a date";
          return;
        }

        this.loading = true;
        console.log("Starting date update with form data:", this.editForm);

        // Convert YYYY-MM-DD to proper Date object
        const dateObj = new Date(this.editForm.date);

        // Adjust for GMT+7
        const jakartaOffset = 7 * 60;
        const localOffset = dateObj.getTimezoneOffset();
        const totalOffset = jakartaOffset + localOffset;

        dateObj.setMinutes(dateObj.getMinutes() + totalOffset);

        dateObj.setHours(7, 0, 0, 0);

        const formattedDate = dateObj.toISOString();

        console.log("Formatted date for API:", formattedDate);

        const success = await this.updateWorkOrder({
          workOrderId: this.workOrder._id,
          updates: {
            id: this.workOrder._id,
            data: {},
            date: formattedDate,
          },
        });

        console.log("Date update response:", success);

        if (success) {
          await Swal.fire({
            title: "Success",
            text: "Date updated successfully",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          this.$emit("refresh");
          this.handleClose();
        }
      } catch (error) {
        console.error("Error updating date:", error);
      } finally {
        this.loading = false;
      }
    },

    cancelEditDate() {
      this.isEditingDate = false;
      this.editForm.date = "";
      this.dateValidationMessage = "";
      this.loading = false;
    },

    // Assignment editing methods
    startEditingAssignment() {
      this.editForm.assignedTo = this.workOrder.assignedTo || "";
      this.isEditingAssignment = true;
    },

    async saveAssignment() {
      try {
        console.log("Starting assignment update:", {
          currentAssignedTo: this.workOrder.assignedTo,
          newAssignedTo: this.editForm.assignedTo,
        });

        if (!this.editForm.assignedTo) {
          await Swal.fire({
            title: "Error",
            text: "Please select a team member",
            icon: "error",
          });
          return;
        }

        this.loading = true;

        const updates = {
          id: this.workOrder._id,
          user_id: this.editForm.assignedTo || null,
        };

        console.log("Sending updates to store:", updates);

        const success = await this.updateWorkOrder({
          workOrderId: this.workOrder._id,
          updates,
        });

        console.log("Assignment update response:", success);

        if (success) {
          await Swal.fire({
            title: "Success",
            text: "Assignment updated successfully",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          this.$emit("refresh");
          this.handleClose();
        }
      } catch (error) {
        console.error("Error updating assignment:", error);
      } finally {
        this.loading = false;
      }
    },

    cancelEditAssignment() {
      this.isEditingAssignment = false;
      this.editForm.assignedTo = "";
      this.loading = false;
    },

    // Delay handling
    async markAsDelayed() {
      try {
        this.loading = true;
        console.log("Marking work order as delayed:", this.workOrder._id);

        const success = await this.updateWorkOrder({
          workOrderId: this.workOrder._id,
          updates: {
            id: this.workOrder._id,
            data: {},
            status: "DELAY",
          },
        });

        console.log("Mark as delayed response:", success);

        if (success) {
          await Swal.fire({
            title: "Success",
            text: "Work order marked as delayed",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          this.$emit("close");
          this.$emit("refresh");
        }
      } catch (error) {
        console.error("Error marking as delayed:", error);
      } finally {
        this.loading = false;
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

    handleClose() {
      this.loading = false;
      this.isEditingDate = false;
      this.isEditingAssignment = false;
      this.editForm = {
        date: "",
        assignedTo: "",
      };
      this.$emit("close");
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
    visible(newVal) {
      if (!newVal) {
        this.loading = false;
        this.isEditingDate = false;
        this.isEditingAssignment = false;
        this.editForm = {
          date: "",
          assignedTo: "",
        };
      }
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
