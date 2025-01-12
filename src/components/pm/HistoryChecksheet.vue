<template>
  <div class="history-checksheet">
    <!-- Header Card -->
    <CRow>
      <CCol :xs="12">
        <CCard class="header-card">
          <CCardHeader>
            <div class="d-flex justify-content-between align-items-center">
              <CCardTitle
                >History Check Sheet - {{ checksheet.kanbanNo }}</CCardTitle
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
                        style="width: 110px"
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
                        style="width: 110px"
                        class="justify-content-center"
                      >
                        Submitted By</CInputGroupText
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
                        style="width: 110px"
                        class="justify-content-center"
                        >Approved By</CInputGroupText
                      >
                      <CFormInput
                        :value="checksheet.reviewedBy"
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
                  <CTableHeaderCell scope="col">No</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Part</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Item Check</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Period</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Standard</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Min. Value</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Max. Value</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Unit</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Input</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Photo</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Result</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Review Status</CTableHeaderCell>
                  <CTableHeaderCell scope="col"
                    >Reject Reason (if any)</CTableHeaderCell
                  >
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-if="loading">
                  <CTableDataCell class="text-center" colspan="13">
                    <CSpinner component="span" size="sm" aria-hidden="true" />
                    Loading...
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-else-if="checksheet.length <= 0">
                  <CTableDataCell class="text-center" colspan="13">
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
                    >{{ item.result }}</CTableDataCell
                  >
                  <CTableDataCell class="text-center">
                    <CBadge
                      :color="getStatusColor(item.review)"
                      shape="rounded-pill"
                    >
                      {{ item.review }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{{ item.reject }}</CTableDataCell>
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
        <CButton color="primary" size="lg" @click="generateAndExportPDF"
          >Export to PDF</CButton
        >
      </CCol>
    </CRow>

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

        <CCarousel
          v-else
          controls
          indicators
          class="human-detection-carousel"
          :wrap="true"
          :interval="0"
          @show="handleSlideShow"
        >
          <CCarouselItem
            v-for="(detection, index) in detections"
            :key="detection._id"
            :active="index"
          >
            <img
              :src="detection.imageUrl"
              class="d-block w-100"
              :alt="'Human Detection Image' + (index + 1)"
            />
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
          <!-- Show default image if no images available -->
          <CCarouselItem v-if="detections.length === 0">
            <div class="no-detections">
              <img
                :src="require('@/assets/images/defaultImage.png')"
                class="d-block w-100"
                alt="Default Image"
              />
              <CCarouselCaption>
                <h5>No detection images available</h5>
              </CCarouselCaption>
            </div>
          </CCarouselItem>
        </CCarousel>
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
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CBadge } from "@coreui/vue";

export default {
  name: "HistoryChecksheet",
  props: {
    checksheet: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showPhotoModal: false,
      showImageModal: false,
      selectedImage: null,
      selectedItem: null,
      loading: false,
    };
  },
  computed: {
    ...mapGetters("checksheets", ["getPart"]),
    ...mapGetters("yoloDetections", [
      "allDetections",
      "isLoading",
      "hasDetections",
      "getLatestDetection",
    ]),

    detections() {
      return this.allDetections;
    },
  },

  methods: {
    ...mapActions("checksheets", ["fetchParts"]),
    ...mapActions("yoloDetections", ["fetchDetections"]),

    async fetchPartsData() {
      if (this.checksheet?.items) {
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

        if (partIds.length > 0) {
          await this.fetchParts(partIds);
        }
      }
    },

    getPartName(partId) {
      if (!partId) return "-";
      const part = this.getPart(partId);
      return part ? part.part_nm : "-";
    },

    getStatusColor(approvedStatus) {
      switch (approvedStatus) {
        case "approved":
          return "success";
        case "rejected":
          return "danger";
        default:
          return "secondary";
      }
    },
    async openPhotoModal() {
      this.showPhotoModal = true;
      await this.fetchDetections();
    },
    closePhotoModal() {
      this.showPhotoModal = false;
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
    handleSlideShow() {
      this.currentSlide = index;
    },
    goBack() {
      this.$emit("back");
    },
    generateAndExportPDF() {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add title with styling
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        "Preventive Maintenance Checksheet History",
        doc.internal.pageSize.width / 2,
        15,
        { align: "center" }
      );

      // Add header details
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Left column details
      const leftStartY = 25;
      doc.text(`Date               : ${this.checksheet.date}`, 10, leftStartY);
      doc.text(
        `Submitted By : ${this.checksheet.submittedBy}`,
        10,
        leftStartY + 6
      );
      doc.text(
        `Reviewed By  : ${this.checksheet.reviewedBy}`,
        10,
        leftStartY + 12
      );

      // Right column details
      const rightStartX = doc.internal.pageSize.width - 80;
      doc.text(
        `Kanban No.   : ${this.checksheet.kanbanNo}`,
        rightStartX,
        leftStartY
      );
      doc.text(
        `Machine        : ${this.checksheet.machineName}`,
        rightStartX,
        leftStartY + 6
      );
      doc.text(
        `Period           : ${this.checksheet.period}`,
        rightStartX,
        leftStartY + 12
      );

      // Add table
      doc.autoTable({
        startY: leftStartY + 20,
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: [66, 135, 245],
          halign: "center",
          valign: "middle",
          fontSize: 8,
          cellPadding: 2,
        },
        head: [
          [
            "No",
            "Part",
            "Item Check",
            "Period",
            "Standard",
            "Min Value",
            "Max Value",
            "Unit",
            "Input",
            "Result",
            "Review",
            "Reject Reason",
          ],
        ],
        body: this.checksheet.items.map((item, index) => [
          index + 1,
          this.getPartName(item.part_id),
          item.itemCheck || "-",
          item.period || "-",
          item.standard || "-",
          item.minValue || "-",
          item.maxValue || "-",
          item.unit || "-",
          item.input || "-",
          {
            content: item.result || "-",
            styles: {
              fillColor:
                item.result === "OK"
                  ? [230, 244, 234] // Light green
                  : item.result === "NG"
                  ? [251, 233, 231] // Light red
                  : [255, 255, 255], // White
              textColor:
                item.result === "OK"
                  ? [21, 87, 36] // Dark green
                  : item.result === "NG"
                  ? [114, 28, 36] // Dark red
                  : [0, 0, 0], // Black
            },
          },
          {
            content: item.review || "-",
            styles: {
              fillColor:
                item.review === "approved"
                  ? [230, 244, 234]
                  : item.review === "rejected"
                  ? [251, 233, 231]
                  : [255, 255, 255],
            },
          },
          item.reject || "-",
        ]),
        columnStyles: {
          0: { cellWidth: 10 }, // No
          1: { cellWidth: 30 }, // Part
          2: { cellWidth: 40 }, // Item Check
          3: { cellWidth: 20 }, // Period
          4: { cellWidth: 25 }, // Standard
          5: { cellWidth: 20 }, // Min Value
          6: { cellWidth: 20 }, // Max Value
          7: { cellWidth: 15 }, // Unit
          8: { cellWidth: 20 }, // Input
          9: { cellWidth: 20 }, // Result
          10: { cellWidth: 20 }, // Review
          11: { cellWidth: 30 }, // Reject Reason
        },
        theme: "grid",
        didDrawPage: function (data) {
          // Add footer on each page
          doc.setFontSize(8);
          doc.text(
            `Generated on: ${new Date().toLocaleString()}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
          doc.text(
            `Page ${data.pageCount}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10
          );
        },
      });

      // Add signature boxes after the table
      const boxWidth = 50;
      const boxHeight = 30;
      const startX = doc.internal.pageSize.width - (3 * boxWidth + 20 + 10); // Starting position from right
      const startY = doc.internal.pageSize.height - 50; // Position from bottom
      const padding = 10;

      // Function to draw a signature box
      function drawSignatureBox(x, y, title) {
        // Draw box
        doc.rect(x, y, boxWidth, boxHeight);

        // Add title above box
        doc.setFontSize(8);
        doc.text(title, x + boxWidth / 2, y - 2, { align: "center" });

        // Add "Sign & Date" text at bottom of box
        doc.setFontSize(6);
        doc.text("Sign & Date", x + boxWidth / 2, y + boxHeight - 2, {
          align: "center",
        });
      }

      // Draw three signature boxes
      drawSignatureBox(startX, startY, "Team Leader");
      drawSignatureBox(startX + boxWidth + padding, startY, "Group Leader");
      drawSignatureBox(
        startX + 2 * (boxWidth + padding),
        startY,
        "Section Head"
      );

      // Add Notes section if exists
      if (this.checksheet.notes) {
        doc.addPage("landscape");
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Notes:", 10, 15);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const splitNotes = doc.splitTextToSize(
          this.checksheet.notes,
          doc.internal.pageSize.width - 20
        );
        doc.text(splitNotes, 10, 25);
      }

      // Generate PDF as blob
      const pdfBlob = doc.output("blob");

      // Create a blob URL
      const blobUrl = URL.createObjectURL(
        new Blob([pdfBlob], { type: "application/pdf" })
      );

      // Open PDF in a new tab
      window.open(blobUrl, "_blank");
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
  },

  async created() {
    await this.fetchPartsData();
    await this.fetchDetections();
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
</style>
