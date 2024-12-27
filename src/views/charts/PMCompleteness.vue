<template>
  <CRow class="align-items-center mb-3">
    <CCol xs="auto" class="me-2">
      <img
        :src="require('@/assets/images/pasfoto_cropped.png')"
        alt="Profile Photo"
        class="img-fluid rounded"
        style="max-height: 80px; width: auto"
      />
    </CCol>
    <CCol>
      <CInputGroup>
        <CInputGroupText as="label" for="MonthSelect">Month</CInputGroupText>
        <CFormInput
          v-model="filterStatus.month"
          type="month"
          class="form-control"
          placeholder="Month"
          @change="updateCharts"
        >
        </CFormInput>
      </CInputGroup>
    </CCol>
  </CRow>
  <CRow>
    <CCol md="6" class="mb-3">
      <CCard>
        <CCardBody class="d-flex flex-column">
          <h4 class="text-center mb-3">PM Completeness</h4>
          <div class="flex-grow-1 d-flex align-items-center">
            <apexchart
              type="donut"
              :options="donutOptions"
              :series="donutSeries"
              height="190"
            >
            </apexchart>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol md="6" class="mb-3">
      <CCard>
        <CCardBody class="d-flex flex-column">
          <h4 class="text-center mb-3">Delay Category</h4>
          <div class="flex-grow-1 d-flex align-items-center">
            <apexchart
              type="radar"
              :options="radarOptions"
              :series="radarSeries"
              height="190"
            ></apexchart>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import moment from "moment";
import VueApexCharts from "vue3-apexcharts";

export default {
  name: "PMCompleteness",
  components: {
    apexchart: VueApexCharts,
  },
  data: () => {
    return {
      selectedMonth: moment().format("YYYY-MM"),
      filter: {
        month: `${moment().format("YYYY-MM")}`,
        line_id: -1,
        machine_id: -1,
      },
      selectedMonthStatus: moment().format("YYYY-MM"),
      filterStatus: {
        month: `${moment().format("YYYY-MM")}`,
      },
      donutOptions: {
        chart: {
          type: "donut",
          redrawOnWindowResize: true,
        },
        dataLabels: {
          enabled: true,
        },
        labels: ["Completed", "Plan", "Delay"],
        colors: ["#0FBC9D", "#9aa3b0", "#E83535"],
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
        legend: {
          position: "top",
          // show: false,
        },
        // title: {
        //   text: "PM Task Completeness",
        //   align: "center",
        // },
      },
      donutSeries: [617, 343, 40],
      radarOptions: {
        chart: {
          type: "radar",
          toolbar: {
            show: false,
          },
        },
        // title: {
        //   text: "PM6",
        //   align: "center",
        // },
        xaxis: {
          categories: ["PM1", "PM2", "PM3", "PM4", "PM5", "PM6"],
        },
        yaxis: {
          show: false,
        },
        plotOptions: {
          radar: {
            size: 50,
          },
        },
      },
      radarSeries: [
        {
          name: "Total Tasks",
          data: [80, 70, 60, 75, 85, 65],
        },
      ],
    };
  },
  methods: {
    updateCharts() {
      this.donutSeries = [
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
      ];

      this.radarSeries = [
        {
          name: "Total Tasks",
          data: Array(6)
            .fill()
            .map(() => Math.floor(Math.random() * 100)),
        },
      ];
    },
    mounted() {
      this.updateCharts();
    },
  },
};
</script>
