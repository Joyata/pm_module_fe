<template>
  <CModal :visible="visible" @close="handleClose" class="export-modal">
    <CModalHeader>
      <CModalTitle>
        <CIcon icon="cil-cloud-download" class="me-2"></CIcon>
        Export Sensor Data
      </CModalTitle>
    </CModalHeader>

    <CModalBody>
      <CForm>
        <!-- Time Range Selection -->
        <CRow class="mb-3">
          <CCol>
            <CFormLabel>Time Range</CFormLabel>
            <CFormSelect
              v-model="exportTimeRange"
              @change="handleExportRangeChange"
            >
              <option value="preset">Preset Ranges</option>
              <option value="custom">Custom Range</option>
            </CFormSelect>
          </CCol>
        </CRow>

        <!-- Preset Ranges -->
        <CRow class="mb-3" v-if="exportTimeRange === 'preset'">
          <CCol>
            <CFormSelect v-model="exportRange" :options="exportRangeOptions" />
          </CCol>
        </CRow>

        <!-- Custom Date Range -->
        <template v-if="exportTimeRange === 'custom'">
          <CRow class="mb-3">
            <CCol md="6">
              <CFormLabel>Start Date & Time</CFormLabel>
              <CFormInput
                type="datetime-local"
                v-model="customStartTime"
                :max="currentDateTime"
              />
            </CCol>
            <CCol md="6">
              <CFormLabel>End Date & Time</CFormLabel>
              <CFormInput
                type="datetime-local"
                v-model="customEndTime"
                :max="currentDateTime"
                :min="customStartTime"
              />
            </CCol>
          </CRow>
        </template>

        <!-- Export Format -->
        <CRow class="mb-3">
          <CCol>
            <CFormLabel>Format</CFormLabel>
            <CFormSelect
              v-model="exportFormat"
              :options="exportFormatOptions"
            />
          </CCol>
        </CRow>

        <!-- Export Options -->
        <CRow>
          <CCol>
            <div class="export-options">
              <CFormCheck
                v-model="includeAlerts"
                label="Include alert history"
              />
              <CFormCheck v-model="includeStats" label="Include statistics" />
            </div>
          </CCol>
        </CRow>
      </CForm>
    </CModalBody>

    <CModalFooter>
      <CButton color="secondary" @click="handleClose"> Cancel </CButton>
      <CButton
        color="primary"
        @click="handleExport"
        :disabled="!isExportValid || isLoading"
      >
        <CSpinner v-if="isLoading" size="sm" class="me-2" />
        <CIcon icon="cil-cloud-download" class="me-2"></CIcon>
        {{ isLoading ? "Exporting..." : "Export" }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";

export default {
  name: "ExportModal",

  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    currentDateTime: {
      type: String,
      default: () => new Date().toISOString().slice(0, 16),
    },
  },

  data() {
    return {
      isLoading: false,
      exportTimeRange: "preset",
      exportRange: "current",
      exportFormat: "csv",
      includeAlerts: false,
      includeStats: false,
      customStartTime: "",
      customEndTime: "",
      exportRangeOptions: [
        { label: "Current View", value: "current" },
        { label: "Last Hour", value: "1h" },
        { label: "Last 4 Hours", value: "4h" },
        { label: "Last 12 Hours", value: "12h" },
        { label: "Last 24 Hours", value: "24h" },
      ],
      exportFormatOptions: [
        { label: "CSV", value: "csv" },
        { label: "JSON", value: "json" },
        { label: "Excel", value: "xlsx" },
      ],
    };
  },

  computed: {
    ...mapState({
      isLoading: (state) => state.exports.isExporting,
      exportError: (state) => state.exports.error,
    }),

    isExportValid() {
      if (this.exportTimeRange === "custom") {
        return (
          this.customStartTime &&
          this.customEndTime &&
          new Date(this.customStartTime) < new Date(this.customEndTime)
        );
      }
      return true;
    },
  },

  watch: {
    exportError(error) {
      if (error) {
        this.$emit("error", error);
      }
    },
  },

  methods: {
    handleExportRangeChange() {
      if (this.exportTimeRange === "custom") {
        const now = new Date();
        const yesterday = new Date(now - 24 * 60 * 60 * 1000);
        this.customEndTime = now.toISOString().slice(0, 16);
        this.customStartTime = yesterday.toISOString().slice(0, 16);
      }
    },

    async handleExport() {
      try {
        const exportConfig = {
          timeRange: this.exportTimeRange,
          range: this.exportRange,
          format: this.exportFormat,
          includeAlerts: this.includeAlerts,
          includeStats: this.includeStats,
          customRange:
            this.exportTimeRange === "custom"
              ? {
                  startTime: this.customStartTime,
                  endTime: this.customEndTime,
                }
              : null,
        };

        this.$emit("export", exportConfig);
        this.handleClose();
      } catch (error) {
        console.error("Export failed:", error);
        this.$emit("error", error.message);
      }
    },

    handleClose() {
      // Reset form to default values
      this.exportTimeRange = "preset";
      this.exportRange = "current";
      this.exportFormat = "csv";
      this.includeAlerts = false;
      this.includeStats = false;
      this.customStartTime = "";
      this.customEndTime = "";

      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.export-modal {
  max-width: 600px;

  .modal-content {
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    padding: 1rem 1.5rem;

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
    }
  }

  .export-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: #f8f9fa;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .form-label {
    font-size: 0.875rem;
    font-weight: 500;
  }
}

@media (max-width: 575.98px) {
  .export-modal {
    margin: 0.5rem;

    .modal-body {
      padding: 1rem;
    }
  }
}
</style>
