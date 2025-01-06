<template>
  <div class="editable-checksheet">
    <!-- Header Card -->
    <CRow>
      <CCol :xs="12">
        <CCard class="header-card">
          <CCardHeader>
            <div class="d-flex justify-content-between align-items-center">
              <CCardTitle
                >Check Sheet - {{ selectedActivity.kanbanNo }}</CCardTitle
              >
              <CButton size="sm" color="secondary" @click="goBack"
                >Back</CButton
              >
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow class="g-3">
              <!-- Activity Info Section -->
              <CCol :xs="12" :sm="6" :lg="3">
                <CInputGroup>
                  <CInputGroupText>Date</CInputGroupText>
                  <CFormInput
                    :value="formatDisplayDate(selectedActivity.date)"
                    readonly
                  ></CFormInput>
                </CInputGroup>
              </CCol>
              <CCol :xs="12" :sm="6" :lg="3">
                <CInputGroup>
                  <CInputGroupText>PIC</CInputGroupText>
                  <CFormInput
                    :value="selectedActivity.assignedToName"
                    readonly
                  ></CFormInput>
                </CInputGroup>
              </CCol>

              <!-- Machine Info Section -->
              <CCol :xs="12" :sm="6" :lg="3">
                <CInputGroup>
                  <CInputGroupText>Machine</CInputGroupText>
                  <CFormInput
                    :value="selectedActivity.machineName"
                    readonly
                  ></CFormInput>
                </CInputGroup>
              </CCol>
              <CCol :xs="12" :sm="6" :lg="3">
                <CInputGroup>
                  <CInputGroupText>Period</CInputGroupText>
                  <CFormInput
                    :value="selectedActivity.period"
                    readonly
                  ></CFormInput>
                </CInputGroup>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Checksheet Table -->
    <CRow class="mt-3">
      <CCol :xs="12">
        <CCard>
          <CCardBody>
            <CTable align="middle" responsive hover bordered>
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell>No</CTableHeaderCell>
                  <CTableHeaderCell>Part</CTableHeaderCell>
                  <CTableHeaderCell>Item Check</CTableHeaderCell>
                  <CTableHeaderCell>Period</CTableHeaderCell>
                  <CTableHeaderCell>Standard</CTableHeaderCell>
                  <CTableHeaderCell v-if="hasValueChecks"
                    >Min. Value</CTableHeaderCell
                  >
                  <CTableHeaderCell v-if="hasValueChecks"
                    >Max. Value</CTableHeaderCell
                  >
                  <CTableHeaderCell>Unit</CTableHeaderCell>
                  <CTableHeaderCell>Input</CTableHeaderCell>
                  <CTableHeaderCell>Photo</CTableHeaderCell>
                  <CTableHeaderCell>Result</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                <CTableRow v-if="loading">
                  <CTableDataCell class="text-center" colspan="9">
                    <CSpinner component="span" size="sm" aria-hidden="true" />
                    Loading...
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-else-if="checkItems.length <= 0">
                  <CTableDataCell class="text-center" colspan="9"
                    >Data not found</CTableDataCell
                  >
                </CTableRow>
                <CTableRow
                  v-else
                  v-for="(item, index) in checkItems"
                  :key="item._id"
                >
                  <CTableDataCell>{{ index + 1 }}</CTableDataCell>
                  <CTableDataCell>{{
                    getPartName(item.part_id)
                  }}</CTableDataCell>
                  <CTableDataCell>{{ item.itemcheck_nm }}</CTableDataCell>
                  <CTableDataCell>{{ item.period }}</CTableDataCell>
                  <CTableDataCell>{{ item.std }}</CTableDataCell>
                  <CTableDataCell v-if="hasValueChecks">{{
                    item.min
                  }}</CTableDataCell>
                  <CTableDataCell v-if="hasValueChecks">{{
                    item.max
                  }}</CTableDataCell>
                  <CTableDataCell>{{ item.unit }}</CTableDataCell>

                  <!-- Input Cell -->
                  <CTableDataCell style="min-width: 70px">
                    <CFormInput
                      v-if="item.min !== undefined && item.max !== undefined"
                      type="text"
                      inputmode="numeric"
                      v-model.number="item.inputValue"
                    />
                  </CTableDataCell>

                  <!-- Photo Cell -->
                  <CTableDataCell class="photo-column">
                    <div class="photo-cell">
                      <div v-if="!item.photo" class="photo-button-wrapper">
                        <CButton
                          color="dark"
                          variant="outline"
                          size="sm"
                          @click="openPhotoCapture(index)"
                        >
                          <CIcon icon="cil-camera" size="sm"></CIcon>
                        </CButton>
                      </div>
                      <div v-else class="photo-preview">
                        <img
                          :src="item.photo"
                          alt="Item Photo"
                          class="item-photo"
                        />
                        <CButton
                          color="secondary"
                          size="sm"
                          class="remove-photo"
                          @click="removeItemPhoto(index)"
                          ><CIcon icon="cil-x"></CIcon
                        ></CButton>
                      </div>
                    </div>
                  </CTableDataCell>

                  <!-- Result Cell -->
                  <CTableDataCell
                    style="text-align: center"
                    :color="getResultColor(item)"
                  >
                    <CButton
                      v-if="item.min === undefined && item.max === undefined"
                      color="transparent"
                      @click="toggleResult(item)"
                    >
                      {{ item.result }}
                    </CButton>
                    <span v-else>{{ getResult(item) }}</span>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow class="mt-3">
      <CCol :xs="12">
        <CCard class="header-card">
          <CCardHeader>
            <CCardTitle>Notes</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CFormTextarea
              :value="notes"
              :rows="3"
              placeholder="Additional notes..."
            ></CFormTextarea>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Action Buttons -->
    <CRow class="mt-3">
      <CCol :xs="12">
        <div class="action-buttons d-flex justify-content-end gap-3">
          <!-- <CButton color="primary" @click="showBIRAForm = true"
            >Add Problem</CButton
          > -->
          <CButton
            class="text-white"
            style="background-color: blue"
            size="lg"
            @click="submitChecksheet"
            :disabled="isSubmitting"
          >
            <CSpinner
              v-if="isSubmitting"
              component="span"
              size="sm"
              class="me-2"
            ></CSpinner>
            {{ isSubmitting ? "Submitting..." : "Submit Checksheet" }}</CButton
          >
        </div>
      </CCol>
    </CRow>

    <Teleport to="body">
      <!-- Photo Capture Modal -->
      <CModal
        size="lg"
        :visible="showPhotoCapture"
        @close="showPhotoCapture = false"
      >
        <CModalHeader>
          <CModalTitle>Capture Photo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <PhotoCapture @photo-saved="onPhotoSaved" />
        </CModalBody>
      </CModal>
    </Teleport>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import BIRAProblemSheet from "../../components/pm/BIRAProblemSheet.vue";
import PhotoCapture from "../../components/pm/PhotoCapture.vue";
import Swal from "sweetalert2";

export default {
  name: "EditableChecksheet",
  components: {
    BIRAProblemSheet,
    PhotoCapture,
  },

  data() {
    return {
      isSubmitting: false,
      submitProgress: 0,
      checkItems: [],
      showPhotoCapture: false,
      showBIRAForm: false,
      activeItemIndex: null,
      previewPhotoUrl: null,
      ngItems: [],
      loading: false,
      notes: "",
    };
  },

  computed: {
    ...mapGetters("activities", ["selectedActivity", "getPart"]),

    hasValueChecks() {
      return this.checkItems.some(
        (item) => item.min !== undefined && item.max !== undefined
      );
    },
  },

  watch: {
    selectedActivity: {
      immediate: true,
      async handler(newVal) {
        if (newVal) {
          this.initializeCheckItems();
          await this.fetchPartsData();
        }
      },
    },
  },

  async created() {
    this.initializeCheckItems();
    await this.fetchPartsData();
  },

  methods: {
    initializeCheckItems() {
      if (this.selectedActivity?.itemcheck) {
        // Map itemcheck data to include input fields
        this.checkItems = this.selectedActivity.itemcheck.map((item) => ({
          ...item,
          inputValue: "",
          result: "NG",
          photo: null,
        }));
        console.log("Initialized checkItems:", this.checkItems);
      }
    },

    formatDisplayDate(date) {
      if (!date) return "-";
      const formattedDate = new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }); // Use toLocaleDateString for consistent comparison
      console.log(formattedDate);
      return formattedDate;
    },

    getResult(item) {
      if (item.min !== undefined && item.max !== undefined) {
        if (!item.inputValue) return "NG";
        const value = parseFloat(item.inputValue);
        return value >= item.min && value <= item.max ? "OK" : "NG";
      }
      return item.result;
    },

    toggleResult(item) {
      item.result = item.result === "OK" ? "NG" : "OK";
    },

    getResultColor(item) {
      const result = this.getResult(item);
      switch (result) {
        case "OK":
          return "success";
        case "NG":
          return "danger";
        default:
          return "";
      }
    },

    getPartName(partId) {
      if (!partId) return "-";
      const part = this.getPart(partId);
      return part ? part.part_nm : "Loading...";
    },

    updateProgressBar(progressBar, value) {
      if (progressBar) {
        progressBar.style.width = `${value}%`;
        progressBar.style.transition = "width 0.3s ease-in-out";
      }
    },

    async submitChecksheet() {
      let loadingDialog;
      try {
        console.log("🚀 Starting submitChecksheet process");
        const validation = this.validateSubmission();
        console.log("🔍 Validation result:", validation);

        if (!validation.isValid) {
          console.log("❌ Validation failed:", validation.errors);
          Swal.fire({
            icon: "error",
            title: "Validation Failed",
            html: validation.errors.join("<br>"),
          });
          return;
        }

        console.log("📊 Setting up loading dialog variables");
        this.isSubmitting = true;

        // Create unique IDs for elements
        const progressBarId = `progress-bar-${Date.now()}`;
        const progressTextId = `progress-text-${Date.now()}`;

        console.log("Creating dialog HTML with IDs:", {
          progressBarId,
          progressTextId,
        });

        const progressHtml = `
      <div class="submission-progress">
        <div id="${progressTextId}" class="progress-text">Preparing data...</div>
        <div class="progress">
          <div id="${progressBarId}" class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div>
        </div>
      </div>
    `;

        console.log("Opening Swal dialog");
        loadingDialog = Swal.fire({
          title: "Submitting Checksheet",
          html: progressHtml,
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          willOpen: () => {
            console.log("Dialog willOpen callback triggered");
          },
          didOpen: () => {
            console.log("Dialog didOpen callback triggered");
            try {
              console.log("Showing loading state");
              Swal.showLoading();
              console.log("Loading state shown");
            } catch (error) {
              console.error("Error in didOpen:", error);
            }
          },
        });

        // Add a small delay to ensure dialog is rendered
        console.log("Waiting for dialog to render");
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Get progress elements
        console.log("Getting progress elements by ID");
        const progressBar = document.getElementById(progressBarId);
        const progressText = document.getElementById(progressTextId);

        // Detailed element checks
        console.log("Checking progress elements:", {
          progressBarId,
          progressTextId,
          progressBarFound: progressBar ? "Found" : "Not found",
          progressTextFound: progressText ? "Found" : "Not found",
          progressBarElement: progressBar,
          progressTextElement: progressText,
          allProgressBars: document.querySelectorAll(".progress-bar"),
          allProgressTexts: document.querySelectorAll(".progress-text"),
        });

        // Verify dialog is in DOM
        const dialogElement = document.querySelector(".swal2-container");
        console.log("Dialog element check:", {
          found: !!dialogElement,
          classList: dialogElement?.classList?.toString(),
          children: dialogElement?.children?.length,
        });

        // Create progress updater with error handling
        const updateProgress = (percent, text) => {
          console.log(
            `Attempting to update progress: ${percent}%, text: ${text}`
          );
          try {
            const currentBar = document.getElementById(progressBarId);
            const currentText = document.getElementById(progressTextId);

            if (currentBar) {
              currentBar.style.width = `${percent}%`;
              currentBar.setAttribute("aria-valuenow", percent);
              console.log(`Progress bar updated to ${percent}%`);
            } else {
              console.error(`Progress bar with ID ${progressBarId} not found`);
            }

            if (currentText && text) {
              currentText.textContent = text;
              console.log(`Progress text updated to: ${text}`);
            } else if (!currentText) {
              console.error(
                `Progress text with ID ${progressTextId} not found`
              );
            }
          } catch (error) {
            console.error("Error updating progress:", error);
          }
        };

        // Initial progress
        console.log("Starting initial progress");
        updateProgress(5, "Starting submission process...");
        await new Promise((resolve) => setTimeout(resolve, 300));

        const formData = new FormData();
        const totalItems = this.checkItems.length;
        console.log(`Processing ${totalItems} items`);

        // Add basic information
        updateProgress(10, "Adding basic information...");
        const basicInfo = {
          kanban_id: this.selectedActivity.kanbanId,
          work_order_id: this.selectedActivity.workOrderId,
          created_by: this.selectedActivity.assignedTo,
          created_dt: new Date().toISOString(),
          status: "COMPLETED",
        };

        Object.entries(basicInfo).forEach(([key, value]) => {
          formData.append(key, value);
          console.log(`Added ${key}: ${value}`);
        });

        // Process items
        const progressPerItem = 70 / totalItems;
        for (let index = 0; index < totalItems; index++) {
          const item = this.checkItems[index];
          const currentProgress = 20 + index * progressPerItem;

          updateProgress(
            currentProgress,
            `Processing item ${index + 1} of ${totalItems}...`
          );

          // Process item data
          formData.append("itemcheck_id[]", item._id);

          const value =
            item.min !== undefined && item.max !== undefined
              ? String(item.inputValue || "")
              : String(item.result || "NG");
          formData.append("value[]", value);

          const result = this.getResult(item);
          formData.append("result[]", result);

          // Process photo if exists
          if (item.photo) {
            updateProgress(
              currentProgress + progressPerItem / 2,
              `Processing photo for item ${index + 1}...`
            );

            try {
              const photoBlob = this.dataURLtoBlob(item.photo);
              formData.append("file", photoBlob, `${Date.now()}_${index}.jpg`);
              console.log(`Photo added for item ${index + 1}`);
            } catch (error) {
              console.error(
                `Photo processing error for item ${index + 1}:`,
                error
              );
              throw error;
            }
          }

          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // Submit data
        updateProgress(90, "Submitting to server...");
        console.log("Dispatching submitKanban action");
        const success = await this.$store.dispatch(
          "activities/submitKanban",
          formData
        );

        if (success) {
          updateProgress(100, "Submission complete!");
          await new Promise((resolve) => setTimeout(resolve, 300));

          loadingDialog.close();
          await Swal.fire({
            icon: "success",
            title: "Checksheet Submitted",
            text: "The checksheet has been successfully submitted.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });

          this.goBack();
        } else {
          throw new Error("Submission failed");
        }
      } catch (error) {
        console.error("Submission error:", error);
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        if (loadingDialog) loadingDialog.close();

        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: error.message || "Failed to submit checksheet",
          confirmButtonText: "Try Again",
        });
      } finally {
        this.isSubmitting = false;
        this.submitProgress = 0;
        console.log("Submission process completed");
      }
    },

    // Utility function to convert base64 to Blob
    dataURLtoBlob(dataUrl) {
      const arr = dataUrl.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },

    validateSubmission() {
      console.log("Starting validation...");
      const errors = [];

      // Log important fields
      console.log("Validating fields:", {
        kanbanId: this.selectedActivity?.kanbanId,
        workOrderId: this.selectedActivity?.workOrderId,
        assignedTo: this.selectedActivity?.assignedTo,
      });

      // Check for required fields
      if (!this.selectedActivity?.kanbanId) errors.push("Kanban ID is missing");
      if (!this.selectedActivity?.workOrderId)
        errors.push("Work Order ID is missing");
      if (!this.selectedActivity?.assignedTo) errors.push("User ID is missing");

      // Validate each itemcheck
      this.checkItems.forEach((item, index) => {
        if (item.min !== undefined && item.max !== undefined) {
          const value = parseFloat(item.inputValue);
          if (isNaN(value)) {
            errors.push(`Invalid numeric value for item ${index + 1}`);
          }
        }

        if (!item.photo) {
          errors.push(`Photo is missing for item ${index + 1}`);
        }
      });

      console.log("Validation complete. Errors:", errors);
      return {
        isValid: errors.length === 0,
        errors,
      };
    },

    goBack() {
      this.$emit("cancel");
    },

    openPhotoCapture(index) {
      this.activeItemIndex = index;
      this.showPhotoCapture = true;
    },

    onPhotoSaved(photoData) {
      if (this.activeItemIndex !== null) {
        this.checkItems[this.activeItemIndex].photo = photoData.data;
        this.activeItemIndex = null;
      }
      this.showPhotoCapture = false;
    },

    removeItemPhoto(index) {
      this.checkItems[index].photo = null;
    },

    async fetchPartsData() {
      if (this.selectedActivity?.itemcheck) {
        // Get unique part IDs from itemcheck
        const partIds = [
          ...new Set(
            this.selectedActivity.itemcheck
              .filter((item) => item.part_id)
              .map((item) => item.part_id)
          ),
        ];

        if (partIds.length > 0) {
          // Dispatch action to fetch parts
          await this.$store.dispatch("activities/fetchParts", partIds);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
// Base Variables
$card-border-radius: 0.375rem;
$card-box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
$transition-base: all 0.2s ease-in-out;

// Base Card Styles
.card {
  border-radius: $card-border-radius;
  box-shadow: $card-box-shadow;
  border: none;

  .card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }
}

// Input Group Styles
:deep(.input-group) {
  .input-group-text {
    min-width: 80px;
    justify-content: center;

    border-right: 1px solid #ced4da;
  }

  .form-control {
    border-left: none;
    background-color: white !important;

    &:focus {
      box-shadow: none;
    }
  }
}

// Table Styles
:deep(.table) {
  margin-bottom: 0;

  th {
    padding: 0.75rem;
    white-space: nowrap;
    border-bottom: none;
  }

  td {
    vertical-align: middle;
    padding: 0.75rem;
  }
}

// Photo Styles
.photo-column {
  width: 100px;
  vertical-align: middle !important;
  text-align: center;
}

.photo-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90px;
  padding: 0.5rem;
}

.photo-button-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  .btn {
    width: 40px;
    height: 40px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.photo-preview {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;

  .item-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-photo {
    position: absolute;
    top: 5px;
    right: 5px;
    padding: 2px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border-radius: 50%;
    border: none;
    z-index: 1;

    &:hover {
      background-color: rgba(0, 0, 0, 0.7);
    }
  }
}

// Action Buttons
.action-buttons {
  gap: 1rem;

  .btn {
    min-width: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;

    svg {
      width: 16px;
      height: 16px;
    }
  }
}

// Loading and Empty States
.spinner-wrapper {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
}

.empty-message {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
}

// Extra Small devices (max 575px)
@media (max-width: 575.98px) {
  .card-body {
    padding: 0.75rem !important;
  }

  :deep(.input-group) {
    margin-bottom: 0.5rem;
    width: 100%;

    .input-group-text {
      min-width: 60px;
      font-size: 0.875rem;
    }
  }

  :deep(.table) {
    th,
    td {
      padding: 0.5rem;
      font-size: 0.875rem;
    }
  }

  .photo-cell {
    min-height: 70px;
  }

  .photo-preview {
    width: 60px;
    height: 60px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;

    .btn {
      width: 100%;
      min-width: auto;
    }
  }
}

// Small devices (landscape phones, 576px and up)
@media (min-width: 576px) and (max-width: 767.98px) {
  :deep(.table) {
    th,
    td {
      padding: 0.625rem;
      font-size: 0.9rem;
    }
  }

  .photo-preview {
    width: 70px;
    height: 70px;
  }

  .action-buttons {
    flex-direction: row;
    justify-content: flex-end;
  }
}

// Medium devices (tablets, 768px and up)
@media (min-width: 768px) and (max-width: 991.98px) {
  :deep(.table-responsive) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .photo-preview {
    width: 75px;
    height: 75px;
  }
}

// Large devices (desktops, 992px and up)
@media (min-width: 992px) and (max-width: 1199.98px) {
  .card-body {
    padding: 1.25rem;
  }

  :deep(.table) {
    th,
    td {
      padding: 0.875rem;
    }
  }
}

// X-Large devices (large desktops, 1200px and up)
@media (min-width: 1200px) and (max-width: 1399.98px) {
  .photo-preview {
    width: 85px;
    height: 85px;
  }
}

// XX-Large devices (larger desktops, 1400px and up)
@media (min-width: 1400px) {
  .card-body {
    padding: 1.5rem;
  }

  :deep(.table) {
    th,
    td {
      padding: 1rem;
    }
  }

  .photo-preview {
    width: 90px;
    height: 90px;
  }
}

// Modal Styles
:deep(.modal-header) {
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

:deep(.modal-body) {
  padding: 1rem;
}

:deep(.modal-footer) {
  padding: 1rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

// Utility Classes
.text-center {
  text-align: center;
}

.mt-3 {
  margin-top: 1rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

// Form Control States
:deep(.form-control) {
  &.is-invalid {
    border-color: #dc3545;
    padding-right: calc(1.5em + 0.75rem);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
  }

  &.is-valid {
    border-color: #198754;
    padding-right: calc(1.5em + 0.75rem);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23198754' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
  }
}

// Loading and Progress Styles
.submission-progress {
  padding: 1rem;

  .progress-text {
    margin-bottom: 1rem;
    color: #6c757d;
    font-size: 0.9rem;
    text-align: center;
    min-height: 20px;
  }

  .progress {
    height: 6px;
    border-radius: 3px;
    background-color: #e9ecef;
    overflow: hidden;
    margin: 0.5rem 0;
  }

  .progress-bar {
    background-color: #0d6efd;
    transition: width 0.3s ease-in-out;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent 100%
      );
      background-size: 1rem 1rem;
      animation: progress-bar-stripes 1s linear infinite;
    }
  }
}

@keyframes progress-bar-stripes {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}

// Disable buttons during submission
.btn {
  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
}
</style>
