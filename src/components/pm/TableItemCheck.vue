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
            required
          />
          <CFormInput
            class="mb-3"
            v-model="selectedItemCheck.std"
            label="Standard"
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
                :required="selectedItemCheck.min || selectedItemCheck.max"
              />
            </CCol>
          </CRow>
          <CFormSelect
            class="mb-3"
            v-model="selectedItemCheck.period"
            label="Period"
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
            v-model="selectedItemCheck.tools"
            label="Tool"
            :options="tools"
          />
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closeEditModal"> Close </CButton>
        <CButton color="primary" @click="editItemCheck">Update</CButton>
      </CModalFooter>
    </CModal>
  </Teleport>

  <!-- Delete Modal -->
  <Teleport to="body">
    <CModal :visible="showDeleteModal" @close="closeDeleteModal">
      <CModalHeader>
        <CModalTitle>Delete Item Check</CModalTitle>
      </CModalHeader>
      <CModalBody>Are you sure you want to delete this Item Check?</CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closeDeleteModal">Close</CButton>
        <CButton color="primary" @click="deleteItemCheck">Delete</CButton>
      </CModalFooter>
    </CModal>
  </Teleport>
</template>

<script>
import Swal from "sweetalert2";
import api from "../../apis/CommonAPI";

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

  // emits: ["fetch-ItemChecks"],

  data() {
    return {
      showEditModal: false,
      showDeleteModal: false,
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
    isFormValid() {
      const { itemcheck_nm, std, period } = this.selectedItemCheck;
      const hasRequiredFields =
        itemcheck_nm?.trim() && std?.trim() && period?.trim();

      // If min or max is provided, unit is required
      if (
        (this.selectedItemCheck.min || this.selectedItemCheck.max) &&
        !this.selectedItemCheck.unit
      ) {
        return false;
      }
      return hasRequiredFields;
    },
  },

  methods: {
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
      console.log(this.selectedItemCheck);
      this.showDeleteModal = true;
      console.log(this.showDeleteModal);
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
    },

    async editItemCheck() {
      if (!this.isFormValid) {
        Swal.fire({
          title: "Error",
          text: "Please fill in all required fields correctly",
          icon: "error",
        });
        return;
      }

      try {
        const payload = {
          id: this.selectedItemCheck._id,
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
        };

        const response = await api.put(
          `/itemcheck/edit-itemcheck?id=${this.selectedItemCheck._id}`,
          payload
        );

        if (response?.data?.status === 200) {
          this.$emit("fetch-ItemChecks");
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
      }
    },

    async deleteItemCheck() {
      try {
        const response = await api.delete(
          `/itemcheck/delete-itemcheck?id=${this.selectedItemCheck._id}`
        );

        if (response?.data?.status === 200) {
          this.$emit("fetch-ItemChecks");
          this.closeDeleteModal();
          Swal.fire({
            title: "Success",
            text: "Item check deleted successfully",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        console.error("Error deleting item check:", error);
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Failed to delete item check",
          icon: "error",
        });
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
