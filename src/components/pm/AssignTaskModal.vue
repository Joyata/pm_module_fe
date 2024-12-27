<template>
  <CModal :visible="visible" @close="$emit('close')" size="lg">
    <CModalHeader>
      <CModalTitle>Assign Maintenance Task</CModalTitle>
    </CModalHeader>

    <CModalBody>
      <CForm @submit.prevent="handleSubmit">
        <CRow>
          <!-- Kanban Selection -->
          <CCol :xs="12" class="mb-3">
            <CFormLabel>Kanban</CFormLabel>
            <CFormSelect
              v-model="formData.kanban_id"
              :state="validationState.kanban_id"
              required
              @change="handleKanbanChange"
            >
              <option value="" disabled>Select Kanban</option>
              <optgroup
                v-for="(kanbans, period) in groupedKanbans"
                :key="period"
                :label="getPeriodLabel(period)"
              >
                <option
                  v-for="kanban in kanbans"
                  :key="kanban._id"
                  :value="kanban._id"
                >
                  {{
                    kanban.kanban_nm +
                    (kanban.machine_nm ? ` - ${kanban.machine_nm}` : "")
                  }}
                </option>
              </optgroup>
            </CFormSelect>
            <CFormFeedback invalid>Please select a kanban</CFormFeedback>
          </CCol>

          <!-- Team Member Selection -->
          <CCol :md="6" class="mb-3">
            <CFormLabel>Assign To (Optional)</CFormLabel>
            <CFormSelect
              v-model="formData.user_id"
              :state="validationState.user_id"
            >
              <option value="">Unassigned</option>
              <option
                v-for="member in availableTeamMembers"
                :key="member._id"
                :value="member._id"
              >
                {{ member.username }}
              </option>
            </CFormSelect>
          </CCol>

          <!-- Date Selection -->
          <CCol :md="6" class="mb-3">
            <CFormLabel>Scheduled Date</CFormLabel>
            <CFormInput
              type="date"
              v-model="formData.date"
              :state="validationState.date"
              :min="minDate"
              required
              @change="validateDate"
            />
            <CFormFeedback invalid>Please select a valid date</CFormFeedback>
          </CCol>
        </CRow>

        <!-- Selected Kanban Details -->
        <CAlert v-if="selectedKanban" color="info" class="mt-3">
          <div class="mb-2">
            <strong>Machine:</strong> {{ selectedKanban?.machine_nm }}
          </div>
          <div class="mb-2">
            <strong>Period:</strong> {{ getPeriodLabel(selectedKanban.period) }}
          </div>
          <div class="mb-2">
            <strong>Last Check:</strong>
            {{ formatDate(selectedKanban.last_check_dt) }}
          </div>
          <div>
            <strong>Recommended Next Check:</strong>
            {{ formatDate(selectedKanban.next_check_dt) }}
          </div>
        </CAlert>

        <!-- Date Warning -->
        <CAlert v-if="dateValidationMessage" color="warning" class="mt-3">
          <CIcon icon="cil-warning" /> {{ dateValidationMessage }}
        </CAlert>
      </CForm>
    </CModalBody>

    <CModalFooter>
      <CButton color="secondary" @click="$emit('close')">Cancel</CButton>
      <CButton
        color="primary"
        @click="handleSubmit"
        :disabled="loading || !isFormValid || hasDateWarning"
      >
        <CSpinner v-if="loading" size="sm" component="span" class="me-2" />
        {{ loading ? "Creating..." : "Create Task" }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
  name: "AssignTaskModal",

  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    selectedDate: {
      type: Date,
      default: null,
    },
  },

  data() {
    return {
      loading: false,
      formData: {
        kanban_id: "",
        user_id: "",
        date: this.selectedDate
          ? this.selectedDate.toISOString().split("T")[0]
          : "",
        status: "PLAN",
      },
      validationState: {
        kanban_id: null,
        user_id: null,
        date: null,
      },
      dateValidationMessage: "",
    };
  },

  computed: {
    ...mapState("schedule", ["kanbans"]),
    ...mapGetters("user", ["allUsers"]),

    availableTeamMembers() {
      if (!this.kanbans.length) return [];

      // Get station_id from the first kanban since they're all from same station
      const station_id = this.kanbans[0].station_id;

      return (
        this.allUsers?.filter((user) => {
          const isTeamMember = user.role === "team_member" && !user.deleted_by;
          const hasStationAssignment = user.assignments?.station === station_id;
          const isTeamLeader = user.role === "team_leader";

          return isTeamMember && (hasStationAssignment || isTeamLeader);
        }) || []
      );
    },

    selectedKanban() {
      const selectedKanban = this.kanbans.find(
        (k) => k._id === this.formData.kanban_id
      );
      console.log("Selected kanban:", selectedKanban);
      return selectedKanban;
    },

    groupedKanbans() {
      return this.kanbans.reduce((groups, kanban) => {
        if (!groups[kanban.period]) {
          groups[kanban.period] = [];
        }
        // Ensure machine_nm is properly accessed
        const enhancedKanban = {
          ...kanban,
          machine_nm: kanban.machine?.machine_nm || kanban.machine_nm,
        };
        groups[kanban.period].push(enhancedKanban);
        return groups;
      }, {});
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

    isFormValid() {
      return (
        this.formData.kanban_id &&
        this.formData.date &&
        this.validationState.kanban_id !== false &&
        this.validationState.date !== false
      );
    },

    hasDateWarning() {
      return !!this.dateValidationMessage;
    },
  },

  methods: {
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
        const d = new Date(date);
        return d.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch (error) {
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

    handleKanbanChange() {
      console.log("Kanban changed to:", this.formData.kanban_id);

      // Set validation state for kanban
      this.validationState.kanban_id = !!this.formData.kanban_id;

      // Get selected kanban details
      const selectedKanban = this.kanbans.find(
        (k) => k._id === this.formData.kanban_id
      );
      console.log("Selected kanban:", selectedKanban);

      if (selectedKanban) {
        this.validateDate();
      }
    },

    validateDate() {
      if (!this.formData.date || !this.formData.kanban_id) {
        this.dateValidationMessage = "";
        return;
      }

      // Basic date validation
      const selectedDate = new Date(this.formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Basic date validation
      if (selectedDate < today) {
        this.dateValidationMessage = "Cannot select past dates";
        this.validationState.date = false;
        return;
      }

      // If we have a selected kanban with next check date, provide guidance
      if (this.selectedKanban?.next_check_dt) {
        const nextCheckDate = new Date(this.selectedKanban.next_check_dt);
        const daysDiff =
          Math.abs(selectedDate - nextCheckDate) / (1000 * 60 * 60 * 24);

        // Allow scheduling within a reasonable window based on period
        const allowedDays =
          {
            A: 7, // Monthly: ±7 days
            B: 14, // Quarterly: ±14 days
            C: 21, // Semi-Annual: ±21 days
            D: 30, // Annual: ±30 days
          }[this.selectedKanban.period] || 7;

        if (daysDiff > allowedDays) {
          this.dateValidationMessage =
            "Selected date is too far from recommended maintenance date";
          this.validationState.date = false;
          return;
        }
      }

      this.dateValidationMessage = "";
      this.validationState.date = true;
    },

    async handleSubmit() {
      if (!this.isFormValid) return;

      this.loading = true;
      try {
        const taskData = {
          kanban_id: this.formData.kanban_id,
          user_id: this.formData.user_id || null,
          date: this.formatDateForAPI(this.formData.date),
          status: "PLAN",
        };

        await this.$emit("submit", taskData);
        this.resetForm();
      } catch (error) {
        console.error("Error creating task:", error);
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.formData = {
        kanban_id: "",
        user_id: "",
        date: this.selectedDate
          ? this.selectedDate.toISOString().split("T")[0]
          : "",
        status: "PLAN",
      };
      this.validationState = {
        kanban_id: null,
        user_id: null,
        date: null,
      };
      this.dateValidationMessage = "";
    },
  },

  watch: {
    selectedDate(newDate) {
      if (newDate) {
        this.formData.date = newDate.toISOString().split("T")[0];
        this.validateDate();
      }
    },

    visible(newValue) {
      if (!newValue) {
        this.resetForm();
      }
    },
  },
};
</script>

<style scoped>
.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.alert {
  margin-bottom: 0;
}

optgroup {
  font-weight: 600;
}

optgroup option {
  font-weight: normal;
  padding-left: 1rem;
}
</style>
