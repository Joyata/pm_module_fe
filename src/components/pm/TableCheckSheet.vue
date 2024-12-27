<template>
  <CRow>
    <CCol>
      <CTable align="middle" responsive hover bordered>
        <CTableHead color="dark">
          <CTableRow>
            <CTableHeaderCell>No</CTableHeaderCell>
            <CTableHeaderCell>Item Check</CTableHeaderCell>
            <CTableHeaderCell>Method</CTableHeaderCell>
            <CTableHeaderCell>Machine Condition</CTableHeaderCell>
            <CTableHeaderCell>Duration</CTableHeaderCell>
            <CTableHeaderCell>Standard</CTableHeaderCell>
            <CTableHeaderCell>Min. Value</CTableHeaderCell>
            <CTableHeaderCell>Max. Value</CTableHeaderCell>
            <CTableHeaderCell>Input</CTableHeaderCell>
            <CTableHeaderCell>Result</CTableHeaderCell>
            <CTableHeaderCell>Remarks</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-if="loading">
            <CTableDatacell class="text-center" colspan="11">
              <CSpinner component="span" size="sm" aria-hidden="true" />
              Loading...
            </CTableDatacell>
          </CTableRow>
          <CTableRow v-else-if="items.length <= 0">
            <CTableDataCell class="text-center" colspan="11"
              >Data not found</CTableDataCell
            >
          </CTableRow>
          <CTableRow v-for="(item, index) in items" :key="item.id || index">
            <CTableDataCell>{{ index + 1 }}</CTableDataCell>
            <CTableDataCell>{{ item.itemCheck }}</CTableDataCell>
            <CTableDataCell>{{ item.method }}</CTableDataCell>
            <CTableDataCell>{{ item.machineCondition }}</CTableDataCell>
            <CTableDataCell>{{ item.duration }}</CTableDataCell>
            <CTableDataCell>{{ item.standard }}</CTableDataCell>
            <CTableDataCell>{{ item.minValue }}</CTableDataCell>
            <CTableDataCell>{{ item.maxValue }}</CTableDataCell>
            <CTableDataCell>
              <CFormInput
                v-if="
                  item.minValue !== undefined && item.maxValue !== undefined
                "
                type="number"
                v-model.number="item.inputValue"
                step="0.1"
              />
            </CTableDataCell>
            <CTableDataCell
              style="text-align: center"
              :color="getResultColor(item)"
            >
              <CButton
                v-if="
                  item.minValue === undefined && item.maxValue === undefined
                "
                color="transparent"
                @click="toggleResult(item)"
                >{{ item.result }}</CButton
              >
              <span v-else>{{ getResult(item) }}</span>
            </CTableDataCell>
            <CTableDataCell>
              <CFormInput
                type="text"
                v-model="item.remarks"
                placeholder="Add remarks..."
              />
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: "TableCheckSheet",
  data() {
    return {
      items: [
        {
          itemCheck: "Oil Level",
          method: "Visual Inspection",
          machineCondition: "Idle",
          duration: "1 min",
          standard: "Between min and max marks",
          minValue: 5,
          maxValue: 10,
          inputValue: "",
        },
        {
          itemCheck: "Coolant Temperature",
          method: "Thermometer Reading",
          machineCondition: "Running",
          duration: "5 min",
          standard: "80°C - 95°C",
          minValue: 80,
          maxValue: 95,
          inputValue: "",
        },
        {
          itemCheck: "Belt Tension",
          method: "Tension Meter",
          machineCondition: "Off",
          duration: "2 min",
          standard: "400-500 N",
          minValue: 400,
          maxValue: 500,
          inputValue: "",
        },
        {
          itemCheck: "Tire Pressure",
          method: "Pressure Gauge",
          machineCondition: "Parked",
          duration: "3 min",
          standard: "32-35 PSI",
          minValue: 32,
          maxValue: 35,
          inputValue: "",
        },
        {
          itemCheck: "Battery Voltage",
          method: "Multimeter",
          machineCondition: "Off",
          duration: "1 min",
          standard: "12.4-12.7 V",
          minValue: 12.4,
          maxValue: 12.7,
          inputValue: "",
        },
        {
          itemCheck: "Visual Inspection",
          method: "Visual",
          machineCondition: "Idle",
          duration: "2 min",
          standard: "No leaks",
          result: "NG",
        },
      ],
    };
  },
  methods: {
    getResult(item) {
      if (item.minValue !== undefined && item.maxValue !== undefined) {
        if (item.inputValue === null) return "NG";
        if (
          item.inputValue >= item.minValue &&
          item.inputValue <= item.maxValue
        ) {
          return "OK";
        } else {
          return "NG";
        }
      }
      return item.result;
    },
    toggleResult(item) {
      item.result = item.result === "OK" ? "NG" : "OK";
    },
    getResultColor(item) {
      const result = this.getResult(item);
      switch (result) {
        case "OK":
          return "success";
        case "NG":
          return "danger";
        default:
          return "";
      }
    },
  },
};
</script>
