<template>
  <CRow>
    <CCol>
      <CTable align="middle" responsive hover bordered>
        <CTableHead color="dark">
          <CTableRow>
            <CTableHeaderCell>Image</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Tasks Completed</CTableHeaderCell>
            <CTableHeaderCell>Tasks Pending</CTableHeaderCell>
            <CTableHeaderCell>Performance Score</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="(item, index) in teamMembers" :key="index">
            <CTableDataCell style="text-align: center">
              <CAvatar
                color="primary"
                size="xl"
                text-color="white"
                :src="require('@/assets/images/pasfoto_cropped.png')"
                >{{ item.name.charAt(0).toUpperCase() }}</CAvatar
              >
            </CTableDataCell>

            <CTableDataCell>{{ item.name }}</CTableDataCell>
            <CTableDataCell>{{ item.tasksCompleted }}</CTableDataCell>
            <CTableDataCell>{{ item.tasksPending }}</CTableDataCell>
            <CTableDataCell>
              <CProgress
                class="mt-2"
                :height="30"
                style="font-size: small; font-weight: bold"
                :value="item.performanceScore"
                :color="getPerformanceColor(item.performanceScore)"
                >{{ item.performanceScore }}%</CProgress
              >
            </CTableDataCell>
            <CTableDataCell style="text-align: center">
              <CButton
                class="text-white"
                style="background-color: blue"
                size="sm"
                @click="viewDetails(item)"
                >View Details</CButton
              >
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </CCol>
  </CRow>
  <CRow>
    <CCol>
      <CButton
        class="text-white"
        style="background-color: darkblue"
        size="sm"
        @click="viewDetails(teamSummary)"
        >View Team Summary</CButton
      >
    </CCol>
  </CRow>
</template>

<script>
import { CProgress } from "@coreui/vue";

export default {
  name: "TeamMemberPerformance",
  components: {
    CProgress,
  },
  props: {
    teamMembers: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      columns: [
        { key: "name", label: "Name" },
        { key: "tasksCompleted", label: "Tasks Completed" },
        { key: "tasksPending", label: "Tasks Pending" },
        { key: "performanceScore", label: "Performance Score" },
        { key: "actions", label: "Actions" },
      ],
    };
  },
  methods: {
    viewDetails(item) {
      if (item.name === "Team Summary") {
        const totalTasks = this.teamMembers.reduce(
          (sum, member) => sum + member.tasksCompleted + member.tasksPending,
          0
        );
        const completedTasks = this.teamMembers.reduce(
          (sum, member) => sum + member.tasksCompleted,
          0
        );
        const avgPerformance =
          this.teamMembers.reduce(
            (sum, member) => sum + member.performanceScore,
            0
          ) / this.teamMembers.length;

        alert(
          `Team Summary:\nTasks Completed: ${completedTasks}\nTasks Pending: ${
            totalTasks - completedTasks
          }\nPerformance Score: ${avgPerformance}%`
        );
      } else {
        console.log("View details for:", item.name);
      }
      console.log("View details for:", item.name);
    },
    getPerformanceColor(score) {
      if (score >= 90) return "success";
      if (score >= 80) return "warning";
      if (score >= 70) return "danger";
      return "danger";
    },
  },
  computed: {
    teamSummary() {
      const totalTasks = this.teamMembers.reduce(
        (sum, member) => sum + member.tasksCompleted + member.tasksPending,
        0
      );
      const completedTasks = this.teamMembers.reduce(
        (sum, member) => sum + member.tasksCompleted,
        0
      );
      const avgPerformance =
        this.teamMembers.reduce(
          (sum, member) => sum + member.performanceScore,
          0
        ) / this.teamMembers.length;

      return {
        name: "Team Summary",
        tasksCompleted: completedTasks,
        tasksPending: totalTasks - completedTasks,
        performanceScore: Math.round(avgPerformance),
      };
    },
  },
};
</script>
