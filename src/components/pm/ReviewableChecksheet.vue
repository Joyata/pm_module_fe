<template>
  <div class="reviewable-checksheet">
    <!-- Header Card -->
    <CRow>
      <CCol :xs="12">
        <CCard class="header-card">
          <CCardHeader>
            <div class="d-flex justify-content-between align-items-center">
              <CCardTitle
                >Review Check Sheet - {{ checksheet.kanbanNo }}</CCardTitle
              >
              <CButton size="sm" color="secondary" @click="goBack"
                >Back</CButton
              >
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow class="align-items-stretch justify-content-between">
              <!-- Checksheet Info Section -->
              <CCol :xs="12" :sm="6" :md="3" :lg="3">
                <CRow>
                  <CCol :xs="12" class="mb-3">
                    <CInputGroup>
                      <CInputGroupText
                        style="width: 70px"
                        class="justify-content-center"
                        >Date</CInputGroupText
                      >
                      <CFormInput
                        :value="checksheet.date"
                        readonly
                      ></CFormInput>
                    </CInputGroup>
                  </CCol>
                  <CCol :xs="12" class="mb-3">
                    <CInputGroup>
                      <CInputGroupText
                        style="width: 70px"
                        class="justify-content-center"
                        >PIC</CInputGroupText
                      >
                      <CFormInput
                        :value="checksheet.submittedBy"
                        readonly
                      ></CFormInput>
                    </CInputGroup>
                  </CCol>
                  <CCol :xs="12">
                    <CInputGroup>
                      <CInputGroupText
                        style="width: 70px"
                        class="justify-content-center"
                        >Machine</CInputGroupText
                      >
                      <CFormInput
                        :value="checksheet.machineName"
                        readonly
                      ></CFormInput>
                    </CInputGroup>
                  </CCol>
                </CRow>
              </CCol>

              <!-- Period Card -->
              <CCol :md="3" :lg="2">
                <CCard class="h-100">
                  <CCardBody
                    class="d-flex flex-column justify-content-center align-items-center"
                  >
                    <CCardText>Period</CCardText>
                    <CCardTitle style="font-size: x-large">{{
                      checksheet.period
                    }}</CCardTitle>
                  </CCardBody>
                </CCard>
              </CCol>

              <!-- Kanban No Card -->
              <CCol :md="3" :lg="2">
                <CCard class="h-100">
                  <CCardBody
                    class="d-flex flex-column justify-content-center align-items-center"
                  >
                    <CCardText>Kanban No.</CCardText>
                    <CCardTitle style="font-size: x-large">{{
                      checksheet.kanbanNo
                    }}</CCardTitle>
                  </CCardBody>
                </CCard>
              </CCol>

              <!-- Human Detection Card -->
              <CCol :md="3" :lg="2">
                <CCard
                  class="h-100 camera-card"
                  role="button"
                  @click="openPhotoModal"
                >
                  <CCardBody
                    class="d-flex justify-content-center align-items-center p-0"
                  >
                    <div class="photo-wrapper w-100 h-100">
                      <img
                        :src="require('@/assets/images/defaultImage.png')"
                        alt="Dummy Photo"
                        class="captured-photo w-100 h-100"
                      />
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Checksheet Table -->
    <CRow class="mt-3" v-if="checksheet.items && checksheet.items.length">
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
                  <CTableHeaderCell>Min. Value</CTableHeaderCell>
                  <CTableHeaderCell>Max. Value</CTableHeaderCell>
                  <CTableHeaderCell>Unit</CTableHeaderCell>
                  <CTableHeaderCell>Input</CTableHeaderCell>
                  <CTableHeaderCell>Photo</CTableHeaderCell>
                  <CTableHeaderCell>Result</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                <CTableRow v-if="loading">
                  <CTableDataCell class="text-center" colspan="10">
                    <CSpinner component="span" size="sm" aria-hidden="true" />
                    Loading...
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-else-if="checksheet.length <= 0">
                  <CTableDataCell class="text-center" colspan="10">
                    Data not found</CTableDataCell
                  >
                </CTableRow>
                <CTableRow
                  v-else
                  v-for="(item, index) in checksheet.items"
                  :key="item._id"
                >
                  <CTableDataCell>{{ index + 1 }}</CTableDataCell>
                  <CTableDataCell>{{
                    getPartName(item.part_id)
                  }}</CTableDataCell>
                  <CTableDataCell>{{ item.itemCheck }}</CTableDataCell>
                  <CTableDataCell>{{ item.period }}</CTableDataCell>
                  <CTableDataCell>{{ item.standard }}</CTableDataCell>
                  <CTableDataCell>{{ item.minValue }}</CTableDataCell>
                  <CTableDataCell>{{ item.maxValue }}</CTableDataCell>
                  <CTableDataCell>{{ item.unit }}</CTableDataCell>
                  <CTableDataCell>{{ item.input }}</CTableDataCell>
                  <CTableDataCell class="text-center">
                    <div class="capture-cell">
                      <div
                        class="image-container"
                        @click="openImageModal(item)"
                        v-if="item.capturedImage"
                      >
                        <img
                          :src="item.capturedImage"
                          alt="Captured Value"
                          class="captured-value-img"
                        />
                        <div class="zoom-icon">
                          <CIcon icon="cil-zoom-in"></CIcon>
                        </div>
                      </div>
                      <div v-else class="no-image">No image captured</div>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell
                    :class="{
                      'bg-success text-white': item.result === 'OK',
                      'bg-danger text-white': item.result === 'NG',
                    }"
                    style="text-align: center"
                  >
                    {{ item.result }}
                  </CTableDataCell>
                  <CTableDataCell class="text-center">
                    <div
                      v-if="!item.status"
                      class="d-flex justify-content-center"
                    >
                      <CButton
                        color="success"
                        size="sm"
                        @click="approveItem(item)"
                        class="text-white me-2"
                        >Approve</CButton
                      >
                      <CButton
                        color="danger"
                        size="sm"
                        @click="showRejectModal(item)"
                        class="text-white"
                        >Reject</CButton
                      >
                    </div>
                    <div v-else class="d-inline-block">
                      <CButton
                        v-if="hoveredItemIndex !== index"
                        :color="
                          item.status === 'approved' ? 'success' : 'danger'
                        "
                        size="sm"
                        class="text-white"
                        @mouseover="showCancelOption(index)"
                      >
                        <CIcon
                          :icon="
                            item.status === 'approved'
                              ? 'cil-check-circle'
                              : 'cil-x-circle'
                          "
                          class="me-1"
                        />
                        {{
                          item.status === "approved" ? "Approved" : "Rejected"
                        }}
                      </CButton>
                      <CButton
                        v-else
                        color="secondary"
                        size="sm"
                        class="text-white"
                        @mouseleave="hideCancelOption()"
                        @click="cancelAction(item)"
                      >
                        Cancel
                      </CButton>
                    </div>
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
        <CCard>
          <CCardHeader>
            <CCardTitle>Notes</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CFormTextarea
              :value="notes"
              rows="3"
              placeholder="Additional notes..."
            ></CFormTextarea>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Action Button -->
    <CRow class="mt-3">
      <CCol class="d-grid d-md-flex justify-content-end">
        <CButton
          class="text-white"
          style="background-color: blue"
          size="lg"
          @click="submitReview"
        >
          <CSpinner
            v-if="isSubmitting"
            component="span"
            size="sm"
            class="me-2"
          ></CSpinner>
          {{ isSubmitting ? "Submitting..." : "Submit Review" }}
        </CButton>
      </CCol>
    </CRow>

    <!-- Reject Reason Modal -->
    <CModal
      :visible="showRejectionModal"
      @close="
        () => {
          showRejectionModal = false;
        }
      "
    >
      <CModalHeader>
        <CModalTitle>Reject Item</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormTextarea
          v-model="rejectionReason"
          label="Reason for Rejection"
          placeholder="Enter the reason for rejection..."
          rows="3"
        ></CFormTextarea>
      </CModalBody>
      <CModalFooter>
        <CButton
          color="secondary"
          @click="
            () => {
              showRejectionModal = false;
            }
          "
        >
          Close
        </CButton>
        <CButton color="primary" @click="rejectItem">Submit Rejection</CButton>
      </CModalFooter>
    </CModal>

    <!-- Human Detection Photo Modal -->
    <CModal size="lg" :visible="showPhotoModal" @close="closePhotoModal">
      <CModalHeader>
        <CModalTitle>Human Detection</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <img
          :src="require('@/assets/images/defaultImage.png')"
          alt="Large Dummy Photo"
          class="img-fluid"
        />
      </CModalBody>
    </CModal>

    <!-- Image Preview Modal -->
    <CModal
      :visible="showImageModal"
      @close="closeImageModal"
      size="lg"
      class="image-preview-modal"
    >
      <CModalHeader>
        <CModalTitle>Captured Image</CModalTitle>
      </CModalHeader>
      <CModalBody class="modal-body-dark">
        <div class="preview-container">
          <img
            v-if="selectedImage"
            :src="selectedImage"
            alt="Captured Image"
            class="preview-image"
          />
        </div>
        <div v-if="selectedItem" class="mt-4 value-comparison-container">
          <div class="value-box">
            <div class="value-label">Input Value</div>
            <div class="value-content">{{ selectedItem.input }}</div>
          </div>
          <div class="value-box">
            <div class="value-label">OCR Result</div>
            <div
              class="value-content"
              :class="{
                'text-success': isOCRMatchingInput(selectedItem),
                'text-danger':
                  !isOCRMatchingInput(selectedItem) && selectedItem.ocrValue,
              }"
            >
              {{ selectedItem.ocrValue || "Not processed" }}
              <CIcon
                v-if="selectedItem.ocrValue"
                :icon="
                  isOCRMatchingInput(selectedItem)
                    ? 'cil-check-circle'
                    : 'cil-x-circle'
                "
                class="ms-2"
              />
            </div>
          </div>
        </div>
      </CModalBody>
    </CModal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Swal from "sweetalert2";
import { CFormTextarea, CSpinner } from "@coreui/vue";

export default {
  name: "ReviewableChecksheet",
  props: {
    checksheet: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      showRejectionModal: false,
      showPhotoModal: false,
      rejectionReason: "",
      currentItem: null,
      hoveredItemIndex: null,
      showImageModal: false,
      selectedImage: null,
      selectedItem: null,
    };
  },
  computed: {
    ...mapGetters("checksheets", ["selectedChecksheet", "getPart"]),
    allItemsReviewed() {
      return this.checksheet.items.every(
        (item) => item.status === "approved" || item.status === "rejected"
      );
    },
  },
  methods: {
    ...mapActions("checksheets", [
      "approveChecksheetItem",
      "rejectChecksheetItem",
      "submitChecksheetReview",
      "updateChecksheetStatus",
      "fetchParts",
    ]),

    async fetchPartsData() {
      console.log("Starting fetchPartsData");
      console.log("Current checksheet items:", this.checksheet.items);
      if (this.checksheet?.items) {
        // Log the first item to see its structure
        console.log("Sample item structure:", this.checksheet.items[0]);

        const partIds = [
          ...new Set(
            this.checksheet.items
              // Check both possible property names and log what we find
              .filter((item) => {
                console.log("Checking item for part ID:", {
                  itemId: item.id,
                  partId: item.partId,
                  part_id: item.part_id,
                  originalPartId: item._id,
                });
                return item.partId || item.part_id;
              })
              .map((item) => item.partId || item.part_id)
          ),
        ];

        console.log("Collected unique partIds:", partIds);

        if (partIds.length > 0) {
          console.log("Fetching parts for IDs:", partIds);
          await this.fetchParts(partIds);

          // Log the current state of parts after fetching
          const currentParts = this.$store.state.checksheets.parts;
          console.log("Current parts in store:", currentParts);
        }
      }
    },

    getPartName(partId) {
      if (!partId) return "-";
      const part = this.getPart(partId);
      console.log("Found part:", part);
      return part ? part.part_nm : "-";
    },

    async approveItem(item) {
      try {
        await this.approveChecksheetItem({
          checksheetId: this.checksheet.id,
          itemId: item.id,
        });
        item.status = "approved";
        Swal.fire("Success", "Item approved successfully", "success");
      } catch (error) {
        console.error("Error approving item:", error);
      }
    },
    async rejectItem() {
      if (this.currentItem && this.rejectionReason) {
        try {
          await this.rejectChecksheetItem({
            checksheetId: this.checksheet.id,
            itemId: this.currentItem.id,
            reason: this.rejectionReason,
          });
          this.currentItem.status = "rejected";
          this.closeRejectModal();
          Swal.fire("Success", "Item rejected successfully", "success");
        } catch (error) {
          console.error("Error rejecting item:", error);
          Swal.fire("Error", "Failed to reject item", "error");
        }
      }
    },
    showRejectModal(item) {
      this.currentItem = item;
      this.showRejectionModal = true;
    },
    closeRejectModal() {
      this.showRejectionModal = false;
      this.rejectionReason = "";
      this.currentItem = null;
    },
    openPhotoModal() {
      this.showPhotoModal = true;
    },
    closePhotoModal() {
      this.showPhotoModal = false;
    },
    showCancelOption(index) {
      this.hoveredItemIndex = index;
    },
    hideCancelOption() {
      this.hoveredItemIndex = null;
    },
    cancelAction(item) {
      item.status = null;
      this.hoveredItemIndex = null;
    },
    async submitReview() {
      try {
        if (!this.allItemsReviewed) {
          Swal.fire({
            icon: "warning",
            title: "Incomplete Review",
            text: "Please review all items before submitting.",
          });
          return;
        }

        const reviewData = {
          kanban_id: this.checksheet.kanban_id,
          work_order_id: this.checksheet.work_order_id,
          items: this.checksheet.itemcheck.map((item) => ({
            itemcheck_id: item._id,
            status: item.status,
            remarks: item.status === "rejected" ? item.rejectionReason : "",
            value: item.value,
            ocr_value: item.ocr_value,
          })),
        };

        const response = await api.post(
          "/kanban/review-checksheet",
          reviewData
        );

        if (response.data?.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Review Submitted",
            text: "The checksheet has been successfully reviewed.",
          });
          this.$emit("review-submitted");
          this.goBack();
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: error.response?.data?.message || "Failed to submit review",
        });
      }
    },

    goBack() {
      this.$emit("back");
    },
    isOCRMatchingInput(item) {
      // Only check OCR matching for items that require it
      if (!this.shouldProcessOCR(item)) {
        return true; // Return true for items that don't require OCR
      }

      if (!item.ocrValue || !item.input) return false;

      // Compare OCR value with input, allowing for some flexibility in format
      const normalizedOCR = parseFloat(item.ocrValue);
      const normalizedInput = parseFloat(item.input);

      // Also check if the value is within min/max range
      const minValue = parseFloat(item.minValue);
      const maxValue = parseFloat(item.maxValue);

      const isWithinRange =
        normalizedOCR >= minValue && normalizedOCR <= maxValue;
      const matchesInput = Math.abs(normalizedOCR - normalizedInput) < 0.01;
      const hasAcceptableConfidence =
        !item.ocrConfidence || item.ocrConfidence >= 50;

      return (
        !isNaN(normalizedOCR) &&
        !isNaN(normalizedInput) &&
        isWithinRange &&
        matchesInput &&
        hasAcceptableConfidence
      );
    },

    shouldProcessOCR(item) {
      // Check if both minValue and maxValue are numeric
      const minNumeric = !isNaN(parseFloat(item.minValue));
      const maxNumeric = !isNaN(parseFloat(item.maxValue));
      return (
        minNumeric &&
        maxNumeric &&
        item.minValue !== "N/A" &&
        item.maxValue !== "N/A"
      );
    },

    openImageModal(item) {
      this.selectedImage = item.capturedImage;
      this.selectedItem = item;
      this.showImageModal = true;
    },

    closeImageModal() {
      this.showImageModal = false;
      this.selectedImage = null;
      this.selectedItem = null;
    },
  },
  async mounted() {
    console.log(
      "ReviewableChecksheet mounted with checksheet:",
      this.checksheet
    );
  },

  async created() {
    await this.fetchPartsData();
  },

  watch: {
    checksheet: {
      immediate: true,
      async handler() {
        await this.fetchPartsData();
      },
    },
  },
};
</script>

<style scoped>
/* .image-preview-modal :deep(.modal-content) {
  background-color: #1a1a1a;
  color: #ffffff;
} */
/* .image-preview-modal :deep(.modal-header) {
  background-color: #2d2d2d;
  border-bottom: 1px solid #404040;
} */
.image-preview-modal :deep(.modal-header .btn-close) {
  color: #ffffff;
  filter: invert(1) grayscale(100%) brightness(200%);
}
.modal-body-dark {
  background-color: #e6e6e6;
  padding: 2rem;
}
.photo-wrapper {
  position: relative;
}

.captured-photo {
  object-fit: cover;
  border-radius: 4px;
}

.text-white {
  color: white !important;
}

.bg-success {
  background-color: #e6f4ea !important;
  color: #155724 !important;
}

.bg-danger {
  background-color: #fbe9e7 !important;
  color: #721c24 !important;
}
.capture-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.image-container {
  position: relative;
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.2s;
}
.image-container:hover {
  transform: scale(1.05);
}

.captured-value-img {
  max-width: 100px;
  max-height: 100px;
  display: block;
}

.zoom-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 2px;
  border-top-left-radius: 4px;
}

.no-image {
  color: #666;
  font-size: 0.875rem;
  font-style: italic;
}

.ocr-value {
  font-size: 0.875rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fcfcfc;
  border-radius: 8px;
  padding: 1rem;
  min-height: 300px;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}
.value-comparison-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
}

.value-box {
  text-align: center;
  flex: 1;
  max-width: 200px;
}

.value-label {
  font-size: 0.875rem;
  color: #000000;
  margin-bottom: 0.5rem;
}

.value-content {
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.confidence-indicator {
  margin-top: 0.5rem;
  text-align: center;
}

.confidence-bar {
  width: 100%;
  height: 6px;
  background-color: #2d2d2d;
  border-radius: 3px;
  overflow: hidden;
}

.confidence-level {
  height: 100%;
  transition: width 0.3s ease;
}

.confidence-level.high {
  background-color: #28a745;
}

.confidence-level.medium {
  background-color: #ffc107;
}

.confidence-level.low {
  background-color: #dc3545;
}

.confidence-text {
  font-size: 0.875rem;
  color: #999;
  margin-top: 0.25rem;
}

.best-match {
  font-size: 0.875rem;
  color: #999;
  margin-top: 0.25rem;
}
</style>
