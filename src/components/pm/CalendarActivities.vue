<template>
  <CContainter fluid>
    <CRow>
      <vue-cal
        active-view="week"
        :selected-date="selectedDate"
        today-button
        :time="false"
        events-count-on-year-view
        :disable-views="['years']"
        :events="calendarEvents"
        :editable-events="{
          title: false,
          drag: false,
          resize: false,
          delete: false,
          create: false,
        }"
        :on-event-click="onEventClick"
        :snap-to-time="15"
        class="vuecal--blue-theme"
        style="height: 350px"
      ></vue-cal>

      <!-- <Teleport to="body">
        <CModal
          alignment="center"
          :visible="showDialog"
          @close="showDialog = false"
        >
          <CCard>
            <CCardHeader>
              <span>{{ selectedEvent.title }}</span>
              <div class="ms-auto">
                <strong>{{
                  selectedEvent.start &&
                  selectedEvent.start.format("DD/MM/YYYY")
                }}</strong>
              </div>
            </CCardHeader>
            <CCardBody>
              <p v-html="selectedEvent.contentFull"></p>
              <strong>PM details:</strong>
              <ul>
                <li>
                  Event starts at:
                  {{ selectedEvent.start && selectedEvent.start.formatTime() }}
                </li>
                <li>
                  Event ends at:
                  {{ selectedEvent.end && selectedEvent.end.formatTime() }}
                </li>
              </ul>
            </CCardBody>
          </CCard>
        </CModal>
      </Teleport> -->
    </CRow>
  </CContainter>

  <DetailsModal
    :visible="showDetailsModal"
    @close="showDetailsModal = false"
    @openDelayModal="openDelayModal"
    @openChecksheet="openChecksheet"
    @checkToolsAvailability="checkToolsAvailability"
    @checkSparePartAvailability="checkSparePartAvailability"
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
import VueCal from "vue-cal";
import "vue-cal/dist/vuecal.css";
import { mapActions, mapGetters } from "vuex";
import DetailsModal from "./DetailsModal.vue";
import DelayModal from "./DelayModal.vue";

export default {
  name: "CalendarActivities",
  components: {
    VueCal,
    DetailsModal,
    DelayModal,
  },
  props: {
    currentUser: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    selectedDate: null,
    selectedEvent: {},
    showDetailsModal: false,
    showDelayModal: false,
  }),
  computed: {
    ...mapGetters("activities", ["allActivities", "selectedActivity"]),
    calendarEvents() {
      console.log(this.allActivities);
      return this.allActivities
        .filter((activity) => activity.assignedTo === this.currentUser)
        .map((activity) => {
          const activityDate = new Date(
            activity.date.split("-").reverse().join("-")
          );
          console.log(activity);
          return {
            start: activityDate,
            end: activityDate,
            title: `PM-${activity.kanbanNo}`,
            content: activity.machineName,
            class: this.getEventClass(activity.period),
            machine: activity.machineNo,
            status: activity.status,
            id: activity.id,
          };
        });
    },
  },
  methods: {
    ...mapActions("activities", [
      "selectActivity",
      "updateActivityStatusAndReason",
    ]),
    onEventClick(event, e) {
      const activity = this.allActivities.find((a) => a.id === event.id);
      if (activity) {
        this.selectActivity(activity);
        this.showDetailsModal = true;
      }
      e.stopPropagation();
    },
    getEventClass(period) {
      switch (period) {
        case "1 Month":
          return "pmA";
        case "3 Months":
          return "pmB";
        case "6 Months":
          return "pmC";
        case "12 Months":
          return "pmD";
        default:
          return "pm";
      }
    },
    openDelayModal() {
      this.showDetailsModal = false;
      this.showDelayModal = true;
    },
    openSOP(sopFile) {
      if (sopFile) {
        let baseUrl = "https://your-base-url.com/sop-files/";
        window.open(baseUrl + sopFile, "_blank");
      } else {
        console.error("No SOP file available");
      }
    },
    async checkSparePartAvailability(partName) {
      let mockApiCall = new Promise((resolve) => {
        setTimeout(() => {
          resolve(Math.random() > 0.5 ? "In Stock" : "Out of Stock");
        }, 1000);
      });
      let availability = await mockApiCall;
      alert(`${partName} is ${availability}`);
    },
    async checkToolsAvailability(toolName) {
      let mockApiCall = new Promise((resolve) => {
        setTimeout(() => {
          resolve(Math.random() > 0.5 ? "Available" : "Loaned");
        }, 1000);
      });
      let availability = await mockApiCall;
      alert(`${toolName} is ${availability}`);
    },
    handleDelaySubmission(delayReason) {
      if (this.selectedActivity) {
        this.updateActivityStatusAndReason({
          activityId: this.selectedActivity.id,
          newStatus: "DELAY",
          delayReason: delayReason,
        });
        this.showDelayModal = false;
        this.showDetailsModal = false;
      }
    },
    openChecksheet() {
      if (this.selectedActivity) {
        this.showDetailsModal = false;
        this.$router.push({
          name: "PMChecksheet",
          params: {
            kanbanNo: this.selectedActivity.kanbanNo,
            machineName: this.selectedActivity.machineName,
            machineNo: this.selectedActivity.machineNo,
            date: this.selectedActivity.date,
          },
        });
      } else {
        console.error("No activity selected");
      }
    },
  },
};
</script>

<style>
.vuecal__event {
  cursor: pointer;
}
.vuecal__cell-split.mp1 {
  background-color: rgba(221, 238, 255, 0.5);
}
.vuecal__cell-split.mp2 {
  background-color: rgba(255, 250, 196, 0.5);
}
.vuecal__cell-split.mp3 {
  background-color: rgba(255, 206, 178, 0.5);
}
.vuecal__cell-split .split-label {
  color: rgba(0, 0, 0, 0.1);
  font-size: 26px;
}
.vuecal__event.pm {
  background-color: rgba(144, 210, 190, 0.9);
  border: 5px solid rgb(144, 210, 190);
}
.vuecal__event.pmA {
  background-color: rgba(255, 255, 255, 0.9);
  border: 5px solid rgb(144, 210, 190);
}
.vuecal__event.pmB {
  background-color: rgba(255, 255, 255, 0.9);
  border: 5px solid rgb(5, 255, 1);
}
.vuecal__event.pmC {
  background-color: rgba(255, 255, 255, 0.9);
  border: 5px solid rgb(169, 11, 255);
}
.vuecal__event.pmD {
  background-color: rgba(255, 255, 255, 0.9);
  border: 5px solid rgb(144, 210, 190);
}
.vuecal__event-title {
  font-size: 1.2em;
  font-weight: bold;
  margin: 4px 0 8px;
}
.vuecal__event-time {
  display: inline-block;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}
.vucal__event-content {
  font-style: italic;
}
</style>
