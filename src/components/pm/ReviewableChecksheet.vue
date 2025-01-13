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
                      <!-- Show the first image as preview -->
                      <img
                        v-if="hasDetections && getLatestDetection?.imageUrl"
                        :src="getLatestDetection.imageUrl"
                        alt="Human Detection Preview"
                        class="captured-photo w-100 h-100"
                      />
                      <img
                        v-else
                        :src="require('@/assets/images/defaultImage.png')"
                        alt="Default Photo"
                        class="captured-photo w-100 h-100"
                      />
                      <div v-if="hasDetections" class="detection-info">
                        <div class="people-count">
                          <CIcon icon="cil-people" />
                          {{ getLatestDetection?.total_person || 0 }}
                        </div>

                        <div v-if="detections.length > 1" class="image-counter">
                          +{{ detections.length - 1 }}
                        </div>
                      </div>
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
                  <CTableDataCell class="text-center" colspan="12">
                    <CSpinner component="span" size="sm" aria-hidden="true" />
                    Loading...
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-else-if="checksheet.length <= 0">
                  <CTableDataCell class="text-center" colspan="12">
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
              :value="checksheet.notes"
              rows="3"
              readonly
              placeholder="No additional notes"
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
    <CModal
      size="lg"
      :visible="showPhotoModal"
      @close="closePhotoModal"
      class="photo-modal"
    >
      <CModalHeader>
        <CModalTitle>Human Detection Images</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div v-if="isLoading" class="text-center py-4">
          <CSpinner color="primary"></CSpinner>
          <div class="mt-2">Loading images...</div>
        </div>

        <template v-else>
          <div
            v-if="!hasDetections || detections.length === 0"
            class="no-detections p-5 text-center"
          >
            <img
              :src="require('@/assets/images/defaultImage.png')"
              class="d-block mx-auto mb-3"
              alt="No Images"
              style="max-width: 200px"
            />
            <h5 class="text-muted">No detection images available</h5>
            <p class="text-muted small">
              No human detection images were found for this time period.
            </p>
          </div>

          <CCarousel
            v-else
            controls
            indicators
            class="human-detection-carousel"
            :wrap="true"
            dark
          >
            <CCarouselItem
              v-for="(detection, index) in detections"
              :key="detection._id"
              :active="currentSlideIndex === index"
            >
              <div class="carousel-image-wrapper">
                <img
                  :src="detection.imageUrl"
                  class="d-block w-100"
                  :alt="'Human Detection Image ' + (index + 1)"
                />
              </div>
              <CCarouselCaption class="d-none d-md-block detection-caption">
                <div class="detection-details">
                  <h5>Image {{ index + 1 }} of {{ detections.length }}</h5>
                  <span class="detection-time">
                    {{ detection.detectionTime }}
                  </span>
                </div>
                <div class="meta-info">
                  <span class="camera">
                    <CIcon icon="cil-camera" /> {{ detection.created_by }}
                  </span>
                  <span class="people">
                    <CIcon icon="cil-people" />
                    {{ detection.total_person }} person(s) detected
                  </span>
                </div>
                <div
                  v-if="detection.detected_face?.length"
                  class="faces-detected mt-2"
                >
                  <span class="label">Faces detected: </span>
                  <span class="names">{{
                    detection.detected_face.join(", ")
                  }}</span>
                </div>
              </CCarouselCaption>
            </CCarouselItem>
          </CCarousel>
        </template>
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
import { CCarousel, CCarouselItem, CFormTextarea, CSpinner } from "@coreui/vue";
import api from "@/apis/CommonAPI";
import { toast } from "vue-sonner";

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
      isSubmitting: false,
      itemReviews: new Map(), // Store local review decisions
    };
  },
  computed: {
    ...mapGetters("checksheets", ["selectedChecksheet", "getPart"]),
    ...mapGetters("yoloDetections", [
      "allDetections",
      "isLoading",
      "hasDetections",
      "getLatestDetection",
    ]),

    allItemsReviewed() {
      return this.checksheet.items.every(
        (item) => item.status === "approved" || item.status === "rejected"
      );
    },

    detections() {
      return this.allDetections;
    },
  },

  methods: {
    ...mapActions("checksheets", [
      "fetchChecksheets",
      "approveChecksheetItem",
      "rejectChecksheetItem",
      "submitChecksheetReview",
      "updateChecksheetStatus",
      "fetchParts",
    ]),
    ...mapActions("yoloDetections", ["fetchDetections"]),

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

    approveItem(item) {
      console.log("Approving item:", item);
      // Update local state
      this.itemReviews.set(item.id, {
        status: "approved",
        reason: null,
      });
      item.status = "approved";
      item.rejectionReason = null;
    },

    rejectItem() {
      if (!this.currentItem || !this.rejectionReason) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please enter a rejection reason.",
        });
        return;
      }

      console.log("Rejecting item:", this.currentItem);
      // Update local state
      this.itemReviews.set(this.currentItem.id, {
        status: "rejected",
        reason: this.rejectionReason,
      });
      this.currentItem.status = "rejected";
      this.currentItem.rejectionReason = this.rejectionReason;

      this.closeRejectModal();
    },
    showRejectModal(item) {
      this.currentItem = item;
      this.rejectionReason = "";
      this.showRejectionModal = true;
    },
    closeRejectModal() {
      this.showRejectionModal = false;
      this.rejectionReason = "";
      this.currentItem = null;
    },
    async openPhotoModal() {
      console.log("Checksheet date formats:", {
        date: this.checksheet.date,
        created_dt: this.checksheet.created_dt,
        rawChecksheet: this.checksheet,
      });
      this.showPhotoModal = true;
      await this.fetchDetections({
        checksheetDate: this.checksheet.created_dt,
        timeWindowMinutes: 1440,
      });
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
      // Remove from local state
      this.itemReviews.delete(item.id);
      item.status = null;
      item.rejectionReason = null;
      this.hoveredItemIndex = null;
    },
    async submitReview() {
      try {
        console.log("🚀 Starting submitReview function");
        console.log("Current checksheet:", this.checksheet);

        // Validate that all items are reviewed
        if (!this.allItemsReviewed) {
          console.log("❌ Validation failed: Not all items are reviewed");
          await Swal.fire({
            icon: "warning",
            title: "Incomplete Review",
            text: "Please review all items before submitting.",
          });
          return;
        }

        console.log("✅ Validation passed: All items are reviewed");
        this.isSubmitting = true;

        // Show initial loading dialog
        let currentProgress = 0;
        console.log("📊 Creating loading dialog");
        const loadingDialog = Swal.fire({
          title: "Submitting Review",
          html: `
        <div class="progress-wrapper">
          <div id="progress-text">Preparing submission...</div>
          <div class="progress">
            <div id="progress-bar" 
                 class="progress-bar" 
                 role="progressbar" 
                 style="width: 0%">
            </div>
          </div>
        </div>
      `,
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            console.log("Dialog opened, showing loading state");
            Swal.showLoading();
          },
        });

        const updateProgress = async (progress, message) => {
          console.log(`📈 Progress Update: ${progress}% - ${message}`);
          currentProgress = progress;
          const progressBar = document.getElementById("progress-bar");
          const progressText = document.getElementById("progress-text");

          if (progressBar) {
            progressBar.style.width = `${progress}%`;
            console.log("Progress bar updated");
          } else {
            console.warn("Progress bar element not found");
          }

          if (progressText) {
            progressText.textContent = message;
            console.log("Progress text updated");
          } else {
            console.warn("Progress text element not found");
          }

          await new Promise((resolve) => setTimeout(resolve, 100));
        };

        // Start submission process
        await updateProgress(10, "Starting review submission...");

        // Process each review
        console.log("📝 Starting item review process");
        const itemUpdates = [];
        const items = this.checksheet.items;
        console.log(`Total items to process: ${items.length}`);

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const progress = 10 + Math.floor((i / items.length) * 60);
          await updateProgress(
            progress,
            `Processing item ${i + 1} of ${items.length}...`
          );

          console.log(`Processing item ${i + 1}:`, {
            itemId: item.id,
            status: item.status,
            rejectionReason: item.rejectionReason,
          });

          // Using CommonAPI.put format: (url, id, params)
          const reviewResponse = await api.put(
            "/kanban/review-kanban",
            this.checksheet._id,
            {
              itemcheck_id: item.id,
              review: item.status,
              reject: item.rejectionReason || null,
            }
          );

          console.log(`Review response for item ${i + 1}:`, reviewResponse);
          itemUpdates.push(reviewResponse);
        }

        // Check responses
        console.log("📤 Review responses:", itemUpdates);
        await updateProgress(70, "Verifying submissions...");

        // Calculate final status
        console.log("🔄 Calculating final status");
        await updateProgress(80, "Updating final status...");
        const hasRejectedItems = items.some(
          (item) => item.status === "rejected"
        );
        const finalStatus = hasRejectedItems ? "REJECTED" : "APPROVED";
        console.log("Final status calculated:", finalStatus);

        // Update work order status using CommonAPI.put format
        console.log("📝 Updating work order status");
        await updateProgress(90, "Finalizing submission...");
        const workOrderResponse = await api.put(
          "/kanban/edit-work-order",
          this.checksheet.work_order_id,
          {
            review_status: finalStatus,
          }
        );
        console.log("Work order update response:", workOrderResponse);

        await updateProgress(100, "Submission complete!");

        // Close loading dialog
        console.log("🔚 Closing loading dialog");
        Swal.close();

        // Show success message
        console.log("✅ Showing success message");
        await Swal.fire({
          icon: "success",
          title: "Review Submitted",
          text: `The checksheet has been ${finalStatus.toLowerCase()}.`,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        // Refresh data and navigate
        console.log("🔄 Refreshing data and navigating");
        await this.fetchChecksheets();
        this.$emit("review-submitted");
        this.$emit("back");
      } catch (error) {
        console.error("❌ Review submission error:", error);
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
          response: error.response?.data,
        });

        // Close any open dialogs
        Swal.close();

        // Show error message
        await Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: error.message || "Failed to submit review. Please try again.",
          confirmButtonText: "OK",
        });
      } finally {
        console.log("🏁 Submit review process completed");
        this.isSubmitting = false;
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

    handleSlideShow(index) {
      this.currentSlide = index;
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
    await this.fetchDetections({
      checksheetDate: this.checksheet.created_dt,
      timeWindowMinutes: 1440,
    });
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
/* General Layout and Utility Classes */
.text-white {
  color: white !important;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

/* Card Styles */
.info-card {
  height: 160px;
  transition: transform 0.2s;
}

.info-card.camera-card:hover {
  transform: scale(1.02);
}

.card-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.card-value {
  font-size: 1.5rem !important;
  font-weight: 600;
  margin: 0;
}

/* Table Styles */
.bg-success {
  background-color: #e6f4ea !important;
  color: #155724 !important;
}

.bg-danger {
  background-color: #fbe9e7 !important;
  color: #721c24 !important;
}

/* Photo Preview & Detection Styles */
.photo-wrapper {
  position: relative;
  height: 160px;
  width: 100%;
}

.captured-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.detection-info {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
}

.people-count,
.image-counter {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Capture Cell in Table */
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

/* Image Preview Modal */
.image-preview-modal :deep(.modal-header .btn-close) {
  color: #ffffff;
  filter: invert(1) grayscale(100%) brightness(200%);
}

.modal-body-dark {
  background-color: #e6e6e6;
  padding: 2rem;
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

/* Human Detection Modal */
.photo-modal :deep(.modal-content) {
  background-color: #1a1a1a;
}

.photo-modal :deep(.modal-header) {
  border-bottom: 1px solid #2d2d2d;
  background-color: #1a1a1a;
  color: white;
}

.photo-modal :deep(.btn-close) {
  filter: invert(1) grayscale(100%) brightness(200%);
}

/* Carousel Styles */
.human-detection-carousel {
  max-height: 70vh;
}

.human-detection-carousel :deep(img) {
  max-height: 70vh;
  object-fit: contain;
  background: #f8f9fa;
}

.photo-modal :deep(.carousel-control-prev),
.photo-modal :deep(.carousel-control-next) {
  width: 10%;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0) 100%
  );
}

.photo-modal :deep(.carousel-control-next) {
  background: linear-gradient(
    -90deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0) 100%
  );
}

.photo-modal :deep(.carousel-control-prev-icon),
.photo-modal :deep(.carousel-control-next-icon) {
  filter: invert(1) grayscale(100%) brightness(200%);
  width: 2.5rem;
  height: 2.5rem;
}

.photo-modal :deep(.carousel-indicators) {
  margin-bottom: 0;
}

.photo-modal :deep(.carousel-indicators button) {
  background-color: #fff;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0 4px;
}

/* Detection Caption Styles */
.detection-caption {
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 16px;
  text-align: left;
  margin: 0 32px 32px;
}

.detection-details {
  color: white;
}

.meta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.meta-header h5 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.detection-time {
  font-size: 0.9rem;
  opacity: 0.8;
}

.meta-info {
  display: flex;
  gap: 24px;
  margin-top: 8px;
  font-size: 0.95rem;
  color: white;
}

.meta-info span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
}

.faces-detected {
  font-size: 0.9rem;
  padding-top: 8px;
  border-top: 1px solid;
  color: white;
}

.faces-detected .label {
  margin-right: 8px;
  color: white;
}

.faces-detected .names {
  font-weight: 500;
  color: white;
}

.no-detections {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
}

/* Progress bar */
.progress-wrapper {
  padding: 1rem;
}

.progress-wrapper #progress-text {
  margin-bottom: 1rem;
  text-align: center;
  color: #666;
}

.progress {
  height: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.progress-bar {
  background-color: #0d6efd;
  height: 100%;
  transition: width 0.3s ease;
}
</style>
