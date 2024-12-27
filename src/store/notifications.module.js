import { toast } from "vue-sonner";
import api from "@/apis/CommonAPI";

export default {
  namespaced: true,
  state: {
    notifications: [],
    loading: false,
  },
  mutations: {
    SET_NOTIFICATIONS(state, notifications) {
      state.notifications = notifications;
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.unshift({
        ...notification,
        read: false,
        timestamp: Date.now(),
      });
    },
    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter((n) => n.id !== id);
    },
    MARK_AS_READ(state, id) {
      const notification = state.notifications.find((n) => n.id === id);
      if (notification) {
        notification.read = true;
      }
    },
    MARK_ALL_AS_READ(state) {
      state.notifications.forEach((n) => (n.read = true));
    },
    CLEAR_NOTIFICATIONS(state) {
      state.notifications = [];
    },
  },
  actions: {
    async initializeNotifications({ commit, dispatch }, userRole) {
      try {
        // Initialize with default notifications based on role
        await dispatch("updateNotificationsForUser", userRole);
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    },
    updateNotificationsForUser({ commit }, userRole) {
      let defaultNotifications = [];

      if (userRole === "team_member") {
        defaultNotifications = [
          {
            id: 1,
            title: "New Task",
            message: "You have been assigned a new task.",
            timestamp: Date.now(),
            category: "task",
            read: false,
          },
          {
            id: 2,
            title: "Low Stock",
            message: "Spare part XYZ is running low.",
            timestamp: Date.now() - 3600000,
            category: "inventory",
            read: false,
          },
          {
            id: 3,
            title: "Approval",
            message: "Your recent task has been approved.",
            timestamp: Date.now() - 7200000,
            category: "approval",
            read: true,
          },
          {
            id: 4,
            title: "Maintenance Reminder",
            message: "Scheduled maintenance for Machine A is due tomorrow.",
            timestamp: Date.now() - 10800000,
            category: "maintenance",
            read: false,
          },
        ];
      } else if (userRole === "team_leader") {
        defaultNotifications = [
          {
            id: 1,
            title: "New Checksheet",
            message: "A new checksheet has been submitted for your approval.",
            timestamp: Date.now(),
            category: "approval",
            read: false,
          },
          {
            id: 2,
            title: "BIRA Problem",
            message: "A BIRA problem has been reported in the recent task.",
            timestamp: Date.now() - 3600000,
            category: "problem",
            read: false,
          },
          {
            id: 3,
            title: "Unbalanced MP and MH",
            message:
              "Manpower and Man-hour allocation needs adjustment in scheduling.",
            timestamp: Date.now() - 7200000,
            category: "scheduling",
            read: false,
          },
          {
            id: 4,
            title: "Performance Report",
            message: "Monthly performance report is ready for review.",
            timestamp: Date.now() - 10800000,
            category: "report",
            read: true,
          },
        ];
      }
      commit("SET_NOTIFICATIONS", defaultNotifications);
    },
    async addNotification({ commit }, notification) {
      commit("ADD_NOTIFICATION", {
        id: Date.now(),
        ...notification,
      });
    },
    removeNotification({ commit }, id) {
      commit("REMOVE_NOTIFICATION", id);
    },
    markAsRead({ commit }, id) {
      commit("MARK_AS_READ", id);
    },
    markAllAsRead({ commit }) {
      commit("MARK_ALL_AS_READ");
    },
    clearNotifications({ commit }) {
      commit("CLEAR_NOTIFICATIONS");
    },
  },
  getters: {
    getNotifications: (state) => state.notifications,
    getUnreadNotifications: (state) =>
      state.notifications.filter((n) => !n.read),
    getReadNotifications: (state) => state.notifications.filter((n) => n.read),
  },
};
