<template>
  <div class="chart-container">
    <apexchart
      :type="type"
      :options="chartOptions"
      :series="series"
      height="100%"
      width="100%"
    ></apexchart>
  </div>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
  name: "ChartComponentTM2",
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      validator: (value) => ["donut", "radar"].includes(value),
    },
    series: {
      type: Array,
      required: true,
    },
    colors: {
      type: Array,
      default: () => ["#4CB050", "#FFA827", "#EE534F"],
    },
    labels: {
      type: Array,
      default: () => ["Completed", "Plan", "Delay"],
    },
    categories: {
      type: Array,
      default: () => ["PM1", "PM2", "PM3", "PM4", "PM5", "PM6"],
    },
    options: {
      type: Object,
      required: true,
    },
    height: {
      type: [String, Number],
      default: "100%",
    },
  },
  computed: {
    // getChartHeight() {
    //   return this.type === "radar" ? "300px" : "100%";
    // },
    chartOptions() {
      const baseOptions = {
        chart: {
          type: this.type,
          redrawOnWindowResize: true,
          height: this.height,
          width: "100%",
          toolbar: {
            show: false,
          },
        },
        colors: this.colors,
        dataLabels: {
          enabled: true,
        },
        labels: this.labels,
        legend: {
          position: "top",
          fontSize: "10px",
          markers: {
            width: 12,
            height: 12,
            radius: 12,
          },
        },
      };

      if (this.type === "donut") {
        return {
          ...baseOptions,
          plotOptions: {
            pie: {
              donut: {
                size: "50%",
                labels: {
                  show: true,
                  color: "#000",
                  total: {
                    show: true,
                    label: "Total",
                    color: "#000",
                  },
                },
              },
            },
          },
          fill: {
            type: "gradient",
          },
        };
      }

      if (this.type === "radar") {
        return {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: "radar",
            toolbar: {
              show: false,
            },
            height: "100%",
            width: "100%",
            animations: {
              enabled: true,
            },
          },
          xaxis: {
            categories: this.categories,
            labels: {
              style: {
                fontSize: "12px",
              },
            },
          },
          yaxis: {
            show: false,
            min: 0,
            max: Math.max(...(this.series[0]?.data || [0])) + 2,
          },
          plotOptions: {
            radar: {
              size: undefined,
              offsetY: 0,
              polygons: {
                strokeColors: "#e9e9e9",
                strokeWidth: 1,
                fill: {
                  colors: ["transparent"],
                },
              },
            },
          },
          markers: {
            size: 4,
            colors: ["#FF4560"],
            strokeWidth: 2,
            strokeColors: "#FF4560",
            hover: {
              size: 6,
            },
          },
          stroke: {
            width: 2,
            colors: ["#FF4560"],
            dashArray: 0,
          },
          fill: {
            opacity: 0.2,
          },
          legend: {
            show: false,
          },
          tooltip: {
            enabled: true,
            shared: false,
            followCursor: true,
            intersect: true,
          },
        };
      }
    },
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    handleResize() {
      this.$refs.chart?.updateOptions(this.chartOptions);
    },
  },
};
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  :deep(.apexcharts-canvas) {
    width: 100% !important;
    height: 100% !important;

    svg {
      width: 100% !important;
      height: 100% !important;
    }
  }
}

// Specific styling for radar charts
:deep(.apexcharts-radar-series) {
  transform-origin: center;
}

:deep(.apexcharts-radar-g) {
  transform: translateY(10px);
}

@media (max-width: 575.98px) {
  .chart-container {
    padding: 0.5rem;
    min-height: 200px;
  }
}
</style>
