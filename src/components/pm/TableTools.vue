<template>
  <div class="tool-table-container">
    <!-- Desktop/Tablet View -->
    <div class="desktop-view d-none d-md-block">
      <div class="table-scroll-container">
        <CTable align="middle" small hover bordered class="tool-table">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="w-10">Tool Name</CTableHeaderCell>
              <CTableHeaderCell class="w-10">Quantity</CTableHeaderCell>
              <CTableHeaderCell class="w-10">Status</CTableHeaderCell>
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
            <CTableRow v-else-if="tools.length <= 0">
              <CTableDataCell class="text-center" colspan="4"
                >Data not found</CTableDataCell
              >
            </CTableRow>
            <CTableRow v-else v-for="(item, index) in tools" :key="item._id">
              <CTableDataCell class="cell-content">{{
                item.tool_nm
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                item.quantity
              }}</CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <CBadge
                  :color="getStatusColor(item.status)"
                  shape="rounded-pill"
                >
                  {{ item.status }}</CBadge
                ></CTableDataCell
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
      <div v-else-if="tools.length <= 0" class="text-center p-3">
        Data not found.
      </div>
      <div
        v-else
        v-for="(item, index) in tools"
        :key="item._id"
        class="mobile-card"
      >
        <div class="mobile-card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ item.tool_nm }}</h5>
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
          <CModalTitle>Edit Tool</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div class="px-2">
            <CFormInput
              class="mb-3"
              v-model="editTool.tool_nm"
              label="Tool Name"
              :state="isValidToolName"
              :feedback="toolNameFeedback"
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
                  :disabled="editTool.quantity <= 0"
                >
                  <CIcon icon="cil-minus" />
                </CButton>
                <CFormInput
                  type="text"
                  inputmode="numeric"
                  v-model="editTool.quantity"
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
          <CModalTitle>Delete Tool</CModalTitle>
        </CModalHeader>
        <CModalBody
          >Are you sure you want to delete this tool?
          <div class="mt-2 text-center fw-bold">
            {{ selectedTool.tool_nm }}
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
  name: "TableTools",

  props: {
    tools: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    console.log("Initial tools in TableTools:", this.tools);
  },
  watch: {
    tools: {
      immediate: true,
      handler(newTools) {
        console.log("Tools prop updated:", newTools);
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
      selectedTool: null,
      selectedIndex: null,
      editTool: {
        tool_nm: "",
        quantity: "",
        station_id: "",
      },
      stockThresholds: {
        outOfStock: 0,
        lowStock: 5,
        inStock: 20,
      },
    };
  },

  computed: {
    isValidToolName() {
      return this.editTool.tool_nm && this.editTool.tool_nm.length > 0;
    },

    toolNameFeedback() {
      if (!this.isValidToolName) {
        return "Tool name is required";
      }
      return "";
    },

    isValidQuantity() {
      const quantity = Number(this.editTool.quantity);
      return !isNaN(quantity) && quantity >= 0;
    },

    quantityFeedback() {
      if (!this.editTool.quantity) {
        return "Quantity is required";
      }
      if (!this.isValidQuantity) {
        return "Quantity must be a positive number";
      }
      return "";
    },

    isFormValid() {
      return this.isValidToolName && this.isValidQuantity;
    },
  },

  methods: {
    ...mapActions("tools", ["updateTool", "deleteTool"]),

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
      this.selectedTool = { ...item };
      this.selectedIndex = index;
      this.editTool = {
        tool_nm: item.tool_nm,
        quantity: item.quantity,
        station_id: item.station_id,
      };
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.resetEditForm();
    },

    resetEditForm() {
      this.selectedTool = null;
      this.selectedIndex = null;
      this.editTool = {
        tool_nm: "",
        quantity: "",
        station_id: "",
      };
      this.isSubmitting = false;
    },

    async handleEditSubmit() {
      console.log("Form validation:", {
        isValidToolName: this.isValidToolName,
        isValidQuantity: this.isValidQuantity,
        isFormValid: this.isFormValid,
        editTool: this.editTool,
      });

      if (!this.selectedTool) return;

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
          tool_nm: this.editTool.tool_nm,
          quantity: parseInt(this.editTool.quantity),
        };

        const success = await this.updateTool({
          toolId: this.selectedTool._id,
          toolData: formattedData,
        });

        if (success) {
          await this.$emit("fetch-tools");
          this.closeEditModal();
          Swal.fire({
            title: "Success",
            text: "Tool updated successfully",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        console.error("Error updating tool:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to update tool. Please try again.",
          icon: "error",
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    openDeleteModal(item, index) {
      this.selectedTool = { ...item };
      this.selectedIndex = index;
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.selectedTool = null;
      this.selectedIndex = null;
      this.isSubmitting = false;
    },

    async handleDeleteConfirm() {
      if (!this.selectedTool) return;

      // Store the ID before showing confirmation dialog
      const toolId = this.selectedTool._id;

      console.log("Selected tool for deletion:", {
        id: toolId,
        tool: this.selectedTool,
      });

      try {
        const result = await Swal.fire({
          title: "Delete this Tool?",
          text: "This action cannot be undone!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
          this.isSubmitting = true;

          console.log("Proceeding with deletion of tool ID:", toolId);

          const success = await this.deleteTool(toolId);

          if (success) {
            this.$emit("fetch-tools");
            this.closeDeleteModal();
            Swal.fire({
              title: "Success",
              text: "Tool deleted successfully",
              icon: "success",
              timer: 2000,
              timerProgressBar: true,
            });
          }
        }
      } catch (error) {
        console.error("Error deleting tool:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to delete tool. Please try again.",
          icon: "error",
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    updateQuantity(value) {
      const parsedValue = parseInt(value) || 0;
      if (parsedValue >= 0) {
        this.selectedTool.quantity = parsedValue;
      }
    },

    getQuantityClass(quantity) {
      const value = parseInt(quantity);
      if (value <= this.stockThresholds.outOfStock) {
        return "quantity-out";
      } else if (value <= this.stockThresholds.lowStock) {
        return "quantity-low";
      } else {
        return "quantity-ok";
      }
    },

    incrementQuantity() {
      const currentQuantity = parseInt(this.editTool.quantity) || 0;
      this.editTool.quantity = currentQuantity + 1;
    },

    decrementQuantity() {
      const currentQuantity = parseInt(this.editTool.quantity) || 0;
      if (currentQuantity > 0) {
        this.editTool.quantity = currentQuantity - 1;
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
.tool-table-container {
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
.tool-table {
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
