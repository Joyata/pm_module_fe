<template>
  <CCard class="h-100 d-flex flex-column">
    <CCardHeader>
      <CCardTitle>{{ title }}</CCardTitle>
    </CCardHeader>
    <CCardBody
      class="flex-grow-1 d-flex align-items-center justify-content-center"
    >
      <apexchart
        :type="type"
        :options="chartOptions"
        :series="series"
        height="100%"
        width="100%"
      ></apexchart>
    </CCardBody>
  </CCard>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
  name: "ChartComponentTM",
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
              size: undefined, // Let it be automatically calculated
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
            show: true,
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
      // Force chart update on window resize
      this.$refs.chart?.updateOptions(this.chartOptions);
    },
  },
};
</script>

<style lang="scss" scoped>
.card {
  height: 100%;

  .card-body {
    padding: 1rem;
    height: 300px; // Fixed height for consistent sizing

    @media (max-width: 767.98px) {
      height: 250px;
    }
  }
}

:deep(.apexcharts-canvas) {
  width: 100% !important;
  height: 100% !important;

  svg {
    width: 100% !important;
    height: 100% !important;
  }
}

:deep(.apexcharts-radar-series) {
  transform-origin: center;
}

// Add some spacing around the radar chart
:deep(.apexcharts-radar-g) {
  transform: translateY(10px); // Adjust vertical position if needed
}
</style>
