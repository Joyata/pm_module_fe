<template>
  <apexchart
    type="line"
    height="250"
    :options="chartOptions"
    :series="series"
  ></apexchart>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
  name: "MixedChart",
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    chartTitle: {
      type: String,
      required: true,
    },
    achievedData: {
      type: Array,
      required: true,
    },
    targetData: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      series: [
        {
          name: "Target",
          type: "column",
          data: this.targetData,
        },
        {
          name: "Achieved",
          type: "column",
          data: this.achievedData,
        },
        {
          name: "%",
          type: "line",
          data: this.calculatePercentage(),
        },
      ],
      chartOptions: {
        chart: {
          type: "line",
          stacked: false,
        },
        dataLabels: {
          enabled: true,
          enabledOnSeries: [2],
          formatter: function (val) {
            return val.toFixed(0);
          },
        },
        stroke: {
          width: [1, 1, 4],
        },
        title: {
          text: this.chartTitle,
        },
        xaxis: {
          categories: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
        },
        yaxis: [
          {
            seriesName: "Achieved",
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: true,
              color: "#008FFB",
            },
            labels: {
              formatter: function (val) {
                return val.toFixed(0);
              },
              style: {
                colors: "#008FFB",
              },
            },
            title: {
              text: "PM Tasks",
              style: {
                color: "#008FFB",
              },
            },
            tooltip: {
              enabled: true,
            },
          },
          {
            seriesName: "Achieved %",
            opposite: true,
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: true,
              color: "#FEB019",
            },
            labels: {
              show: false,
              formatter: function (val) {
                return val.toFixed(0);
              },
              style: {
                colors: "#FEB019",
              },
            },
            title: {
              text: "Percentage %",
              style: {
                color: "#FEB019",
              },
            },
          },
        ],
        // tooltip: {
        //   fixed: {
        //     enabled: true,
        //     position: "topLeft",
        //     offsetY: 30,
        //     offsetX: 60,
        //   },
        // },
      },
    };
  },
  methods: {
    calculatePercentage() {
      // Ensure target values are not zero to avoid division by zero
      return this.achievedData.map((achieved, index) => {
        const target = this.targetData[index];
        return target > 0 ? (achieved / target) * 100 : 0;
      });
    },
  },
};
</script>
