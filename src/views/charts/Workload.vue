<template>
  <CRow>
    <CCol>
      <apexchart
        v-if="isDataValid"
        type="bar"
        height="550"
        :options="chartOptions"
        :series="chartSeries"
      ></apexchart>
      <div v-else class="error-message">No data available.</div>
    </CCol>
  </CRow>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
  name: "Workload",
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    chartData: {
      type: Object,
      required: true,
    },
  },
  computed: {
    isDataValid() {
      return (
        this.chartData &&
        this.chartData.labels &&
        this.chartData.datasets &&
        this.chartData.datasets[0] &&
        this.chartData.datasets[0].data
      );
    },
    chartOptions() {
      if (!this.isDataValid) return {};
      return {
        chart: {
          type: "bar",
          height: 550,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "55%",
            endingShape: "flat",
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        xaxis: {
          categories: this.chartData.labels,
          title: {
            text: "Months",
          },
        },
        yaxis: {
          title: {
            text: "Workload",
          },
        },
        fill: {
          opacity: 1,
          colors: ["#90EE90"],
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + " tasks";
            },
          },
        },
        annotations: {
          yaxis: [
            {
              y: this.chartData.threshold,
              borderColor: "#FF0000",
              label: {
                borderColor: "#FF0000",
                style: {
                  color: "#fff",
                  background: "#FF0000",
                },
                text: "Limit",
              },
            },
          ],
        },
      };
    },
    chartSeries() {
      if (!this.isDataValid) return [];
      return [
        {
          name: "Tasks",
          data: this.chartData.datasets[0].data,
        },
      ];
    },
  },
};
</script>

<style>
.error-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-style: italic;
  color: #666;
}
</style>
