<template>
  <CModal :visible="visible" fullscreen @close="closeModal">
    <CModalHeader>
      <CModalTitle>Checksheet Review</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CCard class="mb-4">
        <CCardBody>
          <CRow>
            <Ccol :sm="6">
              <p><strong>Kanban No.:</strong> {{ checksheet.kanbanNo }}</p>
              <p><strong>Submitted By:</strong> {{ checksheet.submittedBy }}</p>
            </Ccol>
            <Ccol :sm="6">
              <p><strong>Date Submitted:</strong> {{ checksheet.date }}</p>
              <p><strong>Machine Name:</strong> {{ checksheet.machineName }}</p>
            </Ccol>
          </CRow>
        </CCardBody>
      </CCard>

      <CTable striped hover responsive>
        <CTableHead color="dark">
          <CTableBody>
            <<CTableRow v-for="item in checksheet.items" :key="item.id">
              <CTableDataCell>{{ item.description }}</CTableDataCell>
              <CTableDataCell>
                <CBadge :color="item.result === 'OK' ? 'success' : 'danger'">
                  {{ item.result }}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="primary"
                  size="sm"
                  @click="approveItem(item.id)"
                  :disabled="item.approved"
                >
                  {{ item.approved ? "Approved" : "Approve" }}
                </CButton>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTableHead>
      </CTable>

      <CRow class="mt-4">
        <CCol>
          <CButton color="success" @click="approveAll" :disabled="allApproved"
            >Approve All</CButton
          >
        </CCol>
      </CRow>

      <CRow class="mt-4">
        <CCol>
          <h4>Photos</h4>
          <div class="d-flex flex-wrap">
            <div
              v-for="(photo, index) in checksheet.photos"
              :key="index"
              class="m-2"
            >
              <img
                :src="photo"
                :alt="`Checksheet photo ${index + 1}`"
                style="max-width: 200px; max-height: 200px; object-fit: cover"
              />
            </div>
          </div>
        </CCol>
      </CRow>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="closeModal">Close</CButton>
      <CButton color="primary" @click="submitApproval" :disabled="!allApproved"
        >Submit Approval</CButton
      >
    </CModalFooter>
  </CModal>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "ChecksheetReviewModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    checksheet: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      approvedItems: new Set(),
    };
  },
  computed: {
    allApproved() {
      return this.approvedItems.size === this.checksheet.items.length;
    },
  },
  methods: {
    ...mapActions("checksheets", ["approveChecksheet"]),
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    approveItem(itemId) {
      if (this.approvedItems.has(itemId)) {
        this.approvedItems.delete(itemId);
      } else {
        this.approvedItems.add(itemId);
      }
    },
    approveAll() {
      this.checksheet.items.forEach((item) => this.approvedItems.add(item.id));
    },
    async submitApproval() {
      if (this.allApproved) {
        await this.approveChecksheet(this.checksheet.id);
        this.closeModal();
      }
    },
    closeModal() {
      this.$emit("update:visible", false);
    },
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        this.approvedItems.clear();
      }
    },
  },
};
</script>
