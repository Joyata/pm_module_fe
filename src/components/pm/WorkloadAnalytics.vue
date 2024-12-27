<template>
  <CCard class="">
    <CCardBody>
      <!-- Summary Cards Row -->
      <CRow>
        <CCol sm="6" lg="3">
          <div class="summary-card">
            <div class="title text-medium-emphasis">Total Hours</div>
            <div class="value">{{ Number(summary.totalHours).toFixed(1) }}</div>
            <small
              :class="[
                'trend',
                summary.totalHours > workloadLimit * 5
                  ? 'text-danger'
                  : 'text-success',
              ]"
            >
              Weekly Load
            </small>
          </div>
        </CCol>

        <CCol sm="6" lg="3">
          <div class="summary-card">
            <div class="title text-medium-emphasis">Daily Average</div>
            <div class="value">
              {{ Number(summary.avgHoursPerDay).toFixed(1) }}
            </div>
            <small
              :class="[
                'trend',
                summary.avgHoursPerDay > workloadLimit
                  ? 'text-danger'
                  : 'text-success',
              ]"
            >
              Hours/Day
            </small>
          </div>
        </CCol>

        <CCol sm="6" lg="3">
          <div class="summary-card">
            <div class="title text-medium-emphasis">Peak Load</div>
            <div class="value">{{ Number(summary.peakHours).toFixed(1) }}</div>
            <small class="text-medium-emphasis">
              on {{ formatDate(summary.peakDate) }}
            </small>
          </div>
        </CCol>

        <CCol sm="6" lg="3">
          <div class="summary-card">
            <div class="title text-medium-emphasis">Overloaded Days</div>
            <div class="value">{{ overloadedDays.length }}</div>
            <small
              :class="
                overloadedDays.length > 0 ? 'text-danger' : 'text-success'
              "
            >
              {{ overloadedDays.length > 0 ? "Action Required" : "All Clear" }}
            </small>
          </div>
        </CCol>
      </CRow>

      <!-- Workload Chart -->
      <CRow class="mt-4">
        <CCol xs="12">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="m-0">Daily Workload Distribution</h6>
            <CButtonGroup v-if="!isMobile">
              <CButton
                v-for="view in chartViews"
                :key="view.value"
                :color="
                  selectedChartView === view.value ? 'primary' : 'secondary'
                "
                variant="outline"
                size="sm"
                @click="selectedChartView = view.value"
              >
                {{ view.label }}
              </CButton>
            </CButtonGroup>
          </div>

          <!-- Chart Component -->
          <div class="workload-chart">
            <apexchart
              type="line"
              :height="chartHeight"
              :options="chartOptions"
              :series="chartSeries"
            />
          </div>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
</template>

<script>
export default {
  name: "WorkloadAnalytics",

  props: {
    workloadData: {
      type: Array,
      required: true,
    },
    summary: {
      type: Object,
      required: true,
      validator(value) {
        return ["totalHours", "avgHoursPerDay", "peakHours", "peakDate"].every(
          (key) => key in value
        );
      },
      default: () => ({
        totalHours: 0,
        avgHoursPerDay: 0,
        peakHours: 0,
        peakDate: new Date(),
      }),
    },
    overloadedDays: {
      type: Array,
      required: true,
      default: () => [],
    },
    workloadLimit: {
      type: Number,
      default: 8,
    },
  },

  data() {
    return {
      selectedChartView: "week",
      isMobile: window.innerWidth < 768,
      chartViews: [
        { value: "week", label: "Week" },
        { value: "month", label: "Month" },
      ],
    };
  },

  computed: {
    chartHeight() {
      return this.isMobile ? 300 : 400;
    },

    chartOptions() {
      return {
        chart: {
          type: "line",
          toolbar: {
            show: false,
          },
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 800,
          },
        },
        stroke: {
          curve: "smooth",
          width: 3,
        },
        xaxis: {
          type: "datetime",
          categories: this.workloadData.map((d) => d.date),
          labels: {
            format: "dd MMM",
            style: {
              colors: "#64748b",
            },
          },
        },
        yaxis: {
          min: 0,
          max: Math.max(
            this.workloadLimit * 1.5,
            ...this.workloadData.map((d) => d.hours)
          ),
          tickAmount: 5,
          labels: {
            formatter: (val) => val.toFixed(1),
          },
        },
        annotations: {
          yaxis: [
            {
              y: this.workloadLimit,
              borderColor: "#ff4560",
              label: {
                text: "Workload Limit",
                style: {
                  color: "#fff",
                  background: "#ff4560",
                },
              },
            },
          ],
        },
        colors: ["#3b82f6"],
        fill: {
          type: "gradient",
          gradient: {
            shade: "light",
            type: "vertical",
            opacityFrom: 0.7,
            opacityTo: 0.2,
          },
        },
        grid: {
          borderColor: "#f1f5f9",
          strokeDashArray: 4,
        },
        markers: {
          size: 5,
          colors: ["#3b82f6"],
          strokeColors: "#fff",
          strokeWidth: 2,
        },
        tooltip: {
          theme: "light",
          y: {
            formatter: (val) => `${val.toFixed(1)} hours`,
          },
        },
      };
    },

    chartSeries() {
      return [
        {
          name: "Workload",
          data: this.workloadData.map((d) => d.hours),
        },
      ];
    },
  },

  methods: {
    handleResize() {
      this.isMobile = window.innerWidth < 768;
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
    },
  },

  mounted() {
    window.addEventListener("resize", this.handleResize);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },
};
</script>

<style scoped>
.summary-card {
  padding: 1rem;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-card .title {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.summary-card .value {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.summary-card .trend {
  font-size: 0.75rem;
}

.workload-chart {
  background: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.text-danger {
  color: #dc3545;
}

.text-success {
  color: #198754;
}

@media (max-width: 767.98px) {
  .summary-card {
    margin-bottom: 1rem;
  }

  .value {
    font-size: 1.25rem;
  }
}
</style>
