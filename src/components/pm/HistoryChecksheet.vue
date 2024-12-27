<template>
  <div v-if="checksheet">
    <CRow>
      <CCol :xs="12">
        <CCard>
          <CCardHeader>
            <div class="d-flex justify-content-between">
              <CCardTitle>Check Sheet - {{ checksheet.kanbanNo }}</CCardTitle>
              <CButton size="sm" color="secondary" @click="goBack"
                >Back</CButton
              >
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow class="align-items-stretch">
              <CCol :md="3">
                <CRow>
                  <CCol :xs="12" class="mb-3">
                    <CInputGroup>
                      <CInputGroupText style="width: 110px"
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
                      <CInputGroupText style="width: 110px"
                        >Submitted By</CInputGroupText
                      >
                      <CFormInput
                        :value="checksheet.submittedBy"
                        readonly
                      ></CFormInput>
                    </CInputGroup>
                  </CCol>
                  <CCol :xs="12">
                    <CInputGroup>
                      <CInputGroupText style="width: 110px"
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
              <CCol :md="3">
                <CRow>
                  <CCol :xs="12" class="mb-3">
                    <CInputGroup>
                      <CInputGroupText style="width: 110px"
                        >Machine No.</CInputGroupText
                      >
                      <CFormInput
                        :value="checksheet.machineNo"
                        readonly
                      ></CFormInput>
                    </CInputGroup>
                  </CCol>
                  <CCol :xs="12">
                    <CInputGroup>
                      <CInputGroupText style="width: 110px"
                        >Machine Name</CInputGroupText
                      >
                      <CFormInput
                        :value="checksheet.machineName"
                        readonly
                      ></CFormInput>
                    </CInputGroup>
                  </CCol>
                </CRow>
              </CCol>
              <CCol :md="2">
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
              <CCol :md="2">
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
              <CCol :md="2">
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

    <CRow class="mt-3" v-if="checksheet.items && checksheet.items.length">
      <CCol :xs="12">
        <CCard>
          <CCardBody>
            <CTable align="middle" responsive hover bordered>
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell scope="col">No</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Item Check</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Method</CTableHeaderCell>
                  <CTableHeaderCell scope="col"
                    >Machine Condition</CTableHeaderCell
                  >
                  <CTableHeaderCell scope="col">Duration</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Standard</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Min. Value</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Max. Value</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Input</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Result</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Remarks</CTableHeaderCell>
                  <CTableHeaderCell scope="col"
                    >Approval Status</CTableHeaderCell
                  >
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(item, index) in checksheet.items"
                  :key="index"
                >
                  <CTableDataCell>{{ index + 1 }}</CTableDataCell>
                  <CTableDataCell>{{ item.itemCheck }}</CTableDataCell>
                  <CTableDataCell>{{ item.method }}</CTableDataCell>
                  <CTableDataCell>{{ item.machineCondition }}</CTableDataCell>
                  <CTableDataCell>{{ item.duration }}</CTableDataCell>
                  <CTableDataCell>{{ item.standard }}</CTableDataCell>
                  <CTableDataCell>{{ item.minValue }}</CTableDataCell>
                  <CTableDataCell>{{ item.maxValue }}</CTableDataCell>
                  <CTableDataCell>{{ item.input }}</CTableDataCell>
                  <CTableDataCell
                    :class="{
                      'bg-success text-white': item.result === 'OK',
                      'bg-danger text-white': item.result === 'NG',
                    }"
                    style="text-align: center"
                    >{{ item.result }}</CTableDataCell
                  >
                  <CTableDataCell>{{ item.remarks }}</CTableDataCell>
                  <CTableDataCell style="text-align: center">
                    <CBadge
                      :color="getStatusColor(item.approved)"
                      shape="rounded-pill"
                      >{{ item.approved }}</CBadge
                    >
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <CRow class="mt-3">
      <CCol class="d-grid d-md-flex justify-content-end">
        <CButton color="primary" size="lg" @click="generateAndExportPDF"
          >Export to PDF</CButton
        >
      </CCol>
    </CRow>

    <!-- Photo Modal -->
    <Teleport to="body">
      <CModal :visible="showPhotoModal" @close="closePhotoModal" size="lg">
        <CModalHeader>
          <CModalTitle>Captured Photo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <img
            :src="require('@/assets/images/defaultImage.png')"
            alt="Large Dummy Photo"
            class="img-fluid"
          />
        </CModalBody>
      </CModal>
    </Teleport>
  </div>

  <CAlert v-else color="warning"
    >No checksheet selected or data is not available.</CAlert
  >
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
    };
  },
  computed: {
    ...mapGetters("checksheets", ["selectedChecksheet"]),
  },
  methods: {
    getStatusColor(approvedStatus) {
      switch (approvedStatus) {
        case "APPROVED":
          return "success";
        case "REJECTED":
          return "danger";
        default:
          return "secondary";
      }
    },
    openPhotoModal() {
      this.showPhotoModal = true;
    },
    closePhotoModal() {
      this.showPhotoModal = false;
    },
    goBack() {
      this.$emit("back");
    },
    generateAndExportPDF() {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text("Preventive Maintenance Checksheet", 14, 22);

      // Add checksheet details
      doc.setFontSize(12);
      doc.text(`Date: ${this.checksheet.date}`, 14, 32);
      doc.text(`Kanban No.: ${this.checksheet.kanbanNo}`, 14, 40);
      doc.text(`Machine Name: ${this.checksheet.machineName}`, 14, 48);
      doc.text(`Machine No.: ${this.checksheet.machineNo}`, 14, 56);
      doc.text(`Period: ${this.checksheet.period}`, 14, 64);
      doc.text(`Submitted By: ${this.checksheet.submittedBy}`, 14, 72);
      doc.text(`Reviewed By: ${this.checksheet.reviewedBy}`, 14, 80);
      doc.text(`Status: ${this.checksheet.status}`, 14, 88);

      // Add checksheet items
      doc.autoTable({
        startY: 96,
        head: [
          [
            "No",
            "Item Check",
            "Method",
            "Machine Condition",
            "Duration",
            "Standard",
            "Min Value",
            "Max Value",
            "Input",
            "Result",
            "Remarks",
            "Approval Status",
          ],
        ],
        body: this.checksheet.items.map((item, index) => [
          index + 1,
          item.itemCheck,
          item.method,
          item.machineCondition,
          item.duration,
          item.standard,
          item.minValue,
          item.maxValue,
          item.input,
          item.result,
          item.remarks,
          item.approved,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 135, 245] },
      });

      // Generate PDF as blob
      const pdfBlob = doc.output("blob");

      // Create a blob URL
      const blobUrl = URL.createObjectURL(
        new Blob([pdfBlob], { type: "application/pdf" })
      );

      // Open PDF in a new tab
      window.open(blobUrl, "_blank");
    },
  },
};
</script>

<style scoped>
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
</style>
