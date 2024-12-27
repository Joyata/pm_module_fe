<template>
  <CModal :visible="visible" @close="$emit('close')" size="lg">
    <CModalHeader>
      <CModalTitle>Assign Work Order</CModalTitle>
    </CModalHeader>

    <CModalBody>
      <CForm @submit.prevent="handleSubmit">
        <CRow>
          <CCol :md="6" class="mb-3">
            <CFormLabel>Kanban</CFormLabel>
            <CFormSelect
              v-model="formData.kanban_id"
              :options="availableKanbans"
              :state="validationState.kanban_id"
              required
            />
            <CFormFeedback invalid>Please select a kanban</CFormFeedback>
          </CCol>

          <CCol :md="6" class="mb-3">
            <CFormLabel>Team Member</CFormLabel>
            <CFormSelect
              v-model="formData.user_id"
              :options="availableMembers"
              :state="validationState.user_id"
              required
            />
            <CFormFeedback invalid>Please select a team member</CFormFeedback>
          </CCol>
        </CRow>

        <CRow>
          <CCol :md="6" class="mb-3">
            <CFormLabel>Date</CFormLabel>
            <CFormInput
              type="date"
              v-model="formData.date"
              :state="validationState.date"
              :min="minDate"
              required
            />
            <CFormFeedback invalid>Please select a valid date</CFormFeedback>
          </CCol>

          <CCol :md="6" class="mb-3">
            <CFormLabel>Period</CFormLabel>
            <CFormSelect
              v-model="formData.period"
              :options="periodOptions"
              :state="validationState.period"
              required
            />
            <CFormFeedback invalid>Please select a period</CFormFeedback>
          </CCol>
        </CRow>

        <!-- Workload Warning -->
        <CAlert v-if="hasWorkloadWarning" color="warning">
          <CIcon icon="cil-warning" /> This assignment may exceed the
          recommended daily workload.
        </CAlert>
      </CForm>
    </CModalBody>

    <CModalFooter>
      <CButton color="secondary" @click="$emit('close')"> Cancel </CButton>
      <CButton
        color="primary"
        @click="handleSubmit"
        :disabled="loading || !isFormValid"
      >
        {{ loading ? "Assigning..." : "Assign Work Order" }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ScheduleAssignmentModal",

  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    selectedDate: {
      type: Date,
      default: () => new Date(),
    },
    selectedMP: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      loading: false,
      formData: {
        kanban_id: "",
        user_id: this.selectedMP,
        date: "",
        period: "",
      },
      validationState: {
        kanban_id: null,
        user_id: null,
        date: null,
        period: null,
      },
      periodOptions: [
        { value: "A", label: "A - 1 Month" },
        { value: "B", label: "B - 3 Months" },
        { value: "C", label: "C - 6 Months" },
        { value: "D", label: "D - 1 Year" },
      ],
    };
  },

  computed: {
    ...mapGetters("kanbans", ["allKanbans"]),
    ...mapGetters("users", ["teamMembers"]),

    availableKanbans() {
      return this.allKanbans.map((kanban) => ({
        value: kanban._id,
        label: kanban.kanban_nm,
      }));
    },

    availableMembers() {
      return this.teamMembers.map((member) => ({
        value: member._id,
        label: member.username,
      }));
    },

    minDate() {
      const today = new Date();
      return today.toISOString().split("T")[0];
    },

    isFormValid() {
      return Object.values(this.formData).every((value) => !!value);
    },

    hasWorkloadWarning() {
      const existingWorkload = this.$store.getters[
        "activities/getDailyWorkload"
      ](this.formData.date, this.formData.user_id);
      return existingWorkload >= 8;
    },
  },

  methods: {
    validateForm() {
      Object.keys(this.formData).forEach((key) => {
        this.validationState[key] = !!this.formData[key];
      });
      return Object.values(this.validationState).every((state) => state);
    },

    async handleSubmit() {
      if (!this.validateForm()) return;

      this.loading = true;
      try {
        const result = await this.$store.dispatch(
          "activities/addWorkOrder",
          this.formData
        );
        if (result) {
          this.$emit("submit");
          this.$emit("close");
        }
      } catch (error) {
        console.error("Error assigning work order:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
