<!-- components/pm/monitor/VibrationChart.vue -->
<template>
  <CCard class="sensor-card h-100">
    <CCardHeader class="d-flex justify-content-between align-items-center">
      <div>
        <h5 class="mb-0 d-flex align-items-center">
          <CIcon icon="cil-audio-spectrum" class="me-2"></CIcon>
          {{ sensorConfig.name }} Monitoring
          <!-- Admin Settings Button -->
          <CButton
            v-if="isAdmin"
            color="link"
            class="p-0 ms-2"
            @click="$emit('show-settings')"
          >
            <CIcon icon="cil-settings" />
            Adjust Threshold (Admin only)
          </CButton>
        </h5>
        <!-- Current Values Component -->
        <div class="mt-2">
          <span v-for="axis in availableAxes" :key="axis" class="me-3">
            {{ axis.charAt(0).toUpperCase() + axis.slice(1) }}:
            <span :class="getSensorValueClass(axis, currentValues[axis])">
              {{ currentValues[axis]?.toFixed(2) || "0.00" }}
              {{ getAxisUnit(axis) }}
            </span>
          </span>
        </div>
      </div>
      <!-- Max Values Display -->
      <div class="text-end">
        <div v-for="axis in availableAxes" :key="axis" class="small text-muted">
          {{ axis.charAt(0).toUpperCase() + axis.slice(1) }} Max:
          {{ getMaxValue(axis) }} {{ getAxisUnit(axis) }}
        </div>
      </div>
    </CCardHeader>

    <CCardBody>
      <apexchart
        :key="`power-chart-${chartKey}`"
        type="line"
        height="400"
        :options="chartOptions"
        :series="chartSeries"
      />
    </CCardBody>
  </CCard>
</template>

<script>
import CurrentValues from "../../components/pm/CurrentValues.vue";

export default {
  name: "VibrationChart",
  components: {
    CurrentValues,
  },

  props: {
    sensorData: {
      type: Object,
      required: true,
    },
    currentValues: {
      type: Object,
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
    dateRange: {
      type: Array,
      default: () => null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    chartKey: {
      type: Number,
      required: true,
    },
  },

  computed: {
    chartOptions() {
      const options = {
        chart: {
          id: `power-chart-${this.chartKey}`,
          animations: {
            enabled: false,
          },
          zoom: {
            enabled: true,
          },
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true,
            },
          },
        },
        xaxis: {
          type: "datetime",
          labels: {
            formatter: function (value, timestamp, opts) {
              return new Date(timestamp).toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                fractionalSecondDigits: 3,
              });
            },
            datetimeUTC: false,
          },
          tooltip: {
            formatter: function (value) {
              return new Date(value).toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                fractionalSecondDigits: 3,
              });
            },
          },
          ...(this.dateRange && {
            min: new Date(this.dateRange[0]).getTime(),
            max: new Date(this.dateRange[1]).getTime(),
          }),
        },
        yaxis: {
          tickAmount: 5,
          decimalsInFloat: 2,
          labels: {
            formatter: (value) => this.formatValue(value),
          },
          title: {
            text: `${this.sensorConfig.name} (${this.sensorConfig.unit})`,
          },
          forceNiceScale: true, // This ensures nice round numbers for the scale
        },
        stroke: {
          curve: "smooth",
          width: 2,
        },
        legend: {
          show: true,
          position: "top",
          onItemClick: {
            toggleDataSeries: true,
          },
          onItemHover: {
            highlightDataSeries: true,
          },
        },
        tooltip: {
          x: {
            formatter: function (value) {
              return new Date(value).toLocaleTimeString("en-US", {
                hour12: false,
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                fractionalSecondDigits: 3,
              });
            },
          },
          y: {
            formatter: (value) => {
              return this.formatValue(value) + " " + this.sensorConfig.unit;
            },
          },
          theme: "dark",
        },
        annotations: {
          // yaxis: this.generateThresholdLines(),
        },
      };

      // Add date range constraints if provided
      if (this.dateRange) {
        const [start, end] = this.dateRange;
        options.xaxis.min = new Date(start).getTime();
        options.xaxis.max = new Date(end).getTime();
      }

      return options;
    },

    chartSeries() {
      return this.availableAxes.map((axis) => ({
        name: `${axis.charAt(0).toUpperCase() + axis.slice(1)}`,
        data: this.sensorData[axis] || [],
        color: this.sensorConfig.colors[axis],
      }));
    },
  },

  methods: {
    getAxisUnit(axis) {
      // Dynamic unit selection based on axis
      const unitMap = {
        voltage: "V",
        current: "A",
        frequency: "Hz",
      };
      return unitMap[axis] || "";
    },

    getMaxValue(axis) {
      if (!this.sensorData[axis] || !this.sensorData[axis].length)
        return "0.00";
      const values = this.sensorData[axis]
        .map((d) => d.y)
        .filter((y) => y !== null && y !== undefined);
      return values.length ? Math.max(...values).toFixed(2) : "0.00";
    },

    getSensorValueClass(axis, value) {
      if (value === undefined) return "";
      if (value > this.sensorConfig.criticalThreshold[axis])
        return "text-danger";
      if (value > this.sensorConfig.warningThreshold[axis])
        return "text-warning";
      return "text-success";
    },

    generateYAxisLabel(axis) {
      return `${
        axis.charAt(0).toUpperCase() + axis.slice(1)
      } (${this.getAxisUnit(axis)})`;
    },

    generateThresholdLines() {
      const thresholdLines = [];
      this.availableAxes.forEach((axis) => {
        // Warning threshold line
        thresholdLines.push({
          y: this.sensorConfig.warningThreshold[axis],
          borderColor: "#ffc107",
          label: {
            text: `Warning (${axis.toUpperCase()})`,
            style: {
              color: "#ffc107",
            },
          },
        });
        // Critical threshold line
        thresholdLines.push({
          y: this.sensorConfig.criticalThreshold[axis],
          borderColor: "#dc3545",
          label: {
            text: `Critical (${axis.toUpperCase()})`,
            style: {
              color: "#dc3545",
            },
          },
        });
      });

      return thresholdLines;
    },

    formatValue(value) {
      return value !== undefined && value !== null
        ? Number(value).toFixed(2)
        : "0.00";
    },
  },
};
</script>

<style lang="scss" scoped>
.sensor-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

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

@media (max-width: 575.98px) {
  .sensor-card {
    .card-header {
      padding: 0.75rem;

      h5 {
        font-size: 1rem;
      }
    }
  }
}
</style>
