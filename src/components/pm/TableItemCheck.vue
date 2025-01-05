<template>
  <CRow>
    <CCol>
      <CTable align="middle" responsive hover bordered>
        <CTableHead color="dark">
          <CTableRow>
            <CTableHeaderCell>Item Check Name</CTableHeaderCell>
            <CTableHeaderCell>Standard</CTableHeaderCell>
            <CTableHeaderCell>Min. Value</CTableHeaderCell>
            <CTableHeaderCell>Max. Value</CTableHeaderCell>
            <CTableHeaderCell>Unit</CTableHeaderCell>
            <CTableHeaderCell>Period</CTableHeaderCell>
            <CTableHeaderCell>Spare Part</CTableHeaderCell>
            <CTableHeaderCell>Tool</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-if="loading">
            <CTableDataCell class="text-center" colspan="9">
              <CSpinner component="span" size="sm" aria-hidden="true" />
              Loading...
            </CTableDataCell>
          </CTableRow>
          <CTableRow v-else-if="itemchecks.length <= 0">
            <CTableDataCell class="text-center" colspan="9"
              >Data not found</CTableDataCell
            >
          </CTableRow>
          <CTableRow v-for="itemcheck in itemchecks" :key="itemcheck._id">
            <CTableDataCell>{{ itemcheck.itemcheck_nm }}</CTableDataCell>
            <CTableDataCell>{{ itemcheck.std }}</CTableDataCell>
            <CTableDataCell>{{ itemcheck.min || "-" }}</CTableDataCell>
            <CTableDataCell>{{ itemcheck.max || "-" }}</CTableDataCell>
            <CTableDataCell>{{ itemcheck.unit || "-" }}</CTableDataCell>
            <CTableDataCell>{{
              getPeriodLabel(itemcheck.period)
            }}</CTableDataCell>
            <CTableDataCell>{{
              getSparePartName(itemcheck.spare_part_id)
            }}</CTableDataCell>
            <CTableDataCell>{{
              getToolName(itemcheck.tools_id)
            }}</CTableDataCell>
            <CTableDataCell class="d-flex gap-2 justify-content-center">
              <CButton
                color="info"
                class="text-white"
                size="sm"
                @click="openEditModal(itemcheck)"
                >Edit</CButton
              >
              <CButton
                color="danger"
                class="text-white"
                size="sm"
                @click="openDeleteModal(itemcheck)"
                >Delete</CButton
              >
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </CCol>
  </CRow>

  <!-- Edit Modal -->
  <Teleport to="body">
    <CModal size="lg" :visible="showEditModal" @close="closeEditModal">
      <CModalHeader>
        <CModalTitle>Edit Item Check</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CFormInput
            class="mb-3"
            v-model="selectedItemCheck.itemcheck_nm"
            label="Item Check Name"
            :state="isValidItemCheckName"
            :feedback="itemCheckNameFeedback"
            required
          />
          <CFormInput
            class="mb-3"
            v-model="selectedItemCheck.std"
            label="Standard"
            :state="isValidStandard"
            :feedback="standardFeedback"
            required
          />
          <CRow>
            <CCol :md="4">
              <CFormInput
                class="mb-3"
                type="number"
                step="0.1"
                v-model="selectedItemCheck.min"
                label="Min. Value"
              />
            </CCol>
            <CCol :md="4">
              <CFormInput
                class="mb-3"
                type="number"
                step="0.1"
                v-model="selectedItemCheck.max"
                label="Max. Value"
              />
            </CCol>
            <CCol :md="4">
              <CFormInput
                class="mb-3"
                v-model="selectedItemCheck.unit"
                label="Unit"
                :state="isValidUnit"
                :feedback="unitFeedback"
                :required="selectedItemCheck.min || selectedItemCheck.max"
              />
            </CCol>
          </CRow>
          <CFormSelect
            class="mb-3"
            v-model="selectedItemCheck.period"
            label="Period"
            :state="isValidPeriod"
            :feedback="periodFeedback"
            required
            :options="[
              { label: 'Select period', value: '' },
              { label: 'A - 1 Month', value: 'A' },
              { label: 'B - 3 Months', value: 'B' },
              { label: 'C - 6 Months', value: 'C' },
              { label: 'D - 1 Year', value: 'D' },
            ]"
          />
          <CFormSelect
            class="mb-3"
            v-model="selectedItemCheck.spare_part_id"
            label="Spare Part"
            :options="spareParts"
          />
          <CFormSelect
            class="mb-3"
            v-model="selectedItemCheck.tools_id"
            label="Tool"
            :options="tools"
          />
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closeEditModal"> Close </CButton>
        <CButton
          color="primary"
          @click="handleEditItemCheck"
          :disabled="!isFormValid || isSubmitting"
          >{{ isSubmitting ? "Updating..." : "Update" }}</CButton
        >
      </CModalFooter>
    </CModal>
  </Teleport>

  <!-- Delete Modal -->
  <Teleport to="body">
    <CModal :visible="showDeleteModal" @close="closeDeleteModal">
      <CModalHeader>
        <CModalTitle>Delete Item Check</CModalTitle>
      </CModalHeader>
      <CModalBody
        >Are you sure you want to delete this Item Check?
        <div class="mt-2 text-center fw-bold">
          {{ selectedItemCheck.itemcheck_nm }}
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closeDeleteModal">Close</CButton>
        <CButton
          color="primary"
          @click="handleDeleteItemCheck"
          :disabled="isSubmitting"
          >{{ isSubmitting ? "Deleting..." : "Delete" }}</CButton
        >
      </CModalFooter>
    </CModal>
  </Teleport>
</template>

<script>
import Swal from "sweetalert2";
import { mapState, mapActions, mapGetters } from "vuex";

export default {
  name: "TableItemCheck",
  props: {
    itemchecks: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    spareParts: {
      type: Array,
      default: () => [],
    },
    tools: {
      type: Array,
      default: () => [],
    },
    stationId: {
      type: String,
      required: true,
    },
  },

  emits: ["fetch-item-checks"],

  data() {
    return {
      showEditModal: false,
      showDeleteModal: false,
      isSubmitting: false,
      selectedItemCheck: {
        _id: "",
        itemcheck_nm: "",
        std: "",
        min: null,
        max: null,
        unit: "",
        period: "",
        spare_part_id: null,
        tools_id: null,
        part_id: "",
      },
    };
  },

  computed: {
    isValidItemCheckName() {
      return this.selectedItemCheck.itemcheck_nm?.trim().length > 0;
    },

    itemCheckNameFeedback() {
      if (!this.isValidItemCheckName) return "Itemcheck name is required";
      return "";
    },

    isValidStandard() {
      return this.selectedItemCheck.std?.trim().length > 0;
    },

    standardFeedback() {
      if (!this.isValidStandard) return "Standard is required";
      return "";
    },

    isValidPeriod() {
      return this.selectedItemCheck.period?.trim().length > 0;
    },

    periodFeedback() {
      if (!this.isValidPeriod) return "Period is required";
      return "";
    },

    isValidUnit() {
      if (this.selectedItemCheck.min || this.selectedItemCheck.max) {
        return this.selectedItemCheck.unit?.trim().length > 0;
      }
      return true;
    },

    unitFeedback() {
      if (!this.isValidUnit) return "Unit is required when min or max is set";
      return "";
    },

    isFormValid() {
      const hasRequiredFields =
        this.isValidItemCheckName && this.isValidStandard && this.isValidPeriod;

      // If min or max is provided, unit is required
      if (
        (this.selectedItemCheck.min || this.selectedItemCheck.max) &&
        !this.isValidUnit
      ) {
        return false;
      }
      return hasRequiredFields;
    },
  },

  methods: {
    ...mapActions("itemchecks", ["updateItemcheck", "deleteItemcheck"]),

    getPeriodLabel(period) {
      const periods = {
        A: "A - 1 Month",
        B: "B - 3 Months",
        C: "C - 6 Months",
        D: "D - 1 Year",
      };
      return periods[period] || period;
    },

    openEditModal(itemcheck) {
      this.selectedItemCheck = { ...itemcheck };
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.resetForm();
    },

    openDeleteModal(itemcheck) {
      this.selectedItemCheck = { ...itemcheck };
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.resetForm();
    },

    resetForm() {
      this.selectedItemCheck = {
        _id: "",
        itemcheck_nm: "",
        std: "",
        min: null,
        max: null,
        unit: "",
        period: "",
        spare_part_id: null,
        tools_id: null,
        part_id: "",
      };
      this.isSubmitting = false;
    },

    async handleEditItemCheck() {
      if (!this.isFormValid) {
        Swal.fire({
          title: "Error",
          text: "Please fill in all required fields correctly",
          icon: "error",
        });
        return;
      }

      this.isSubmitting = true;

      try {
        // Get user from localStorage for user_id
        const user = JSON.parse(localStorage.getItem("user"));

        const itemcheckData = {
          itemcheck_nm: this.selectedItemCheck.itemcheck_nm,
          std: this.selectedItemCheck.std,
          period: this.selectedItemCheck.period,
          min: this.selectedItemCheck.min
            ? Number(this.selectedItemCheck.min)
            : null,
          max: this.selectedItemCheck.max
            ? Number(this.selectedItemCheck.max)
            : null,
          unit: this.selectedItemCheck.unit,
          spare_part_id: this.selectedItemCheck.spare_part_id || null,
          tools_id: this.selectedItemCheck.tools_id || null,
          station_id: this.stationId,
          user_id: user?._id,
          part_id: this.selectedItemCheck.part_id,
        };

        console.log("Selected itemcheck ID:", this.selectedItemCheck._id);

        const success = await this.updateItemcheck({
          itemcheckId: this.selectedItemCheck._id,
          itemcheckData,
        });

        if (success) {
          this.$emit("fetch-item-checks");
          this.closeEditModal();
          Swal.fire({
            title: "Success",
            text: "Item check updated successfully",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        console.error("Error updating item check:", error);
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Failed to update item check",
          icon: "error",
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async handleDeleteItemCheck() {
      if (!this.selectedItemCheck?._id) return;

      // Store the ID before showing confirmation dialog
      const itemcheckId = this.selectedItemCheck._id;

      console.log("Selected item check for deletion:", {
        id: itemcheckId,
        itemcheck: this.selectedItemCheck,
      });

      try {
        const result = await Swal.fire({
          title: "Delete Item Check?",
          text: "This action cannot be undone!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
          this.isSubmitting = true;

          console.log(
            "Proceeding with deletion of item check ID:",
            itemcheckId
          );

          const success = await this.deleteItemcheck(itemcheckId);

          if (success) {
            this.$emit("fetch-item-checks");
            this.closeDeleteModal();
            Swal.fire({
              title: "Success",
              text: "Item check deleted successfully",
              icon: "success",
              timer: 2000,
              timerProgressBar: true,
            });
          }
        }
      } catch (error) {
        console.error("Error deleting item check:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to delete item check",
          icon: "error",
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    getToolName(toolId) {
      const tool = this.tools.find((t) => t.value === toolId);
      return tool ? tool.label : "-";
    },

    getSparePartName(sparePartId) {
      const sparePart = this.spareParts.find((sp) => sp.value === sparePartId);
      return sparePart ? sparePart.label : "-";
    },
  },
};
</script>
