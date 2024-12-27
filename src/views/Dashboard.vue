<template>
  <!-- <h6>Dashboard</h6> -->
  <div>
  <CAlert color="primary"><h4>Welcome</h4> to Manufacturing Connectivity Platform</CAlert>
  <!-- <CAlert color="secondary"><h4>Welcome</h4> to Manufacturing Connectivity Platform</CAlert> -->
  <!-- <CAlert color="success"><h4>Welcome</h4> to Manufacturing Connectivity Platform</CAlert>
  <CAlert color="danger"><h4>Welcome</h4> to Manufacturing Connectivity Platform</CAlert>
  <CAlert color="warning"><h4>Welcome</h4> to Manufacturing Connectivity Platform</CAlert>
  <CAlert color="info"><h4>Welcome</h4> to Manufacturing Connectivity Platform</CAlert>
  <CAlert color="light"><h4>Welcome</h4> to Manufacturing Connectivity Platform</CAlert>
  <CAlert color="dark"><h4>Welcome</h4> to Manufacturing Connectivity Platform</CAlert> -->
  
  <CCard>
  <CCardBody>
    This is some text within a card body.
  </CCardBody>
</CCard>
    
  </div>
</template>

<script>
import MainChartExample from './charts/MainChartExample'
import WidgetsStatsA from './widgets/WidgetsStatsTypeA.vue'
import WidgetsStatsD from './widgets/WidgetsStatsTypeD.vue'

export default {
  name: 'Dashboard',
  components: {
    MainChartExample,
    WidgetsStatsA,
    WidgetsStatsD,
  },
  setup() {
    const progressGroupExample1 = [
      { title: 'Monday', value1: 34, value2: 78 },
      { title: 'Tuesday', value1: 56, value2: 94 },
      { title: 'Wednesday', value1: 12, value2: 67 },
      { title: 'Thursday', value1: 43, value2: 91 },
      { title: 'Friday', value1: 22, value2: 73 },
      { title: 'Saturday', value1: 53, value2: 82 },
      { title: 'Sunday', value1: 9, value2: 69 },
    ]
    const progressGroupExample2 = [
      { title: 'Male', icon: 'cil-user', value: 53 },
      { title: 'Female', icon: 'cil-user-female', value: 43 },
    ]
    const progressGroupExample3 = [
      {
        title: 'Organic Search',
        icon: 'cib-google',
        percent: 56,
        value: '191,235',
      },
      { title: 'Facebook', icon: 'cib-facebook', percent: 15, value: '51,223' },
      { title: 'Twitter', icon: 'cib-twitter', percent: 11, value: '37,564' },
      { title: 'LinkedIn', icon: 'cib-linkedin', percent: 8, value: '27,319' },
    ]
    const tableExample = [
      
    ]

    return {
      tableExample,
      progressGroupExample1,
      progressGroupExample2,
      progressGroupExample3,
    }
  },
}
</script>
