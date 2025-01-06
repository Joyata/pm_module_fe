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
            {{ axis.toUpperCase() }} Axis:
            <span :class="getSensorValueClass(axis, currentValues[axis])">
              {{ currentValues[axis]?.toFixed(2) || "0.00" }}
              {{ sensorConfig.unit }}
            </span>
          </span>
        </div>
      </div>
      <!-- Max Values Display -->
      <div class="text-end">
        <div v-for="axis in availableAxes" :key="axis" class="small text-muted">
          {{ axis.toUpperCase() }} Max: {{ getMaxValue(axis) }}
          {{ sensorConfig.unit }}
        </div>
      </div>
    </CCardHeader>

    <CCardBody>
      <apexchart
        :key="`temperature-chart-${chartKey}`"
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
          id: `temperature-chart-${this.chartKey}`,
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
            datetimeFormatter: {
              year: "yyyy",
              month: "MMM 'yy",
              day: "dd MMM",
              hour: "HH:mm",
            },
          },
        },
        yaxis: {
          min: this.sensorConfig.min,
          max: this.sensorConfig.max,
          tickAmount: 5,
          labels: {
            formatter: (value) => value.toFixed(1),
          },
          title: {
            text: this.sensorConfig.unit,
          },
        },
        stroke: {
          curve: "smooth",
          width: 2,
        },
        legend: {
          show: true,
          position: "top",
        },
        tooltip: {
          x: {
            format: "dd MMM yyyy HH:mm:ss",
          },
          y: {
            formatter: (value) =>
              `${value.toFixed(2)} ${this.sensorConfig.unit}`,
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
        name: `Axis ${axis.toUpperCase()}`,
        data: this.sensorData[axis] || [],
        color: this.sensorConfig.colors[axis],
      }));
    },
  },

  methods: {
    getMaxValue(axis) {
      if (!this.sensorData[axis]) return "0.00";
      return Math.max(...this.sensorData[axis].map((d) => d.y)).toFixed(2);
    },

    getSensorValueClass(axis, value) {
      if (value === undefined) return "";
      if (value > this.sensorConfig.criticalThreshold[axis])
        return "text-danger";
      if (value > this.sensorConfig.warningThreshold[axis])
        return "text-warning";
      return "text-success";
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
