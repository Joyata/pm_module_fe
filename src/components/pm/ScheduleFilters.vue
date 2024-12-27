<template>
  <CCard class="mb-3">
    <CCardBody>
      <CRow>
        <!-- Team Member Select -->
        <CCol xs="12" md="4" class="mb-3 mb-md-0">
          <CFormLabel>Team Member</CFormLabel>
          <CFormSelect
            :value="selectedMP"
            :options="MPs"
            @change="$emit('update:selectedMP', $event.target.value)"
          />
        </CCol>

        <!-- Period Filter -->
        <CCol xs="12" md="4" class="mb-3 mb-md-0">
          <CFormLabel>Period</CFormLabel>
          <CFormSelect
            :value="filters.period"
            :options="[
              { value: 'all', label: 'All Periods' },
              { value: 'A', label: 'A - 1 Month' },
              { value: 'B', label: 'B - 3 Months' },
              { value: 'C', label: 'C - 6 Months' },
              { value: 'D', label: 'D - 1 Year' },
            ]"
            @change="updatePeriodFilter"
          />
        </CCol>

        <!-- Status Filter -->
        <CCol xs="12" md="4">
          <CFormLabel>Status</CFormLabel>
          <CFormSelect
            :value="filters.status"
            :options="[
              { value: 'all', label: 'All Status' },
              { value: 'PLAN', label: 'Planned' },
              { value: 'DELAY', label: 'Delayed' },
              { value: 'COMPLETED', label: 'Completed' },
            ]"
            @change="updateStatusFilter"
          />
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
</template>

<script>
export default {
  name: "ScheduleFilters",

  props: {
    selectedMP: {
      type: String,
      default: "",
    },
    MPs: {
      type: Array,
      default: () => [],
    },
    filters: {
      type: Object,
      default: () => ({
        period: "all",
        status: "all",
      }),
    },
  },

  emits: ["update:selectedMP", "update:filters", "filter-change"],

  methods: {
    updatePeriodFilter(event) {
      const newFilters = {
        ...this.filters,
        period: event.target.value,
      };
      this.$emit("update:filters", newFilters);
      this.$emit("filter-change");
    },

    updateStatusFilter(event) {
      const newFilters = {
        ...this.filters,
        status: event.target.value,
      };
      this.$emit("update:filters", newFilters);
      this.$emit("filter-change");
    },
  },
};
</script>

<style scoped>
@media (max-width: 768px) {
  .mb-md-0 {
    margin-bottom: 1rem !important;
  }
}
</style>
