<template>
  <CModal
    :visible="visible"
    @close="handleClose"
    class="threshold-settings-modal"
  >
    <CModalHeader>
      <CModalTitle>
        <CIcon icon="cil-settings" class="me-2"></CIcon>
        Vibration Threshold Settings
      </CModalTitle>
    </CModalHeader>

    <CModalBody>
      <CForm>
        <div v-for="axis in availableAxes" :key="axis" class="mb-4">
          <h6 class="border-bottom pb-2">
            {{ axis.toUpperCase() }} Axis Thresholds
          </h6>
          <CRow>
            <CCol md="6">
              <div class="mb-3">
                <CFormLabel>
                  Warning Threshold ({{ sensorConfig.unit }})
                </CFormLabel>
                <CFormInput
                  type="number"
                  step="0.1"
                  v-model.number="formData.warningThreshold[axis]"
                  :min="sensorConfig.min"
                  :max="formData.criticalThreshold[axis]"
                  :state="validateWarningThreshold(axis)"
                  @input="validateForm"
                />
                <CFormFeedback invalid>
                  Warning threshold must be less than critical threshold
                </CFormFeedback>
              </div>
            </CCol>
            <CCol md="6">
              <div class="mb-3">
                <CFormLabel>
                  Critical Threshold ({{ sensorConfig.unit }})
                </CFormLabel>
                <CFormInput
                  type="number"
                  step="0.1"
                  v-model.number="formData.criticalThreshold[axis]"
                  :min="formData.warningThreshold[axis]"
                  :max="sensorConfig.max"
                  :state="validateCriticalThreshold(axis)"
                  @input="validateForm"
                />
                <CFormFeedback invalid>
                  Critical threshold must be greater than warning threshold
                </CFormFeedback>
              </div>
            </CCol>
          </CRow>
        </div>

        <!-- Current Settings Preview -->
        <div class="current-settings mt-4 p-3 bg-light rounded">
          <h6 class="mb-3">Current Configuration</h6>
          <div class="small">
            <div v-for="axis in availableAxes" :key="axis" class="mb-2">
              <strong>{{ axis.toUpperCase() }} Axis:</strong>
              <span class="text-warning ms-2">
                Warning: {{ sensorConfig.warningThreshold[axis] }}
                {{ sensorConfig.unit }}
              </span>
              <span class="text-danger ms-2">
                Critical: {{ sensorConfig.criticalThreshold[axis] }}
                {{ sensorConfig.unit }}
              </span>
            </div>
          </div>
        </div>
      </CForm>
    </CModalBody>

    <CModalFooter>
      <CButton color="secondary" @click="handleClose"> Cancel </CButton>
      <CButton
        color="primary"
        @click="handleSubmit"
        :disabled="!isFormValid || loading"
      >
        <CSpinner v-if="loading" size="sm" class="me-2" />
        {{ loading ? "Saving..." : "Save Changes" }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "ThresholdSettings",

  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    machineId: {
      type: [String, Number],
      required: true,
    },
    sensorConfig: {
      type: Object,
      required: true,
    },
    availableAxes: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      loading: false,
      isFormValid: true,
      formData: {
        warningThreshold: {},
        criticalThreshold: {},
      },
    };
  },

  created() {
    this.initializeForm();
  },

  computed: {
    ...mapState("thresholds", ["loading"]),
  },

  methods: {
    ...mapActions("thresholds", ["updateThresholds", "resetThresholds"]),

    initializeForm() {
      this.availableAxes.forEach((axis) => {
        this.formData.warningThreshold[axis] =
          this.sensorConfig.warningThreshold[axis];
        this.formData.criticalThreshold[axis] =
          this.sensorConfig.criticalThreshold[axis];
      });
    },

    validateWarningThreshold(axis) {
      if (
        !this.formData.warningThreshold[axis] ||
        !this.formData.criticalThreshold[axis]
      ) {
        return true;
      }
      return (
        this.formData.warningThreshold[axis] <
        this.formData.criticalThreshold[axis]
      );
    },

    validateCriticalThreshold(axis) {
      if (
        !this.formData.warningThreshold[axis] ||
        !this.formData.criticalThreshold[axis]
      ) {
        return true;
      }
      return (
        this.formData.criticalThreshold[axis] >
        this.formData.warningThreshold[axis]
      );
    },

    validateForm() {
      this.isFormValid = this.availableAxes.every((axis) => {
        return (
          this.validateWarningThreshold(axis) &&
          this.validateCriticalThreshold(axis)
        );
      });
    },

    async handleSubmit() {
      try {
        this.loading = true;
        await this.updateThresholds({
          machineId: this.machineId,
          sensorId: "ACCEL001",
          warningThreshold: this.formData.warningThreshold,
          criticalThreshold: this.formData.criticalThreshold,
        });

        this.$emit("updated");
        this.$emit("close");
      } catch (error) {
        console.error("Failed to update thresholds:", error);
        // You might want to show an error notification here
      } finally {
        this.loading = false;
      }
    },

    handleClose() {
      this.initializeForm(); // Reset form to original values
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.threshold-settings-modal {
  max-width: 600px;

  .current-settings {
    border: 1px solid #dee2e6;
  }

  h6 {
    color: #495057;
    font-weight: 600;
  }

  .form-label {
    font-size: 0.875rem;
    color: #6c757d;
  }

  .form-control {
    &:focus {
      box-shadow: none;
      border-color: #80bdff;
    }
  }
}

@media (max-width: 575.98px) {
  .threshold-settings-modal {
    margin: 0.5rem;

    .modal-body {
      padding: 1rem;
    }
  }
}
</style>
