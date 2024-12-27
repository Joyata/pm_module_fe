<template>
  <Teleport to="body">
    <CModal size="lg" :visible="visible" @close="onClose">
      <CModalHeader>
        <CModalTitle>Scan QR Code on Machine</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div class="camera-container">
          <QrcodeStream @decode="onDecode" @init="onInit" />
        </div>
        <CRow class="mt-3">
          <CCol>
            <CInputGroup class="mb-3">
              <CInputGroupText class="justify-content-center"
                >Scan Result</CInputGroupText
              >
              <CFormInput
                disabled
                type="text"
                class="form-control"
                :placeholder="'Scanned QR Code Content'"
                :value="scanResult"
              ></CFormInput>
            </CInputGroup>
          </CCol>
        </CRow>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="onClose">Close</CButton>
      </CModalFooter>
    </CModal>
  </Teleport>
</template>

<script>
import { QrcodeStream } from "vue-qrcode-reader";

export default {
  name: "QRCodeScanningModal",
  components: {
    QrcodeStream,
  },
  props: {
    visible: Boolean,
    onClose: Function,
    onDecode: Function,
    onInit: Function,
  },
  data() {
    return {
      scanResult: "",
    };
  },
  methods: {
    handleDecode(content) {
      this.scanResult = content;
      if (this.onDecode) {
        this.onDecode(content);
      }
    },
    handleInit(promise) {
      if (this.onInit) {
        this.onInit(promise);
      }
    },
  },
};
</script>

<style scoped>
.camera-container {
  width: 300px;
  height: 300px;
  margin: 0 auto;
}
</style>
