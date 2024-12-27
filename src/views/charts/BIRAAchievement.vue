<template>
  <CRow>
    <CCol>
      <CCard class="mb-3">
        <CCardBody>
          <CRow>
            <CCol>
              <apexchart
                type="pie"
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
  name: "BIRAAchievement",
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      chartSeries: [44, 55, 13, 43, 22, 10],
      chartOptions: {
        chart: {
          width: 380,
          type: "pie",
        },
        labels: ["PM1", "PM2", "PM3", "PM4", "PM5", "PM6"],
        colors: [
          "#ffc000",
          "#ff3399",
          "#00b0f0",
          "#92d050",
          "#ccff66",
          "#ff0000",
        ],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
        fill: {
          type: "gradient",
        },
      },
    };
  },
};
</script>
