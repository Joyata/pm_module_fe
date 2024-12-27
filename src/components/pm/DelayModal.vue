<template>
  <Teleport to="body">
    <!-- Delay Modal -->
    <CModal :visible="visible" @close="$emit('close')">
      <CModalHeader>
        <CModalTitle>Delay Item</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CInputGroup class="mb-3">
          <CInputGroupText
            id="PM6"
            style="width: 100px"
            class="justify-content-center"
            >Delay Reason</CInputGroupText
          >
          <CFormSelect
            v-model="selectedReason"
            placeholder="PM6"
            aria-label="PM6"
            aria-describedby="PM6"
            required
          >
            <option value="" disabled selected>Select Delay Reason</option>
            <option value="1">PM1 - MP Not Available</option>
            <option value="2">PM2 - Full Production</option>
            <option value="3">PM3 - Priority Recovery Problem</option>
            <option value="4">PM4 - Support External</option>
            <option value="5">PM5 - Tool Not Available</option>
            <option value="6">PM6 - PM Not Complete</option>
          </CFormSelect>
        </CInputGroup>
        <CFormTextarea
          v-model="delayReason"
          rows="2"
          placeholder="Enter the reason for the delay here"
        ></CFormTextarea>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="$emit('close')">Close</CButton>
        <CButton color="primary" @click="submitDelay">Submit</CButton>
      </CModalFooter>
    </CModal>
  </Teleport>
</template>

<script>
import Swal from "sweetalert2";

export default {
  name: "DelayModal",
  props: {
    visible: Boolean,
    task: Object,
  },
  emits: ["close", "submitDelay"],
  data() {
    return {
      delayReason: "",
      selectedReason: "",
    };
  },
  methods: {
    async submitDelay() {
      if (!this.selectedReason || !this.delayReason.trim()) {
        await Swal.fire({
          icon: "error",
          title: "Incomplete Form",
          text: "Please select a delay reason and provide a description.",
          confirmButtonText: "OK",
        });
        return;
      }
      const fullReason = `${this.selectedReason}: ${this.delayReason}`;
      // Show a confirmation dialog
      const result = await Swal.fire({
        icon: "warning",
        title: "Confirm Submission",
        text: "Are you sure you want to submit this delay reason?",
        showCancelButton: true,
        confirmButtonText: "Yes, submit",
        cancelButtonText: "No, keep editing",
      });

      if (result.isConfirmed) {
        this.$emit("submitDelay", fullReason);

        await Swal.fire({
          icon: "success",
          title: "Delay Submitted",
          text: "Your delay reason has been successfully submitted.",
          confirmButtonText: "OK",
        });

        // Reset the form but don't close the modal
        this.resetForm();
      }
      // If not confirmed, the modal stays open and no action is taken
    },
    resetForm() {
      this.delayReason = "";
      this.selectedReason = "";
    },
  },
};
</script>
