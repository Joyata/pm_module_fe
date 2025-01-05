<template>
  <div class="sparepart-table-container">
    <!-- Desktop/Tablet View -->
    <div class="desktop-view d-none d-md-block">
      <div class="table-scroll-container">
        <CTable align="middle" hover bordered class="sparepart-table">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="w-20">Spare Part Name</CTableHeaderCell>
              <CTableHeaderCell class="w-10">Quantity</CTableHeaderCell>
              <CTableHeaderCell class="w-10">Unit</CTableHeaderCell>
              <CTableHeaderCell class="w-10">Status</CTableHeaderCell>
              <CTableHeaderCell class="w-15">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-if="loading">
              <CTableDataCell class="text-center" colspan="5">
                <CSpinner component="span" size="sm" aria-hidden="true" />
                Loading...
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-else-if="spareparts.length <= 0">
              <CTableDataCell class="text-center" colspan="5"
                >Data not found</CTableDataCell
              >
            </CTableRow>
            <CTableRow
              v-else
              v-for="(item, index) in spareparts"
              :key="item._id"
            >
              <CTableDataCell class="cell-content">{{
                item.spare_part_nm
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                item.quantity
              }}</CTableDataCell>
              <CTableDataCell class="cell=content">{{
                item.unit
              }}</CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <CBadge
                  :color="getStatusColor(item.status)"
                  shape="rounded-pill"
                >
                  {{ item.status }}
                </CBadge></CTableDataCell
              >
              <CTableDataCell class="text-center cell-content">
                <div class="d-flex gap-2 justify-content-center">
                  <CButton
                    color="success"
                    class="text-white btn-sm"
                    @click="openEditModal(item, index)"
                    >Edit</CButton
                  >
                  <CButton
                    color="danger"
                    class="text-white btn-sm"
                    @click="openDeleteModal(item, index)"
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
      <div v-else-if="spareparts.length <= 0" class="text-center p-3">
        Data not found.
      </div>
      <div
        v-else
        v-for="(item, index) in spareparts"
        :key="item._id"
        class="mobile-card"
      >
        <div class="mobile-card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ item.spare_part_nm }}</h5>
            <CBadge :color="getStatusColor(item.status)" shape="rounded-pill">
              {{ item.status }}
            </CBadge>
          </div>
        </div>

        <div class="mobile-card-body">
          <div class="mobile-card-row">
            <span class="mobile-label">Quantity:</span>
            <span class="mobile-value">{{ item.quantity }}</span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-label">Unit:</span>
            <span class="mobile-value">{{ item.unit }}</span>
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
          <CModalTitle>Edit Sparepart</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div class="px-2">
            <CFormInput
              class="mb-3"
              v-model="editSparepart.spare_part_nm"
              label="Sparepart Name"
              :state="isValidSparepartName"
              :feedback="sparepartNameFeedback"
              required
            />

            <!-- Quantity Control -->
            <div class="form-group mb-3">
              <label>Quantity</label>
              <div class="quantity-control d-flex align-items-center">
                <CButton
                  color="danger"
                  variant="outline"
                  class="quantity-btn"
                  @click="decrementQuantity"
                  :disabled="editSparepart.quantity <= 0"
                >
                  <CIcon icon="cil-minus" />
                </CButton>
                <CFormInput
                  type="text"
                  inputmode="numeric"
                  v-model="editSparepart.quantity"
                  class="form-control-md text-center quantity-input mx-2"
                  min="0"
                  @input="(e) => updateQuantity(e.target.value)"
                ></CFormInput>
                <CButton
                  color="danger"
                  variant="outline"
                  class="quantity-btn"
                  @click="incrementQuantity"
                >
                  <CIcon icon="cil-plus" />
                </CButton>
              </div>
            </div>

            <CFormInput
              class="mb-3"
              v-model="editSparepart.unit"
              label="Unit"
              :state="isValidUnit"
              :feedback="unitFeedback"
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
          <CModalTitle>Delete Sparepart</CModalTitle>
        </CModalHeader>
        <CModalBody
          >Are you sure you want to delete this sparepart?
          <div class="mt-2 text-center fw-bold">
            {{ selectedSparepart.spare_part_nm }}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" @click="closeDeleteModal">Cancel</CButton>
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
import { mapActions } from "vuex";
import Swal from "sweetalert2";

export default {
  name: "TableSparepart",
  props: {
    spareparts: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    console.log("Initial spareparts in TableSparepart:", this.spareparts);
  },
  watch: {
    spareparts: {
      immediate: true,
      handler(newSpareparts) {
        console.log("Spareparts prop updated:", newSpareparts);
      },
      deep: true,
    },
  },

  data: () => {
    return {
      loading: false,
      isSubmitting: false,
      showEditModal: false,
      showDeleteModal: false,
      selectedSparepart: null,
      selectedIndex: null,
      editSparepart: {
        spare_part_nm: "",
        quantity: "",
        unit: "",
        station_id: "",
      },
      stockThresholds: {
        outOfStock: 0,
        lowStock: 5,
        inStock: 20, // New threshold for "In Stock" status
      },
    };
  },

  computed: {
    isValidSparepartName() {
      return (
        this.editSparepart.spare_part_nm &&
        this.editSparepart.spare_part_nm.length > 0
      );
    },

    sparepartNameFeedback() {
      if (!this.isValidSparepartName) {
        return "Sparepart name is required.";
      }
      return "";
    },

    isValidQuantity() {
      const quantity = Number(this.editSparepart.quantity);
      return !isNaN(quantity) && quantity >= 0;
    },

    quantityFeedback() {
      if (!this.editSparepart.quantity) {
        return "Quantity is required.";
      }
      if (!this.isValidQuantity) {
        return "Quantity must be a positive number.";
      }
      return "";
    },

    isValidUnit() {
      return this.editSparepart.unit && this.editSparepart.unit.length > 0;
    },

    unitFeedback() {
      if (!this.isValidUnit) {
        return "Unit is required.";
      }
      return "";
    },

    isFormValid() {
      return (
        this.isValidSparepartName && this.isValidQuantity && this.isValidUnit
      );
    },
  },
  methods: {
    ...mapActions("spareparts", ["updateSparepart", "deleteSparepart"]),

    getStatusColor(status) {
      switch (status) {
        case "In Stock":
          return "info";
        case "Low Stock":
          return "warning";
        case "Out of Stock":
          return "danger";
        default:
          return "secondary";
      }
    },

    openEditModal(item, index) {
      this.selectedSparepart = { ...item };
      this.selectedIndex = index;
      this.editSparepart = {
        spare_part_nm: item.spare_part_nm,
        quantity: item.quantity,
        unit: item.unit,
        station_id: item.station_id,
      };
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.resetEditForm();
    },

    resetEditForm() {
      this.selectedSparepart = null;
      this.selectedIndex = null;
      this.editSparepart = {
        spare_part_nm: "",
        quantity: "",
        unit: "",
        station_id: "",
      };
      this.isSubmitting = false;
    },

    async handleEditSubmit() {
      console.log("Form validation:", {
        isValidSparepartName: this.isValidSparepartName,
        isValidQuantity: this.isValidQuantity,
        isValidUnit: this.isValidUnit,
        isFormValid: this.isFormValid,
        editSparepart: this.editSparepart,
      });

      if (!this.selectedSparepart) return;

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
        const formattedData = {
          spare_part_nm: this.editSparepart.spare_part_nm,
          quantity: parseInt(this.editSparepart.quantity),
          unit: this.editSparepart.unit,
        };

        const success = await this.updateSparepart({
          sparepartId: this.selectedSparepart._id,
          sparepartData: formattedData,
        });

        if (success) {
          await this.$emit("fetch-spareparts");
          this.closeEditModal();
          Swal.fire({
            title: "Success",
            text: "Sparepart updated successfully",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        console.error("Error updating sparepart:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to update sparepart. Please try again.",
          icon: "error",
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    openDeleteModal(item, index) {
      this.selectedSparepart = { ...item };
      this.selectedIndex = index;
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.selectedSparepart = null;
      this.selectedIndex = null;
      this.isSubmitting = false;
    },

    async handleDeleteConfirm() {
      if (!this.selectedSparepart) return;

      // Store the ID before showing confirmation dialog
      const sparepartId = this.selectedSparepart._id;

      console.log("Selected sparepart for deletion:", {
        id: sparepartId,
        sparepart: this.selectedSparepart,
      });

      try {
        const result = await Swal.fire({
          title: "Delete this Sparepart?",
          text: "This action cannot be undone!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
          this.isSubmitting = true;

          console.log("Proceeding with deletion of sparepart ID:", sparepartId);

          const success = await this.deleteSparepart(sparepartId);

          if (success) {
            await this.$emit("fetch-spareparts");
            this.closeDeleteModal();
            Swal.fire({
              title: "Success",
              text: "Sparepart deleted successfully",
              icon: "success",
              timer: 2000,
              timerProgressBar: true,
            });
          }
        }
      } catch (error) {
        console.error("Error deleting sparepart:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to delete sparepart. Please try again.",
          icon: "error",
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    updateQuantity(value) {
      const parsedValue = parseInt(value) || 0;
      if (parsedValue >= 0) {
        this.selectedSparepart.quantity = parsedValue;
      }
    },

    getQuantityClass(quantity) {
      const value = parseInt(quantity);
      if (value <= this.stockThresholds.outOfStock) {
        return "quantity-out";
      } else if (value <= this.stockThresholds.lowStock) {
        return "quantity-low";
      }
      return "quantity-ok";
    },

    // Add visual feedback when updating quantity
    incrementQuantity() {
      const currentQuantity = parseInt(this.editSparepart.quantity) || 0;
      this.editSparepart.quantity = currentQuantity + 1;
    },

    decrementQuantity() {
      const currentQuantity = parseInt(this.editSparepart.quantity) || 0;
      if (currentQuantity > 0) {
        this.editSparepart.quantity = currentQuantity - 1;
      }
    },

    showQuantityFeedback(action) {
      const input = document.querySelector(".quantity-input");
      if (input) {
        input.classList.add(`quantity-${action}`);
        setTimeout(() => {
          input.classList.remove(`quantity-${action}`);
        }, 200);
      }
    },
  },
};
</script>

<style scoped>
/* Quantity Status Colors */
.quantity-out {
  color: #dc3545 !important;
  font-weight: 600;
}

.quantity-low {
  color: #ffc107 !important;
  font-weight: 600;
}

.quantity-ok {
  color: #198754 !important;
  font-weight: 600;
}

/* Quantity Input Animation */
.quantity-increment {
  animation: pulse-green 0.2s ease-in-out;
}

.quantity-decrement {
  animation: pulse-red 0.2s ease-in-out;
}

@keyframes pulse-green {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(25, 135, 84, 0.1);
  }
  100% {
    background-color: transparent;
  }
}

@keyframes pulse-red {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(220, 53, 69, 0.1);
  }
  100% {
    background-color: transparent;
  }
}

/* Quantity Control Styles */
.quantity-control {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-input {
  width: 100px !important;
  text-align: center;
  font-weight: 600;
  transition: all 0.2s ease;
}

.quantity-input:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.quantity-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Status Badge Colors */
.status-badge {
  padding: 0.5rem 1rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge [class^="cil-"] {
  font-size: 1rem;
}

/* Threshold Indicators */
.threshold-indicator {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: #6c757d;
}

/* Container Styles */
.sparepart-table-container {
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
.sparepart-table {
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
