<template>
  <CRow>
    <CCol :md="12">
      <SearchFilter></SearchFilter>
    </CCol>
  </CRow>
  <CRow>
    <CCol :md="12">
      <CCard class="mb-3">
        <CCardBody>
          <CRow class="d-flex">
            <CCol lg="7" class="d-flex">
              <CCard class="mb-3 flex-fill">
                <!-- <CCardHeader>
                    <CCardTitle>PM Achievement Ratio</CCardTitle>
                  </CCardHeader> -->
                <CCardBody align="center">
                  <MixedChart
                    chartTitle="PM Achievement Ratio"
                    :targetData="[200, 180, 200, 180, 200, 180, 200, 180]"
                    :achievedData="[87, 90, 87, 87, 90, 87, 90, 87]"
                  ></MixedChart>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol lg="5" class="d-flex">
              <CCard class="mb-3 flex-fill">
                <!-- <CCardHeader>
                    <CCardTitle>PM-6 Classification</CCardTitle>
                  </CCardHeader> -->
                <CCardBody align="center">
                  <apexchart
                    type="pie"
                    :options="chartOptions"
                    :series="chartSeries"
                    height="250"
                  >
                  </apexchart>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
          <CRow class="d-flex">
            <CCol lg="6" class="d-flex">
              <CCard class="mb-3 flex-fill">
                <!-- <CCardHeader>
                    <CCardTitle>PM Delay Follow Up</CCardTitle>
                  </CCardHeader> -->
                <CCardBody align="center">
                  <MixedChart
                    chartTitle="PM Delay Follow Up"
                    :targetData="[200, 180, 200, 180, 200, 180, 200, 180]"
                    :achievedData="[87, 90, 87, 87, 90, 87, 90, 87]"
                  ></MixedChart>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol lg="6" class="d-flex">
              <CCard class="mb-3 flex-fill">
                <!-- <CCardHeader>
                    <CCardTitle>BIRA Problem Follow Up</CCardTitle>
                  </CCardHeader> -->
                <CCardBody align="center">
                  <MixedChart
                    chartTitle="BIRA Problem Follow Up"
                    :targetData="[200, 180, 200, 180, 200, 180, 200, 180]"
                    :achievedData="[87, 90, 87, 87, 90, 87, 90, 87]"
                  ></MixedChart>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import SearchFilter from "../../components/pm/SearchFilter.vue";
import MixedChart from "../charts/MixedChart.vue";
import BIRAAchievement from "../charts/BIRAAchievement.vue";
import VueApexCharts from "vue3-apexcharts";

export default {
  name: "PMDashboard",
  components: {
    SearchFilter,
    MixedChart,
    BIRAAchievement,
    apexchart: VueApexCharts,
  },
  data() {
    return {
      achievementData: [
        { name: "Target", data: [200, 200, 200, 200, 200, 200] },
        { name: "Achieved", data: [180, 180, 180, 180, 180, 180] },
      ],
      delayData: [
        { name: "Target", data: [200, 180, 200, 180, 200, 180, 200, 180] },
        { name: "Achieved", data: [87, 90, 87, 87, 90, 87, 90, 87] },
      ],
      biraData: [
        { name: "Target", data: [200, 180, 200, 180, 200, 180, 200, 180] },
        { name: "Achieved", data: [87, 90, 87, 87, 90, 87, 90, 87] },
      ],
      chartSeries: [44, 55, 13, 43, 22, 10],
      chartOptions: {
        chart: {
          width: 380,
          type: "pie",
        },
        dataLabels: {
          enabled: true,
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
        title: {
          text: "PM-6 Classification",
        },
      },
    };
  },
};
</script>
