<!-- components/pm/MachineMonitor.vue -->
<template>
  <div>
    <!-- Back Button -->
    <CRow class="mb-4">
      <CCol>
        <CButton color="dark" @click="goBack" class="d-flex align-items-center">
          <CIcon icon="cil-arrow-left" class="me-2"></CIcon>
          Back to Shop Floor
        </CButton>
      </CCol>
    </CRow>

    <!-- Main Card -->
    <CCard class="mb-4">
      <CCardHeader class="bg-light">
        <CRow class="align-items-center">
          <CCol>
            <h4 class="mb-0 d-flex align-items-center">
              <CIcon icon="cil-monitor" class="me-2"></CIcon>
              Machine {{ id }} Monitoring
            </h4>
          </CCol>
          <CCol class="text-end">
            <MachineStatus
              :status="machineStatus"
              :get-status-icon="getStatusIcon"
            />
          </CCol>
        </CRow>
      </CCardHeader>

      <CCardBody>
        <!-- Control Panel -->
        <ControlPanel
          :time-ranges="timeRanges"
          :selected-range="selectedTimeRange"
          :is-monitoring="isMonitoring"
          @range-change="changeTimeRange"
          @toggle-monitoring="toggleMonitoring"
          @show-export="showExportModal = true"
        />

        <!-- Date Range Filter -->
        <CRow class="mb-3">
          <CCol sm="6" lg="4">
            <VueDatePicker
              v-model="dateRange"
              range
              auto-apply
              :format="datePickerFormat"
              :timezone="'Asia/Jakarta'"
              model-type="timestamp"
              placeholder="Filter by Date Range"
              :enable-time-picker="true"
              :clearable="true"
              :text-input="true"
              :preview-format="datePickerFormat"
              @update:model-value="handleDateRangeChange"
            >
            </VueDatePicker>
          </CCol>
        </CRow>

        <!-- Sensor Charts Section -->
        <div v-if="!isLoading">
          <!-- Vibration Chart -->
          <VibrationChart
            :sensor-data="sensorData.vibration"
            :current-values="currentValues.vibration"
            :sensor-config="sensorConfigs.vibration"
            :available-axes="availableAxes.vibration.axes"
            :date-range="dateRange"
            :is-admin="isAdmin"
            :chart-key="chartKeys.vibration"
            @show-settings="showThresholdSettings.vibration = true"
            class="mb-4"
          />

          <!-- Power Chart -->
          <PowerChart
            :sensor-data="sensorData.power"
            :current-values="currentValues.power"
            :sensor-config="sensorConfigs.power"
            :available-axes="availableAxes.power.axes"
            :date-range="dateRange"
            :is-admin="isAdmin"
            :chart-key="chartKeys.power"
            @show-settings="showThresholdSettings.power = true"
            class="mb-4"
          />

          <!-- Temperature Chart -->
          <TemperatureChart
            :sensor-data="sensorData.temperature"
            :current-values="currentValues.temperature"
            :sensor-config="sensorConfigs.temperature"
            :available-axes="availableAxes.temperature.axes"
            :date-range="dateRange"
            :is-admin="isAdmin"
            :chart-key="chartKeys.temperature"
            @show-settings="showThresholdSettings.temperature = true"
          />
        </div>

        <!-- Loading State -->
        <CRow v-else class="justify-content-center">
          <CCol class="text-center py-4">
            <CSpinner />
            <div class="mt-2">Loading data...</div>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- Notifications -->
    <AlertNotification ref="alertNotification" @close="closeAlert" />

    <!-- Modals -->
    <ExportModal
      :visible="showExportModal"
      :current-date-time="currentDateTime"
      @close="showExportModal = false"
      @export="handleExport"
    />

    <ThresholdSettings
      v-if="isAdmin"
      v-for="sensorType in sensorTypes"
      :key="sensorType"
      :visible="showThresholdSettings[sensorType]"
      :machine-id="id"
      :sensor-config="sensorConfigs[sensorType]"
      :available-axes="availableAxes[sensorType].axes"
      @close="showThresholdSettings[sensorType] = false"
      @updated="loadThresholds(sensorType)"
    />
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import VueApexCharts from "vue3-apexcharts";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import AlertNotification from "../../components/pm/AlertNotification.vue";
import MachineStatus from "../../components/pm/MachineStatus.vue";
import ControlPanel from "../../components/pm/ControlPanel.vue";
import VibrationChart from "../charts/VibrationChart.vue";
import PowerChart from "../charts/PowerChart.vue";
import TemperatureChart from "../charts/TemperatureChart.vue";
import ExportModal from "../../components/pm/ExportModal.vue";
import ThresholdSettings from "../../components/pm/ThresholdSettings.vue";
import api from "@/apis/CommonAPI";

export default {
  name: "MachineMonitor",

  components: {
    apexchart: VueApexCharts,
    VueDatePicker,
    AlertNotification,
    MachineStatus,
    ControlPanel,
    VibrationChart,
    PowerChart,
    TemperatureChart,
    ExportModal,
    ThresholdSettings,
  },

  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },

  data() {
    return {
      updateInterval: 5000, // 5 seconds
      isMonitoring: true,
      sensorTypes: ["vibration", "power", "temperature"],
      chartKeys: {
        vibration: 0,
        power: 0,
        temperature: 0,
      },
      currentValues: {
        vibration: {
          x: 0,
          y: 0,
          z: 0,
        },
        power: {
          voltage: 0,
          current: 0,
          frequency: 0,
        },
        temperature: {
          celcius: 0,
        },
      },
      sensorData: {
        vibration: {
          x: [],
          y: [],
          z: [],
        },
        power: {
          voltage: [],
          current: [],
          frequency: [],
        },
        temperature: {
          celcius: [],
        },
      },
      availableAxes: {
        vibration: {
          axes: ["x", "y", "z"],
        },
        power: {
          axes: ["voltage", "current", "frequency"],
        },
        temperature: {
          axes: ["celcius"],
        },
      },
      isLoading: false,
      selectedTimeRange: "1h",
      timeRanges: [
        { label: "1H", value: "1h", description: "Last Hour" },
        { label: "4H", value: "4h", description: "Last 4 Hours" },
        { label: "12H", value: "12h", description: "Last 12 Hours" },
        { label: "24H", value: "24h", description: "Last 24 Hours" },
      ],
      machineStatus: {
        text: "Running",
        color: "success",
      },
      sensorConfigs: {
        vibration: {
          name: "Vibration",
          unit: "mm/s²",
          min: -2,
          max: 12,
          axes: ["x", "y", "z"],
          sensorId: "ACCEL001",
          columnName: "sensor01_acc_xyz",
          warningThreshold: {
            x: 0.5,
            y: 0.5,
            z: 11,
          },
          criticalThreshold: {
            x: 1,
            y: 1,
            z: 11.5,
          },
          colors: {
            x: "#4BC0C0",
            y: "#FF6384",
            z: "#FFCE56",
          },
        },
        power: {
          name: "Power",
          unit: "V/A/Hz",
          min: 0,
          max: 250,
          axes: ["voltage", "current", "frequency"],
          sensorId: "POWER001",
          columnName: "sensor02_pwr_vcf",
          warningThreshold: {
            voltage: 230,
            current: 10,
            frequency: 51,
          },
          criticalThreshold: {
            voltage: 240,
            current: 15,
            frequency: 52,
          },
          colors: {
            voltage: "#4BC0C0",
            current: "#FF6384",
            frequency: "#FFCE56",
          },
        },
        temperature: {
          name: "Temperature",
          unit: "°C",
          min: 0,
          max: 150,
          axes: ["celcius"],
          sensorId: "TEMPERATURE001",
          columnName: "sensor03_temp_c",
          warningThreshold: {
            celcius: 70,
          },
          criticalThreshold: {
            celcius: 85,
          },
          colors: {
            celcius: "#FF9F40",
          },
        },
      },
      alertHistory: [],
      showExportModal: false,
      showThresholdSettings: {
        vibration: false,
        power: false,
        temperature: false,
      },
      dateRange: null,
      datePickerFormat: "MMM dd, yyyy HH:mm",
      currentDateTime: new Date().toISOString().slice(0, 16),
      updateTimer: null,
      retryAttempts: 0,
      maxRetries: 3,
    };
  },

  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      thresholdLoading: (state) => state.thresholds.loading,
    }),
    ...mapGetters("thresholds", ["currentThresholds"]),

    isAdmin() {
      return this.user?.role === "admin";
    },
  },

  async mounted() {
    if (this.isAdmin) {
      await this.loadThresholds();
    }
    await this.startDataUpdate();
  },

  beforeUnmount() {
    this.cleanupTimers();
  },

  methods: {
    ...mapActions("thresholds", ["fetchThresholds"]),

    // Data Fetching Functions
    async fetchDataWithRange(start, end) {
      try {
        this.isLoading = true;

        for (const sensorType of this.sensorTypes) {
          const config = this.sensorConfigs[sensorType];
          const url = `/ts/read-data?oldest_dt=${start.toISOString()}&newest_dt=${end.toISOString()}&sensor_col=${
            config.columnName
          }`;
          const response = await api.get(url, "?");

          if (response?.data?.data) {
            this.processSensorData(sensorType, response.data.data, false);
          } else {
            throw new Error("No data received for selected time range");
          }
        }
      } catch (error) {
        this.showAlert(
          "Data Fetch Error",
          error.message || "Failed to fetch sensor data",
          "danger"
        );
      } finally {
        this.isLoading = false;
      }
    },

    async fetchHistoricalData() {
      try {
        this.isLoading = true;
        const timeRange = this.getTimeRangeInSeconds();
        const endTime = new Date();
        const startTime = new Date(endTime - timeRange * 1000);

        for (const sensorType of this.sensorTypes) {
          const config = this.sensorConfigs[sensorType];
          const url = `/ts/read-data?oldest_dt=${startTime.toISOString()}&newest_dt=${endTime.toISOString()}&sensor_col=${
            config.columnName
          }`;

          const response = await api.get(url, "?");

          if (response?.data?.data) {
            this.processSensorData(sensorType, response.data.data);
          }
        }
      } catch (error) {
        if (this.retryAttempts < this.maxRetries) {
          this.retryAttempts++;
          await new Promise((resolve) =>
            setTimeout(resolve, 2000 * this.retryAttempts)
          );
          return this.fetchHistoricalData();
        }
        this.showAlert(
          "Connection Error",
          "Failed to fetch historical data after multiple attempts",
          "danger"
        );
      } finally {
        this.isLoading = false;
      }
    },

    async fetchLatestData() {
      if (!this.isMonitoring) return;

      try {
        for (const sensorType of this.sensorTypes) {
          const config = this.sensorConfigs[sensorType];
          const axes = config.axes;
          const newestData = this.sensorData[sensorType][axes[0]]?.slice(-1)[0];
          const newestTimestamp = newestData
            ? new Date(newestData.x)
            : new Date(Date.now() - 60000);

          const url = `/ts/read-data?oldest_dt=${newestTimestamp.toISOString()}&sensor_col=${
            config.columnName
          }`;

          const response = await api.get(url, "?");

          if (response?.data?.data) {
            const newData = response.data.data.filter(
              (reading) =>
                new Date(reading.timestamp).getTime() >
                newestTimestamp.getTime()
            );
            if (newData.length > 0) {
              this.processSensorData(sensorType, newData, true);
            }
          }
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          this.showAlert(
            "Connection Error",
            "Failed to fetch latest sensor data",
            "warning"
          );
        }
      }
    },

    // Data Processing Functions
    processSensorData(sensorType, data, isUpdate = false) {
      if (!data || !data.length) {
        this.showAlert(
          "No Data",
          `No ${sensorType} data available for the selected time range`,
          "warning"
        );
        return;
      }

      const config = this.sensorConfigs[sensorType];
      const processedData = {};

      config.axes.forEach((axis) => {
        processedData[axis] = data.map((reading) => ({
          x: new Date(reading.timestamp).getTime(),
          y: this.extractSensorValue(sensorType, reading, axis),
        }));
      });

      // Safety check before updating values
      if (!this.sensorData[sensorType]) {
        this.sensorData[sensorType] = {};
      }

      if (!this.currentValues[sensorType]) {
        this.currentValues[sensorType] = {};
      }

      // Update current values with latest reading
      const latestReading = data[data.length - 1];
      config.axes.forEach((axis) => {
        this.currentValues[sensorType][axis] = this.extractSensorValue(
          sensorType,
          latestReading,
          axis
        );
      });

      this.sensorData[sensorType] = processedData;
      this.updateMachineStatus(sensorType);
      this.chartKeys[sensorType] = Date.now();
    },

    extractSensorValue(sensorType, reading, axis) {
      switch (sensorType) {
        case "vibration":
          return reading.acceleration?.[axis] || 0;
        case "power":
          return reading.power?.[axis] || 0;
        case "temperature":
          return reading.temperature?.[axis] || 0;
        default:
          return 0;
      }
    },

    resetSensorData() {
      // Reset each sensor type's data
      this.sensorTypes.forEach((sensorType) => {
        const config = this.sensorConfigs[sensorType];

        // Reset current values
        this.currentValues[sensorType] = {};
        config.axes.forEach((axis) => {
          this.currentValues[sensorType][axis] = 0;
        });

        // Reset chart data
        this.sensorData[sensorType] = {};
        config.axes.forEach((axis) => {
          this.sensorData[sensorType][axis] = [];
        });

        // Reset chart key to force re-render
        this.chartKeys[sensorType] = Date.now();
      });
    },

    // Control Functions
    async startDataUpdate() {
      this.cleanupTimers();
      this.retryAttempts = 0;

      if (this.dateRange) {
        const [start, end] = this.dateRange;
        await this.fetchDataWithRange(new Date(start), new Date(end));
        return;
      }

      await this.fetchHistoricalData();

      if (!this.dateRange && this.isMonitoring) {
        this.updateTimer = setInterval(() => {
          this.fetchLatestData();
        }, this.updateInterval);
      }
    },

    cleanupTimers() {
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
        this.updateTimer = null;
      }
    },

    toggleMonitoring() {
      this.isMonitoring = !this.isMonitoring;
      if (this.isMonitoring) {
        this.startDataUpdate();
      } else {
        this.cleanupTimers();
      }
    },

    // Date Handling Functions
    handleDateRangeChange(range) {
      this.cleanupTimers();

      if (!range || !Array.isArray(range) || range.some((date) => !date)) {
        this.dateRange = null;
        this.isMonitoring = true; // Re-enable monitoring
        this.resetSensorData(); // Clear existing data
        this.startDataUpdate(); // Start fresh data fetch
        return;
      }

      try {
        const [start, end] = range.map((date) => new Date(date));
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error("Invalid date values");
        }

        this.dateRange = [start, end];
        this.isMonitoring = false;
        this.resetSensorData(); // Clear existing data before showing filtered data
        this.fetchDataWithRange(start, end);
      } catch (error) {
        this.showAlert(
          "Date Range Error",
          "Invalid date range selected",
          "warning"
        );
      }
    },

    changeTimeRange(range) {
      this.selectedTimeRange = range;
      this.dateRange = null;
      this.isMonitoring = true;
      this.resetSensorData();
      this.startDataUpdate();
    },

    getTimeRangeInSeconds() {
      const rangeMap = {
        "1h": 3600,
        "4h": 14400,
        "12h": 43200,
        "24h": 86400,
      };
      return rangeMap[this.selectedTimeRange] || 3600;
    },

    // Status Functions
    updateMachineStatus() {
      let highestSeverity = "success";
      let statusText = "Running";

      for (const sensorType of this.sensorTypes) {
        const config = this.sensorConfigs[sensorType];
        const values = this.currentValues[sensorType];

        if (!config || !values) continue;

        config.axes.forEach((axis) => {
          const value = values[axis];
          if (value === undefined) return;

          if (value > config.criticalThreshold[axis]) {
            highestSeverity = "danger";
            statusText = "Critical";
            this.showAlert(
              "Critical Alert",
              `${
                config.name
              } ${axis.toUpperCase()} has exceeded critical threshold: ${value.toFixed(
                2
              )} ${config.unit}`,
              "danger"
            );
          } else if (
            value > config.warningThreshold[axis] &&
            highestSeverity !== "danger"
          ) {
            highestSeverity = "warning";
            statusText = "Warning";
            this.showAlert(
              "Warning Alert",
              `${
                config.name
              } ${axis.toUpperCase()} has exceeded warning threshold: ${value.toFixed(
                2
              )} ${config.unit}`,
              "warning"
            );
          }
        });
      }

      this.machineStatus = {
        text: statusText,
        color: highestSeverity,
      };
    },

    // UI Helper Functions
    showAlert(title, message, type = "warning") {
      this.alertHistory.push({
        timestamp: new Date(),
        title,
        message,
        type,
      });

      if (this.$refs.alertNotification) {
        this.$refs.alertNotification.addNotification({
          title,
          message,
          type,
        });
      }
    },

    closeAlert() {
      if (this.$refs.alertNotification) {
        this.$refs.alertNotification.clearNotifications();
      }
    },

    goBack() {
      this.$router.push("/pm/machine");
    },

    getStatusIcon(status) {
      const icons = {
        success: "cil-check-circle",
        warning: "cil-warning",
        danger: "cil-x-circle",
      };
      return icons[status] || "cil-info";
    },

    // Threshold Management

    async loadThresholds() {
      try {
        for (const sensorType of this.sensorTypes) {
          const config = this.sensorConfigs[sensorType];
          await this.fetchThresholds({
            machineId: this.id,
            sensorId: config.sensorId,
          });

          // Update local sensor config with fetched thresholds
          if (this.currentThresholds) {
            this.sensorConfigs[sensorType] = {
              ...this.sensorConfigs[sensorType],
              warningThreshold: this.currentThresholds.warningThreshold,
              criticalThreshold: this.currentThresholds.criticalThreshold,
            };
          }
        }
      } catch (error) {
        this.showAlert(
          "Settings Error",
          "Failed to load threshold settings",
          "warning"
        );
      }
    },

    // Export Functions
    async handleExport(config) {
      try {
        // Prepare the data based on the selected time range
        let data;

        if (config.timeRange === "custom") {
          const start = new Date(config.customRange.startTime);
          const end = new Date(config.customRange.endTime);
          await this.fetchDataWithRange(start, end);
          data = this.prepareExportData(config);
        } else if (config.range === "current") {
          data = this.prepareExportData(config);
        } else {
          // Fetch historical data for the selected range
          const endTime = new Date();
          const startTime = new Date(
            endTime - this.getTimeRangeInSeconds(config.range) * 1000
          );
          await this.fetchDataWithRange(startTime, endTime);
          data = this.prepareExportData(config);
        }

        await this.$store.dispatch("exports/exportData", {
          data,
          format: config.format,
          machineId: this.id,
        });

        this.showAlert(
          "Export Successful",
          "Data has been exported successfully.",
          "success"
        );
      } catch (error) {
        this.showAlert(
          "Export Failed",
          error.message || "Failed to export data. Please try again.",
          "danger"
        );
      }
    },

    prepareExportData(config) {
      const data = {
        machineId: this.id,
        sensorData: this.sensorData,
        metadata: {
          sensors: this.sensorTypes.map((type) => ({
            id: this.sensorConfigs[type].sensorId,
            name: this.sensorConfigs[type].name,
            unit: this.sensorConfigs[type].unit,
            thresholds: {
              warning: this.sensorConfigs[type].warningThreshold,
              critical: this.sensorConfigs[type].criticalThreshold,
            },
          })),
          exportDate: new Date().toISOString(),
          timeRange:
            config.timeRange === "custom"
              ? `${config.customRange.startTime} to ${config.customRange.endTime}`
              : config.range,
        },
      };

      // Include alerts if requested
      if (config.includeAlerts) {
        data.alertHistory = this.alertHistory;
      }

      // Include statistics if requested
      if (config.includeStats) {
        data.statistics = this.calculateStatistics();
      }

      return data;
    },

    calculateStatistics() {
      const stats = {};

      this.sensorTypes.forEach((sensorType) => {
        stats[sensorType] = {};
        const config = this.sensorConfigs[sensorType];

        config.axes.forEach((axis) => {
          const values = this.sensorData[sensorType][axis].map(
            (reading) => reading.y
          );
          stats[sensorType][axis] = {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            warningThreshold: config.warningThreshold[axis],
            criticalThreshold: config.criticalThreshold[axis],
          };
        });
      });

      return stats;
    },
  },
};
</script>

<style lang="scss" scoped>
// Base Card Styles
.sensor-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: auto;
  margin-bottom: 1.5rem;

  .card-header {
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    padding: 1rem 1.25rem;

    h5 {
      margin: 0;
      font-weight: 600;
    }
  }

  .card-body {
    padding: 1.25rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}

// Controls Section
.controls-section {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.controls-wrapper {
  display: flex;
  gap: 2rem;
  align-items: stretch;
}

// Time Range Group
.time-range-group {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

// Action Buttons Group
.action-buttons-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  min-width: 300px;
}

// Common Control Item Styles
.control-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 100px;
  text-align: center;

  &:hover:not(.active) {
    background: #b6b6b6;
    transform: translateY(-1px);
  }

  &.active {
    background: #0d6efd;
    border-color: #0d6efd;
    color: white;

    .control-label {
      opacity: 1;
    }

    &::after {
      content: "";
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 8px;
      height: 8px;
      background: currentColor;
      border-radius: 50%;
    }
  }
}

// Action Button Styles
.action-btn {
  border: none;
  color: white;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(110%);
  }

  &:active {
    transform: translateY(1px);
  }

  &.btn-danger {
    background: #dc3545;
  }

  &.btn-success {
    background: #198754;
  }

  &.btn-primary {
    background: #0d6efd;
  }

  .control-icon {
    transition: transform 0.2s ease;
  }

  &:hover .control-icon {
    transform: translateY(-2px);
  }
}

.control-icon {
  margin-bottom: 0.5rem;
  height: 24px;
  width: 24px;
}

.control-value {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.control-label {
  font-size: 0.75rem;
  opacity: 0.85;
  line-height: 1.2;
}

// Current Value Display
.current-value {
  padding: 4px 8px;
  border-radius: 4px;
  background: #f8f9fa;
  display: inline-block;
  margin-top: 8px !important;

  span.fw-bold {
    font-size: 1.2rem;
    padding: 0 4px;
  }
}

// Export Modal Styles
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
}

// Status Animation
.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

// Responsive Styles
@media (max-width: 1199.98px) {
}

@media (max-width: 991.98px) {
  .controls-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons-group {
    min-width: 100%;
  }
}

@media (max-width: 767.98px) {
  .control-item {
    min-height: 90px;
    padding: 0.875rem;

    .control-value {
      font-size: 1rem;
    }

    .control-label {
      font-size: 0.7rem;
    }

    .control-icon {
      height: 20px;
      width: 20px;
    }
  }
}

@media (max-width: 575.98px) {
  .controls-section {
    padding: 0.75rem;
  }

  .time-range-group {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-buttons-group {
    grid-template-columns: 1fr;
  }

  .control-item {
    min-height: 80px;
  }

  .sensor-card {
    .card-header {
      padding: 0.75rem;

      h5 {
        font-size: 1rem;
      }
    }
  }

  .export-modal {
    margin: 0.5rem;

    .modal-body {
      padding: 1rem;
    }
  }
}

@media (min-width: 1200px) and (max-width: 1399.98px) {
}

@media (min-width: 1400px) {
  .control-item {
    min-height: 110px;

    .control-value {
      font-size: 1.2rem;
    }

    .control-label {
      font-size: 0.8rem;
    }

    .control-icon {
      height: 28px;
      width: 28px;
    }
  }
}
</style>
