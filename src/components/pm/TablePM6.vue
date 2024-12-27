<template>
  <CRow>
    <CCol>
      <CTable align="middle" responsive hover bordered>
        <CTableHead color="dark">
          <CTableRow>
            <CTableHeaderCell scope="col">No</CTableHeaderCell>
            <CTableHeaderCell scope="col">Kanban Delay</CTableHeaderCell>
            <CTableHeaderCell scope="col">PM-6</CTableHeaderCell>
            <CTableHeaderCell scope="col">Reason</CTableHeaderCell>
            <CTableHeaderCell scope="col">Countermeasure</CTableHeaderCell>
            <CTableHeaderCell scope="col">Evaluation</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-if="loading">
            <CTableDataCell class="text-center" colspan="6">
              <CSpinner component="span" size="sm" aria-hidden="true" />
              Loading...
            </CTableDataCell>
          </CTableRow>
          <CTableRow v-else-if="items.length <= 0">
            <CTableDataCell class="text-center" colspan="6"
              >Data not found</CTableDataCell
            >
          </CTableRow>
          <CTableRow v-for="(item, index) in items" :key="index">
            <CTableDataCell scope="row">{{ index + 1 }}</CTableDataCell>
            <CTableDataCell>{{ item.kanbanDelay }}</CTableDataCell>
            <CTableDataCell style="text-align: center">
              <CBadge :style="getPMColor(item.pm6)" shape="rounded-pill">{{
                item.pm6
              }}</CBadge>
            </CTableDataCell>

            <CTableDataCell>{{ item.reason }}</CTableDataCell>
            <CTableDataCell>{{ item.countermeasure }}</CTableDataCell>
            <CTableDataCell>{{ item.evaluation }}</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: "TablePM6",
  data() {
    return {
      items: [
        {
          kanbanDelay: "R045",
          pm6: "PM-3",
          reason: "Scanning",
          countermeasure: "Setting W II",
          evaluation: "",
        },
        {
          kanbanDelay: "R067",
          pm6: "PM-1",
          reason: "Ceremony",
          countermeasure: "Setting W II",
          evaluation: "",
        },
        {
          kanbanDelay: "R086",
          pm6: "PM-1",
          reason: "Ceremony",
          countermeasure: "Setting W II",
          evaluation: "",
        },
        {
          kanbanDelay: "R108",
          pm6: "PM-1",
          reason: "Ceremony",
          countermeasure: "Setting W II",
          evaluation: "",
        },
        {
          kanbanDelay: "R193",
          pm6: "PM-4",
          reason: "Teach RBT 5-11",
          countermeasure: "Setting W II",
          evaluation: "",
        },
        {
          kanbanDelay: "R200",
          pm6: "PM-3",
          reason: "Scanning",
          countermeasure: "Setting W II",
          evaluation: "",
        },
        {
          kanbanDelay: "R074",
          pm6: "PM-3",
          reason: "RBT 5-13",
          countermeasure: "Setting W II",
          evaluation: "",
        },
        {
          kanbanDelay: "R094",
          pm6: "PM-3",
          reason: "RBT 5-14",
          countermeasure: "Setting W II",
          evaluation: "",
        },
        {
          kanbanDelay: "R115",
          pm6: "PM-3",
          reason: "Teaching",
          countermeasure: "Setting W II",
          evaluation: "",
        },
        {
          kanbanDelay: "R199",
          pm6: "PM-3",
          reason: "Teach RBT 5-11",
          countermeasure: "Setting W II",
          evaluation: "",
        },
        {
          kanbanDelay: "R066",
          pm6: "PM-3",
          reason: "Scanning",
          countermeasure: "Setting W II",
          evaluation: "",
        },
        {
          kanbanDelay: "R082",
          pm6: "PM-1",
          reason: "Sosialisasi",
          countermeasure: "Setting W II",
          evaluation: "",
        },
        {
          kanbanDelay: "R102",
          pm6: "PM-1",
          reason: "Sosialisasi",
          countermeasure: "Setting W II",
          evaluation: "",
        },
        {
          kanbanDelay: "R216",
          pm6: "PM-1",
          reason: "Sosialisasi",
          countermeasure: "Setting W II",
          evaluation: "",
        },
        {
          kanbanDelay: "J245",
          pm6: "PM-1",
          reason: "Sosialisasi",
          countermeasure: "Setting W II",
          evaluation: "",
        },
      ],
    };
  },
  methods: {
    getPMColor(pm6) {
      switch (pm6) {
        case "PM-1":
          return "background-color: #ffc000";
        case "PM-2":
          return "background-color: #ff3399";
        case "PM-3":
          return "background-color: #00b0f0";
        case "PM-4":
          return "background-color: #92d050";
        case "PM-5":
          return "background-color: #ccff66";
        case "PM-6":
          return "background-color: #ff0000";
        default:
          return "background-color: #000000";
      }
    },
  },
};
</script>
