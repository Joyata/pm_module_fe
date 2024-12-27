import { toast } from "vue-sonner";
import api from "@/apis/CommonAPI";

const getStoredUser = () => {
  try {
    const userData = localStorage.getItem("user");
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return null;
  }
};

export default {
  namespaced: true,

  state: {
    logs: [],
    comparisons: {},
    loading: false,
    error: null,
    filters: {
      dateRange: "last7days",
      entityType: "all",
      changeType: "all",
      modifiedBy: "all",
      location: "all",
    },
  },

  mutations: {
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_LOGS(state, logs) {
      state.logs = logs;
    },
    ADD_LOGS(state, newLogs) {
      // Create a map of existing logs by ID for faster lookup
      const existingLogs = new Map(state.logs.map((log) => [log._id, log]));

      // Update or add new logs
      newLogs.forEach((newLog) => {
        existingLogs.set(newLog._id, {
          ...existingLogs.get(newLog._id),
          ...newLog,
        });
      });

      // Convert map back to array
      state.logs = Array.from(existingLogs.values());
    },
    SET_COMPARISON(state, { id, data }) {
      state.comparisons[id] = data;
    },
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters };
    },
    CLEAR_LOGS(state) {
      state.logs = [];
      state.comparisons = {};
    },
  },

  actions: {
    // Fetch update logs for a collection
    async fetchUpdateLogs({ commit }, { collection, id }) {
      try {
        console.log("Fetching update logs:", { collection, id });
        const response = await api.get(
          `/asset/log-updated-data?id=676541247a7133870f68f54f`,
          "?"
        );
        console.log("Update logs response:", response);

        if (response?.data?.status === 200) {
          const logs = response.data.data.map((log) => ({
            ...log,
            type: "edit",
          }));
          commit("ADD_LOGS", logs);
          console.log("Update logs fetched:", logs);
          return logs;
        }
        return [];
      } catch (error) {
        console.error("Error fetching update logs:", error);
        toast.error("Failed to fetch update logs");
        commit("SET_ERROR", "Failed to fetch update logs");
        return [];
      }
    },

    // Fetch delete logs for a collection
    async fetchDeleteLogs({ commit }, { collection, id }) {
      try {
        console.log("Fetching delete logs:", { collection, id });
        const response = await api.get(
          `/asset/log-deleted-data?id=676541247a7133870f68f54f`,
          "?"
        );
        console.log("Delete logs response:", response);

        if (response?.data?.status === 200) {
          const logs = response.data.data.map((log) => ({
            ...log,
            type: "delete",
          }));
          commit("ADD_LOGS", logs);
          console.log("Delete logs fetched:", logs);
          return logs;
        }
        return [];
      } catch (error) {
        console.error("Error fetching delete logs:", error);
        toast.error("Failed to fetch delete logs");
        commit("SET_ERROR", "Failed to fetch delete logs");
        return [];
      }
    },

    // Fetch comparison data for updates
    async fetchUpdateComparison({ commit }, { id, collection }) {
      try {
        console.log("Fetching update comparison:", { id, collection });
        const response = await api.get(
          `/asset/compare-updated-data?id=${id}&collection=${collection}`,
          "?"
        );
        console.log("Update comparison response:", response);

        if (response?.data?.status === 200) {
          const comparisonData = response.data.data;
          commit("SET_COMPARISON", { id, data: comparisonData });
          console.log("Update comparison fetched:", comparisonData);
          return comparisonData;
        }
        return null;
      } catch (error) {
        console.error("Error fetching update comparison:", error);
        toast.error("Failed to fetch update comparison");
        commit("SET_ERROR", "Failed to fetch update comparison");
        return null;
      }
    },

    // Fetch comparison data for deletions
    async fetchDeleteComparison({ commit }, { id, collection }) {
      try {
        console.log("Fetching delete comparison:", { id, collection });
        const response = await api.get(
          `/asset/compare-deleted-data?id=${id}&collection=${collection}`,
          "?"
        );
        console.log("Delete comparison response:", response);

        if (response?.data?.status === 200) {
          const comparisonData = response.data.data;
          commit("SET_COMPARISON", { id, data: comparisonData });
          console.log("Delete comparison fetched:", comparisonData);
          return comparisonData;
        }
        return null;
      } catch (error) {
        console.error("Error fetching delete comparison:", error);
        toast.error("Failed to fetch delete comparison");
        commit("SET_ERROR", "Failed to fetch delete comparison");
        return null;
      }
    },

    // Load all logs for a specific entity type
    async loadEntityLogs({ commit, dispatch }, collection) {
      commit("SET_LOADING", true);
      try {
        console.log("Loading logs for entity:", collection);
        await Promise.all([
          dispatch("fetchUpdateLogs", { collection }),
          dispatch("fetchDeleteLogs", { collection }),
        ]);
      } catch (error) {
        console.error(`Error loading logs for ${collection}:`, error);
        toast.error(`Failed to load ${collection} logs`);
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Update filters
    updateFilters({ commit }, filters) {
      commit("SET_FILTERS", filters);
    },

    // Clear all logs
    clearLogs({ commit }) {
      commit("CLEAR_LOGS");
    },
  },

  getters: {
    // Get all logs with current filters applied
    filteredLogs: (state) => {
      let filtered = [...state.logs];

      // Entity type filter
      if (state.filters.entityType !== "all") {
        filtered = filtered.filter(
          (log) => log.collection === state.filters.entityType
        );
      }

      // Change type filter
      if (state.filters.changeType !== "all") {
        filtered = filtered.filter(
          (log) => log.type === state.filters.changeType
        );
      }

      // Modified by filter
      if (state.filters.modifiedBy !== "all") {
        filtered = filtered.filter((log) => {
          const userId = log.type === "edit" ? log.updated_by : log.deleted_by;
          return userId === state.filters.modifiedBy;
        });
      }

      // Date range filter
      const now = new Date();
      const ranges = {
        last24h: new Date(now - 24 * 60 * 60 * 1000),
        last7days: new Date(now - 7 * 24 * 60 * 60 * 1000),
        last30days: new Date(now - 30 * 24 * 60 * 60 * 1000),
      };

      if (ranges[state.filters.dateRange]) {
        filtered = filtered.filter((log) => {
          // Use created_dt as fallback if updated_dt is null
          const logDate = new Date(
            log.type === "edit"
              ? log.updated_dt || log.created_dt
              : log.deleted_dt || log.created_dt
          );
          return logDate > ranges[state.filters.dateRange];
        });
      }

      // Sort by date (newest first)
      return filtered.sort((a, b) => {
        const dataA = new Date(a.type === "edit" ? a.updated_dt : a.deleted_dt);
        const dataB = new Date(b.type === "edit" ? b.updated_dt : b.deleted_dt);
        return dataB - dataA;
      });
    },

    // Get loading state
    isLoading: (state) => state.loading,

    // Get error state
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error,

    // Get filters
    currentFilters: (state) => state.filters,

    // Get comparison data for a specific log
    getComparison: (state) => (id) => state.comparisons[id] || null,

    // Get logs by collection type
    logsByCollection: (state) => (collection) => {
      return state.logs.filter((log) => log.collection === collection);
    },

    // Get logs by user
    logsByUser: (state) => (userId) => {
      return state.logs.filter(
        (log) => log.updated_by === userId || log.deleted_by === userId
      );
    },
  },
};
