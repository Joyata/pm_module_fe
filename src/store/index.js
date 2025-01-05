import { createStore } from "vuex";
import scheduleModule from "./schedule.module";
import userModule from "./user.module";
import machines from "./machines.module";
import activitiesModule from "./activities.module";
import BIRAModule from "./BIRA.module";
import SOPModule from "./SOP.module";
import sparepartsModule from "./spareparts.module";
import toolsModule from "./tools.module";
import machinesModule from "./machines.module";
import itemchecksModule from "./itemchecks.module";
import checksheetsModule from "./checksheets.module";
import notificationsModule from "./notifications.module";
import authModule from "./auth.module";
import changelogModule from "./changelog.module";
import thresholdModule from "./threshold.module";

export default createStore({
  state: {
    sidebarVisible: "",
    sidebarUnfoldable: false,
  },
  mutations: {
    toggleSidebar(state) {
      state.sidebarVisible = !state.sidebarVisible;
    },
    toggleUnfoldable(state) {
      state.sidebarUnfoldable = !state.sidebarUnfoldable;
    },
    updateSidebarVisible(state, payload) {
      state.sidebarVisible = payload;
    },
  },
  actions: {},
  modules: {
    schedule: scheduleModule,
    user: userModule,
    machines,
    activities: activitiesModule,
    BIRA: BIRAModule,
    SOP: SOPModule,
    spareparts: sparepartsModule,
    tools: toolsModule,
    machines: machinesModule,
    itemchecks: itemchecksModule,
    checksheets: checksheetsModule,
    notifications: notificationsModule,
    auth: authModule,
    changelog: changelogModule,
    threshold: thresholdModule,
  },
});
