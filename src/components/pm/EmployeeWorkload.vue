<template>
  <CRow>
    <CCol>
      <CCard class="mb-3">
        <CCardHeader>
          <CCardTitle>Employee Workload</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CListGroup>
            <CListGroupItem
              v-for="employee in employeesWithWorkload"
              :key="employee.id"
            >
              <CRow>
                <CCol>{{ employee.name }}</CCol>
                <CCol class="text-end"
                  ><CBadge color="primary" shape="rounded-pill">{{
                    employee.workload
                  }}</CBadge></CCol
                >
              </CRow>
            </CListGroupItem>
          </CListGroup>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
export default {
  props: {
    employees: Array,
    tasks: Array,
  },
  computed: {
    employeesWithWorkload() {
      return this.employees.map((employee) => ({
        ...employee,
        workload: this.tasks
          .filter((task) => task.assignedTo === employee.id)
          .reduce((total, task) => total + task.estimatedTime, 0),
      }));
    },
  },
};
</script>
