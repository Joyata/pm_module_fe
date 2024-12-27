<template>
  <div class="machine-table-container">
    <!-- Desktop/Tablet View -->
    <div class="desktop-view d-none d-md-block">
      <div class="table-scroll-container">
        <CTable align="middle" hover bordered class="machine-table">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="w-10">Machine Name</CTableHeaderCell>
              <CTableHeaderCell class="w-10">Part Name</CTableHeaderCell>
              <CTableHeaderCell class="w-10">Item Check</CTableHeaderCell>
              <CTableHeaderCell class="w-15">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-if="loading">
              <CTableDataCell class="text-center" colspan="4">
                <CSpinner component="span" size="sm" aria-hidden="true" />
                Loading...
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-else-if="tableData.length <= 0">
              <CTableDataCell class="text-center" colspan="4"
                >Data not found</CTableDataCell
              >
            </CTableRow>
            <CTableRow
              v-else
              v-for="item in tableData"
              :key="item._id + item.part_id"
            >
              <CTableDataCell class="cell-content">{{
                item.machine_nm
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                item.part_nm
              }}</CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <CButton
                  color="info"
                  class="text-white"
                  size="sm"
                  @click="handleItemCheck(item)"
                  :disabled="!item.part_id"
                  >Item Check</CButton
                >
              </CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <div class="d-flex gap-2 justify-content-center">
                  <CButton
                    color="success"
                    class="text-white btn-sm"
                    @click="openEditModal(item)"
                    >Edit</CButton
                  >
                  <CButton
                    color="danger"
                    class="text-white btn-sm"
                    @click="openDeleteModal(item)"
                    >Delete</CButton
                  >
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
      <div v-else-if="tableData.length <= 0" class="text-center p-3">
        Data not found.
      </div>
      <div
        v-else
        v-for="item in tableData"
        :key="item._id + item.part_id"
        class="mobile-card"
      >
        <div class="mobile-card-header">
          <h5 class="mb-0">{{ item.machine_nm }}</h5>
        </div>
        <div class="mobile-card-body">
          <div class="mobile-card-row">
            <div class="mobile-card-label">Part Name</div>
            <div class="mobile-card-value">{{ item.part_nm }}</div>
          </div>
          <div class="mobile-card-row">
            <div class="mobile-card-label">Item Check</div>
            <div class="mobile-card-value">
              <CButton
                color="info"
                class="text-white"
                size="sm"
                @click="emitItemCheck(item.part_nm, item.part_id)"
                >Item Check</CButton
              >
            </div>
          </div>

          <div class="mobile-card-actions mt-3">
            <div class="d-flex gap-2">
              <CButton
                color="success"
                class="text-white flex-grow-1"
                @click="openEditModal(item, index)"
                :disabled="isSubmitting"
              >
                Edit
              </CButton>
              <CButton
                color="danger"
                class="text-white flex-grow-1"
                @click="openDeleteModal(item, index)"
                :disabled="isSubmitting"
              >
                Delete
              </CButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <CModal size="lg" :visible="showEditModal" @close="closeEditModal">
        <CModalHeader>
          <CModalTitle>Edit Machine</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div class="px-2">
            <CFormInput
              class="mb-3"
              v-model="editMachine.machine_nm"
              label="Machine Name"
              :state="isValidMachineName"
              :feedback="machineNameFeedback"
              required
            />
            <CFormInput
              class="mb-3"
              v-model="editMachine.part_nm"
              label="Part Name"
              :state="isValidPartName"
              :feedback="partNameFeedback"
              required
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" @click="closeEditModal">Close</CButton>
          <CButton
            color="primary"
            @click="handleEditSubmit"
            :disabled="!isFormValid || isSubmitting"
            >{{ isSubmitting ? "Saving..." : "Update" }}</CButton
          >
        </CModalFooter>
      </CModal>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <CModal :visible="showDeleteModal" @close="closeDeleteModal">
        <CModalHeader>
          <CModalTitle>Delete Machine</CModalTitle>
        </CModalHeader>
        <CModalBody
          >Are you sure you want to delete this machine?
          <div class="mt-2 text-danger">
            This will also delete all associated parts.
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" @click="closeDeleteModal">Close</CButton>
          <CButton
            color="primary"
            @click="handleDeleteConfirm"
            :disabled="isSubmitting"
            >{{ isSubmitting ? "Deleting..." : "Delete" }}</CButton
          >
        </CModalFooter>
      </CModal>
    </Teleport>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import Swal from "sweetalert2";
import TableItemCheck from "../pm/TableItemCheck.vue";
import router from "../../router/index";

export default {
  name: "TableMachine",
  components: {
    TableItemCheck,
  },
  props: {
    machines: {
      type: Array,
      required: true,
    },
    stationId: {
      type: String,
      required: true,
    },
  },

  data: () => {
    return {
      isSubmitting: false,
      showEditModal: false,
      showDeleteModal: false,
      selectedMachine: null,
      editMachine: {
        machine_nm: "",
        part_nm: "",
        station_id: "",
      },
    };
  },

  computed: {
    ...mapState("machines", ["loading"]),
    ...mapGetters("machines", ["machinesWithParts"]),

    tableData() {
      return this.machines;
    },
    isValidMachineName() {
      return (
        this.editMachine.machine_nm && this.editMachine.machine_nm.length > 0
      );
    },

    machineNameFeedback() {
      if (!this.isValidMachineName) {
        return "Machine name is required.";
      }
      return "";
    },

    isValidPartName() {
      return this.editMachine.part_nm && this.editMachine.part_nm.length > 0;
    },

    partNameFeedback() {
      if (!this.isValidPartName) {
        return "Part name is required.";
      }
      return "";
    },

    isFormValid() {
      return this.isValidMachineName && this.isValidPartName;
    },
  },

  methods: {
    ...mapActions("machines", ["updateMachine", "deleteMachine"]),

    async handleRefresh() {
      this.$emit("refresh");
    },

    openEditModal(item) {
      this.selectedMachine = { ...item };
      this.editMachine = {
        machine_nm: item.machine_nm,
        part_nm: item.part_nm,
        station_id: item.station_id,
      };
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.resetEditForm();
    },

    resetEditForm() {
      this.selectedMachine = null;
      this.editMachine = {
        machine_nm: "",
        part_nm: "",
        station_id: "",
      };
      this.isSubmitting = false;
    },

    async handleEditSubmit() {
      console.log("Form validation:", {
        isValidMachineName: this.isValidMachineName,
        isValidPartName: this.isValidPartName,
        isFormValid: this.isFormValid,
        editMachine: this.editMachine,
      });

      if (!this.selectedMachine?._id) return;

      if (!this.isFormValid) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please fill in all required fields correctly",
        });
        return;
      }

      this.isSubmitting = true;

      try {
        const success = await this.updateMachine({
          machineId: this.selectedMachine._id,
          machineData: this.editMachine,
        });

        if (success) {
          this.closeEditModal();
          await this.refreshData();
          await Swal.fire({
            title: "Success",
            text: "Machine updated successfully",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        console.error("Error updating machine:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to update machine. Please try again.",
          icon: "error",
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    openDeleteModal(item) {
      this.selectedMachine = { ...item };
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.selectedMachine = null;
      this.isSubmitting = false;
    },

    async handleDeleteConfirm() {
      if (!this.selectedMachine?._id) {
        console.log("No machine selected or invalid machine ID");
        return;
      }

      // Store the ID before showing confirmation dialog
      const machineId = this.selectedMachine._id;

      console.log("Selected machine for deletion:", {
        id: machineId,
        machine: this.selectedMachine,
      });

      try {
        const result = await Swal.fire({
          title: "Delete this Machine?",
          text: "This action cannot be undone!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
          this.isSubmitting = true;
          console.log("Proceeding with deletion of machine ID:", machineId);
          const success = await this.deleteMachine(this.selectedMachine._id);

          if (success) {
            console.log("Delete successful, closing modal");
            this.closeDeleteModal();
            await this.refreshData();
            Swal.fire({
              title: "Success",
              text: "Machine deleted successfully",
              icon: "success",
              timer: 2000,
              timerProgressBar: true,
            });
          }
        }
      } catch (error) {
        console.error("Error deleting machine:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to delete machine. Please try again.",
          icon: "error",
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async handleItemCheck(item) {
      if (!item.part_id) {
        await Swal.fire({
          title: "Error",
          text: "No part associated with this machine",
          icon: "error",
        });
        return;
      }

      await router.push({
        name: "PMMasterItemCheck",
        params: { part_id: item.part_id },
        query: {
          part_nm: item.part_nm,
          machine_nm: item.machine_nm,
          machine_id: item._id,
          station_id: item.station_id,
        },
      });
    },
  },
};
</script>

<style scoped>
/* Container Styles */
.sop-table-container {
  width: 100%;
  position: relative;
}

/* Table Scroll Container */
.table-scroll-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

/* Table Styles */
.sop-table {
  margin-bottom: 0;
  white-space: nowrap;
  border-collapse: collapse;
  width: 100%;
}

/* Cell Content */
.cell-content {
  padding: 0.75rem !important;
  vertical-align: middle !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.w-10 {
  width: 10%;
}
.w-15 {
  width: 15%;
}
.w-20 {
  width: 20%;
}

/* Mobile Card Styles */
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

.mobile-card-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.875rem;
}

.mobile-value {
  color: #212529;
}

.mobile-card-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

/* Responsive Breakpoints */
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

@media (min-width: 768px) and (max-width: 991px) {
  .cell-content {
    padding: 0.5rem !important;
    font-size: 0.9rem;
  }
}

/* Scrollbar Styling */
.table-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.table-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.table-scroll-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.table-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
