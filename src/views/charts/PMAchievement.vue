<template>
  <CRow>
    <CCol>
      <CCard class="mb-3">
        <CCardBody>
          <CRow>
            <CCol>
              <apexchart
                type="line"
                :options="chartOptions"
                :series="chartSeries"
              >
              </apexchart>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
  name: "PMAchievement",
  components: {
    apexchart: VueApexCharts,
  },
  data: () => {
    const planning = [
      5, 5, 5, 5, 5, 11, 0, 5, 5, 5, 5, 5, 0, 12, 5, 5, 5, 5, 0, 6, 4, 5, 5, 5,
      5, 0, 1, 8, 0, 0, 0,
    ];
    const accPlanning = [
      5, 10, 15, 20, 25, 36, 36, 41, 46, 51, 56, 61, 61, 73, 78, 83, 88, 93, 93,
      99, 103, 108, 113, 118, 123, 123, 124, 132, 132, 132, 132,
    ];
    const actual = [
      0, 0, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
    ];
    const accActual = [
      0, 0, 0, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
      4, 4, 4, 4, 4, 4,
    ];
    return {
      chartOptions: {
        chart: {
          type: "line",
          stacked: false,
          zoom: {
            type: "x",
            enabled: true,
            autoScaleYaxis: true,
          },
          toolbar: {
            autoSelected: "zoom",
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "straight",
        },
        title: {
          text: "PM Achievement This Month",
          align: "left",
        },
        grid: {
          row: {
            colors: ["#f3f3f3", "transparent"],
            opacity: 0.5,
          },
        },
        markers: {
          size: 5,
        },
        xaxis: {
          title: {
            text: "Date",
            style: {
              fontSize: "14px",
              fontWeight: "bold",
              color: "#263238",
            },
          },
          categories: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
          ],
        },
        yaxis: {
          labels: {
            formatter: function (val) {
              return val.toFixed(0);
            },
          },
          title: {
            text: "Total PM",
          },
        },
        tooltip: {
          fixed: {
            enabled: true,
            position: "topLeft",
            offsetY: 30,
            offsetX: 60,
          },
        },
      },
      chartSeries: [
        {
          name: "Planning",
          type: "column",
          data: planning,
        },
        {
          name: "Acc. Planning",
          type: "line",
          data: accPlanning,
        },
        {
          name: "Actual",
          type: "column",
          data: actual,
        },
        {
          name: "Acc. Actual",
          type: "line",
          data: accActual,
        },
      ],
    };
  },
};
</script>
