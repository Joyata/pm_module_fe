<template>
  <CRow>
    <CCol>
      <CTable align="middle" responsive hover bordered>
        <CTableHead color="dark">
          <CTableRow>
            <CTableHeaderCell>Date</CTableHeaderCell>
            <CTableHeaderCell>Kanban No.</CTableHeaderCell>
            <CTableHeaderCell>Machine Name</CTableHeaderCell>
            <!-- <CTableHeaderCell>Machine No.</CTableHeaderCell> -->
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Action</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-if="loading">
            <CTableDataCell class="text-center" colspan="6">
              <CSpinner component="span" size="sm" aria-hidden="true" />
              Loading...
            </CTableDataCell>
          </CTableRow>
          <CTableRow v-else-if="paginatedActivities.length <= 0">
            <CTableDataCell class="text-center" colspan="6"
              >No activities found.</CTableDataCell
            >
          </CTableRow>
          <CTableRow v-for="(item, index) in paginatedActivities" :key="index">
            <CTableDataCell scope="row">{{
              formatDisplayDate(item.date)
            }}</CTableDataCell>
            <CTableDataCell>{{ item.kanbanNo }}</CTableDataCell>
            <CTableDataCell>{{ item.machineName }}</CTableDataCell>
            <!-- <CTableDataCell>{{ item.machineNo }}</CTableDataCell> -->
            <CTableDataCell style="text-align: center">
              <CBadge
                :color="getStatusColor(item.status)"
                shape="rounded-pill"
                >{{ item.status }}</CBadge
              ></CTableDataCell
            >
            <CTableDataCell style="text-align: center">
              <CButton
                class="text-white"
                style="background-color: blue"
                size="sm"
                @click="openDetailsModal(item)"
              >
                Details</CButton
              >
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </CCol>
  </CRow>
  <DetailsModal
    :visible="showDetailsModal"
    @close="showDetailsModal = false"
    @openDelayModal="openDelayModal"
    @openSOP="openSOP"
  >
  </DetailsModal>
  <DelayModal
    :visible="showDelayModal"
    :task="selectedActivity"
    @close="showDelayModal = false"
    @submitDelay="handleDelaySubmission"
  ></DelayModal>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Swal from "sweetalert2";
import DetailsModal from "./DetailsModal.vue";
import DelayModal from "./DelayModal.vue";

export default {
  name: "TableActivities",
  components: {
    DetailsModal,
    DelayModal,
  },
  props: {
    currentPage: {
      type: Number,
      required: true,
    },
    itemsPerPage: {
      type: Number,
      required: true,
    },
    updateTaskStatus: {
      type: Function,
      required: true,
    },
    currentUser: {
      type: String,
      required: true,
    },
    statusFilter: {
      type: String,
      required: true,
    },
    filteredActivities: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data: () => {
    return {
      showDetailsModal: false,
      showDelayModal: false,
      selectedTask: null,
      delayReason: "",
      plant: "",
      shop: "",
      line: "",
      station: "",
      machineName: "",
      // machineNo: "",
      pmPlanDate: "",
      lastPMDate: "",
      period: "",
      duration: "",
      pic: "",
      tools: "",
      sopFile: "",
      sparepart: "",
      items: [],
    };
  },
  computed: {
    ...mapGetters("activities", [
      "allActivities",
      "selectedActivity",
      "isLoading",
    ]),
    loading() {
      return this.isLoading;
    },

    paginatedActivities() {
      console.log(this.allActivities);
      console.log(this.currentPage);
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      console.log(this.itemsPerPage);
      return this.filteredActivities.slice(start, end);
    },
    totalPages() {
      return this.filteredActivities
        ? Math.ceil(this.filteredActivities.length / this.itemsPerPage)
        : 0;
    },

    userSpecificActivities() {
      return this.allActivities.filter(
        (activity) => activity.assignedTo === this.currentUser
      );
    },
  },
  watch: {
    totalPages: {
      immediate: true,
      handler(newValue) {
        this.$emit("update:totalPages", newValue);
      },
    },
  },
  mounted() {
    // this.fetchData();
    this.fetchActivities();
  },
  methods: {
    ...mapActions("activities", [
      "fetchActivities",
      "selectActivity",
      "updateActivityStatus",
      "updateActivityStatusAndReason",
    ]),

    formatDisplayDate(date) {
      if (!date) return "-";
      const formattedDate = new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }); // Use toLocaleDateString for consistent comparison
      console.log(formattedDate);
      return formattedDate;
    },

    getStatusColor(status) {
      switch (status) {
        case "COMPLETED":
          return "success";
        case "IN PROGRESS":
          return "info";
        case "PLAN":
          return "warning";
        case "DELAY":
          return "danger";
        default:
          return "dark";
      }
    },
    // findItemByKanbanNo(kanbanNo) {
    //   return this.items.find((item) => item.kanbanNo === kanbanNo);
    // },
    async openDetailsModal(item) {
      try {
        // Create a plain object before setting it in the store
        const plainItem = JSON.parse(JSON.stringify(item));
        this.selectActivity(plainItem);
        this.showDetailsModal = true;
      } catch (error) {
        console.error("Error opening details:", error);
        Swal.fire({
          title: "Error",
          text: "An error occurred while opening the details modal.",
          icon: "error",
        });
      }
    },
    closeDetailsModal(item) {
      this.selectActivity(item);
      this.showDetailsModal = false;
    },
    openDelayModal(task) {
      // this.selectedTask = { ...task };
      this.showDetailsModal = false;
      this.showDelayModal = true;
    },

    openSOP() {
      window.open(
        "https://itbdsti-my.sharepoint.com/:f:/g/personal/13220042_mahasiswa_itb_ac_id/EgcmJJ1-hyNMl0oW5_rllvUBC8xvFcXwdRYC55-jVSfx2A?e=XYMxU0",
        "_blank"
      );
    },

    handleDelaySubmission(delayReason) {
      if (this.selectedActivity) {
        this.updateActivityStatusAndReason({
          workOrderId: this.selectedActivity.workOrderId,
          newStatus: "DELAY",
          delayReason: delayReason,
        });
        this.showDelayModal = false;
        this.showDetailsModal = false;
      }
    },

    handleStatusUpdate(taskId, newStatus) {
      this.updateTaskStatus(taskId, newStatus);
    },
  },
};
</script>
