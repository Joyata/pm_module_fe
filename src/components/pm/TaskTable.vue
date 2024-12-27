<template>
  <CRow>
    <CCol>
      <CTable align="middle" responsive hover bordered>
        <CTableHead color="dark">
          <CTableRow>
            <CTableHeaderCell>No</CTableHeaderCell>
            <CTableHeaderCell>Kanban No</CTableHeaderCell>
            <CTableHeaderCell>Equipment Name</CTableHeaderCell>
            <CTableHeaderCell>MH</CTableHeaderCell>
            <CTableHeaderCell>Action</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-if="loading">
            <CTableDataCell class="text-center" colspan="5">
              <CSpinner component="span" size="sm" aria-hidden="true" />
              Loading...
            </CTableDataCell>
          </CTableRow>
          <CTableRow v-else-if="tasks.length <= 0">
            <CTableDataCell class="text-center" colspan="5"
              >Data not found.</CTableDataCell
            >
          </CTableRow>
          <CTableRow v-for="(item, index) in tasks" :key="index">
            <CTableDataCell scope="row">{{ index + 1 }}</CTableDataCell>
            <CTableDataCell>{{ item.kanbanNo }}</CTableDataCell>
            <CTableDataCell>{{ item.machineName }}</CTableDataCell>
            <CTableDataCell>{{ item.duration }}</CTableDataCell>
            <CTableDataCell style="text-align: center">
              <CButton class="text-white" color="success" size="sm"
                >Edit</CButton
              >
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: "TaskTable",
  props: {
    tasks: {
      type: Array,
      required: true,
    },
  },
};
</script>
