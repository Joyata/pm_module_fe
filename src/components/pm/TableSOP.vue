<template>
  <div class="sop-table-container">
    <!-- Desktop/Tablet View -->
    <div class="desktop-view d-none d-md-block">
      <div class="table-scroll-container">
        <CTable align="middle" hover bordered class="sop-table">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="w-10">SOP ID</CTableHeaderCell>
              <CTableHeaderCell class="w-15">SOP Name</CTableHeaderCell>
              <CTableHeaderCell class="w-20">Description</CTableHeaderCell>
              <CTableHeaderCell class="w-10">Created Date</CTableHeaderCell>
              <CTableHeaderCell class="w-10">Last Updated</CTableHeaderCell>
              <CTableHeaderCell class="w-10">PDF File</CTableHeaderCell>
              <CTableHeaderCell class="w-10">Status</CTableHeaderCell>
              <CTableHeaderCell class="w-15">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-if="loading">
              <CTableDataCell class="text-center" colspan="8">
                <CSpinner component="span" size="sm" aria-hidden="true" />
                Loading...
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-else-if="SOPs.length <= 0">
              <CTableDataCell class="text-center" colspan="8"
                >Data not found.</CTableDataCell
              >
            </CTableRow>
            <CTableRow v-for="(item, index) in SOPs" :key="index">
              <CTableDataCell class="cell-content">{{
                item.sopId
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                item.sopName
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                item.description
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                item.createdDate
              }}</CTableDataCell>
              <CTableDataCell class="cell-content">{{
                item.lastUpdated
              }}</CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <a :href="item.pdfUrl" target="_blank">View PDF</a>
              </CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <CBadge
                  :color="getStatusColor(item.status)"
                  shape="rounded-pill"
                >
                  {{ item.status }}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell class="text-center cell-content">
                <div class="d-flex gap-2 justify-content-center">
                  <CButton
                    color="success"
                    class="text-white btn-sm"
                    @click="openEditModal(item, index)"
                  >
                    Edit
                  </CButton>
                  <CButton
                    color="danger"
                    class="text-white btn-sm"
                    @click="openDeleteModal(item, index)"
                  >
                    Delete
                  </CButton>
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
      <div v-else-if="SOPs.length <= 0" class="text-center p-3">
        Data not found.
      </div>
      <div
        v-else
        v-for="(item, index) in SOPs"
        :key="index"
        class="mobile-card"
      >
        <div class="mobile-card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ item.sopName }}</h5>
            <CBadge :color="getStatusColor(item.status)" shape="rounded-pill">
              {{ item.status }}
            </CBadge>
          </div>
          <div class="text-muted small">ID: {{ item.sopId }}</div>
        </div>

        <div class="mobile-card-body">
          <div class="mobile-card-row">
            <span class="mobile-label">Description:</span>
            <span class="mobile-value">{{ item.description }}</span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-label">Created Date:</span>
            <span class="mobile-value">{{ item.createdDate }}</span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-label">Last Updated:</span>
            <span class="mobile-value">{{ item.lastUpdated }}</span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-label">PDF File:</span>
            <a :href="item.pdfUrl" target="_blank" class="mobile-value"
              >View PDF</a
            >
          </div>

          <div class="mobile-card-actions mt-3">
            <div class="d-flex gap-2">
              <CButton
                color="success"
                class="text-white flex-grow-1"
                @click="openEditModal(item, index)"
              >
                Edit
              </CButton>
              <CButton
                color="danger"
                class="text-white flex-grow-1"
                @click="openDeleteModal(item, index)"
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
      <CModal
        size="lg"
        :visible="showEditModal"
        @close="
          () => {
            showEditModal = false;
          }
        "
      >
        <CModalHeader>
          <CModalTitle>Edit SOP</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CInputGroup
            v-for="(field, key) in selectedSOPFields"
            :key="key"
            class="mb-3"
          >
            <CInputGroupText
              :id="key"
              style="width: 100px"
              class="justify-content-center"
              >{{ field.label }}</CInputGroupText
            >
            <CFormSelect
              v-if="key === 'status'"
              :placeholder="field.label"
              :aria-label="field.label"
              :aria-describedby="key"
              v-model="selectedSop[key]"
              required
            >
              <option value="" disabled selected>Select Status</option>
              <option
                v-for="option in field.options"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </CFormSelect>
            <CFormInput
              v-else
              :placeholder="field.label"
              :aria-label="field.label"
              :aria-describedby="key"
              v-model="selectedSop[key]"
              required
            >
            </CFormInput>
          </CInputGroup>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            @click="
              () => {
                showEditModal = false;
              }
            "
            >Close</CButton
          >
          <CButton color="primary" @click="editSOP(item)">Save</CButton>
        </CModalFooter>
      </CModal>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <CModal
        :visible="showDeleteModal"
        @close="
          () => {
            showDeleteModal = false;
          }
        "
      >
        <CModalHeader>
          <CModalTitle>Delete SOP</CModalTitle>
        </CModalHeader>
        <CModalBody>Are you sure you want to delete this SOP?</CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            @click="
              () => {
                showDeleteModal = false;
              }
            "
            >Close</CButton
          >
          <CButton color="primary" @click="deleteSOP(item)">Delete</CButton>
        </CModalFooter>
      </CModal>
    </Teleport>
  </div>
</template>

<script>
import Swal from "sweetalert2";

export default {
  name: "TableSOP",
  props: {
    SOPs: {
      type: Array,
      required: true,
    },
  },
  watch: {
    SOPs: {},
  },
  data: () => {
    return {
      SOPs: [],
      showEditModal: false,
      showDeleteModal: false,
      selectedSop: {
        sopId: "",
        sopName: "",
        description: "",
        createdDate: "",
        lastUpdated: "",
        status: "",
      },
      selectedSOPFields: {
        sopId: { label: "SOP ID" },
        sopName: { label: "SOP Name" },
        description: { label: "Description" },
        createdDate: { label: "Created Date" },
        lastUpdated: { label: "Last Updated" },
        status: { label: "Status", options: ["Active", "Inactive"] },
      },
      selectedIndex: null,
    };
  },
  methods: {
    getStatusColor(status) {
      switch (status) {
        case "Active":
          return "info";
        case "Inactive":
          return "secondary";
        default:
          return "secondary";
      }
    },
    openEditModal(item, index) {
      this.selectedSop = { ...item };
      console.log(this.selectedSop);
      this.selectedIndex = index;
      this.showEditModal = true;
      console.log(this.showEditModal);
    },
    openDeleteModal(item, index) {
      this.selectedSop = { ...item };
      console.log(this.selectedSop);
      this.selectedIndex = index;
      this.showDeleteModal = true;
      console.log(this.showDeleteModal);
    },
    async editSOP() {
      if (
        Object.values(this.selectedSop).some((value) => value.trim() === "")
      ) {
        Swal.fire({
          title: "Error",
          text: "Please fill in all fields.",
          icon: "error",
        }).then((result) => {
          if (result.isConfirmed) {
            this.showEditModal = true;
          }
        });
        return;
      }
      if (this.selectedIndex !== null && this.selectedIndex >= 0) {
        Swal.fire({
          title: "Save changes?",
          text: "Make sure the data is correct!",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Save",
          cancelButtonText: "Check again",
          customClass: {
            confirmButton: "btn btn-primary me-4",
            cancelButton: "btn btn-outline-primary",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            // try {
            //   await api.put(``, this.selectedSop);
            //   this.$emit("fetch-SOPs");
            // }
            this.SOPs.splice(this.selectedIndex, 1);
            this.SOPs.unshift({ ...this.selectedSop });
            this.selectedSop = {
              sopId: "",
              sopName: "",
              description: "",
              createdDate: "",
              lastUpdated: "",
              status: "",
            };
            this.selectedIndex = null;
            this.showEditModal = false;
            Swal.fire({
              title: "Saved!",
              text: "Your SOP has been edited.",
              icon: "success",
              timer: 2000,
              timerProgressBar: true,
            });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            this.showEditModal = true;
          }
        });
      }
    },
    async deleteSOP() {
      if (this.selectedIndex !== null && this.selectedIndex >= 0) {
        Swal.fire({
          title: "Delete this SOP?",
          text: "This action cannot be undone!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
          customClass: {
            confirmButton: "btn btn-danger me-4",
            cancelButton: "btn btn-outline-danger",
          },
        }).then(async (result) => {
          if (result.isConfirmed) {
            // try {
            //   await api.delete(``);
            //   this.$emit("fetch-SOPs");
            // }
            this.SOPs.splice(this.selectedIndex, 1);
            this.selectedSop = {
              sopId: "",
              sopName: "",
              description: "",
              createdDate: "",
              lastUpdated: "",
              status: "",
            };
            this.selectedIndex = null;
            this.showDeleteModal = false;
            Swal.fire({
              title: "Deleted!",
              text: "Your SOP has been deleted.",
              icon: "success",
              timer: 2000,
              timerProgressBar: true,
            });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            this.showDeleteModal = true;
          }
        });
      }
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
