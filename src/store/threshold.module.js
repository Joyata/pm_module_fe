import Swal from "sweetalert2";
import api from "@/apis/CommonAPI";

// Constants
const DEFAULT_THRESHOLDS = {
  warningThreshold: {
    x: 0.5,
    y: 0.5,
    z: 11,
  },
  criticalThreshold: {
    x: 1,
    y: 1,
    z: 11.5,
  },
};

// Initialize state
const initializeThresholdState = () => {
  try {
    return {
      thresholds: null,
      loading: false,
      error: null,
      defaultThresholds: DEFAULT_THRESHOLDS,
    };
  } catch (e) {
    console.error("Error initializing threshold state:", e);
    return {
      thresholds: null,
      loading: false,
      error: null,
      defaultThresholds: DEFAULT_THRESHOLDS,
    };
  }
};

export default {
  namespaced: true,
  state: initializeThresholdState(),

  mutations: {
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_THRESHOLDS(state, thresholds) {
      state.thresholds = thresholds;
    },
    RESET_ERROR(state) {
      state.error = null;
    },
    CLEAR_THRESHOLDS(state) {
      state.thresholds = null;
      state.error = null;
    },
    REHYDRATE_THRESHOLDS(state) {
      const newState = initializeThresholdState();
      Object.assign(state, newState);
    },
  },

  actions: {
    async fetchThresholds({ commit }, { machineId, sensorId }) {
      commit("SET_LOADING", true);
      commit("RESET_ERROR");

      try {
        const response = await api.get("/thresholds/get", {
          params: { machine_id: machineId, sensor_id: sensorId },
        });

        if (response.data?.status === 200) {
          commit("SET_THRESHOLDS", response.data.data || DEFAULT_THRESHOLDS);
          return response.data.data;
        } else {
          throw new Error(
            response.data?.message || "Failed to fetch thresholds"
          );
        }
      } catch (error) {
        console.error("Fetch thresholds error:", error);
        commit("SET_ERROR", error.message);
        await Swal.fire({
          icon: "error",
          title: "Failed to Load Thresholds",
          text:
            error.response?.data?.message ||
            "Failed to load threshold settings",
          confirmButtonColor: "#c41e3a",
        });
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateThresholds(
      { commit },
      { machineId, sensorId, warningThreshold, criticalThreshold }
    ) {
      commit("SET_LOADING", true);
      commit("RESET_ERROR");

      try {
        // Validate thresholds
        if (!validateThresholds(warningThreshold, criticalThreshold)) {
          throw new Error("Invalid threshold values");
        }

        const response = await api.post("/thresholds/update", {
          machine_id: machineId,
          sensor_id: sensorId,
          warningThreshold,
          criticalThreshold,
        });

        if (response.data?.status === 200) {
          commit("SET_THRESHOLDS", {
            warningThreshold,
            criticalThreshold,
          });

          await Swal.fire({
            icon: "success",
            title: "Thresholds Updated",
            text: "Threshold settings have been updated successfully",
            confirmButtonColor: "#198754",
          });

          return response.data;
        } else {
          throw new Error(
            response.data?.message || "Failed to update thresholds"
          );
        }
      } catch (error) {
        console.error("Update thresholds error:", error);
        commit("SET_ERROR", error.message);
        await Swal.fire({
          icon: "error",
          title: "Update Failed",
          text:
            error.response?.data?.message ||
            "Failed to update threshold settings",
          confirmButtonColor: "#c41e3a",
        });
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async resetThresholds({ commit }, { machineId, sensorId }) {
      commit("SET_LOADING", true);
      commit("RESET_ERROR");

      try {
        const response = await api.post("/thresholds/reset", {
          machine_id: machineId,
          sensor_id: sensorId,
        });

        if (response.data?.status === 200) {
          commit("SET_THRESHOLDS", DEFAULT_THRESHOLDS);

          await Swal.fire({
            icon: "success",
            title: "Thresholds Reset",
            text: "Threshold settings have been reset to default values",
            confirmButtonColor: "#198754",
          });

          return response.data;
        } else {
          throw new Error(
            response.data?.message || "Failed to reset thresholds"
          );
        }
      } catch (error) {
        console.error("Reset thresholds error:", error);
        commit("SET_ERROR", error.message);
        await Swal.fire({
          icon: "error",
          title: "Reset Failed",
          text:
            error.response?.data?.message ||
            "Failed to reset threshold settings",
          confirmButtonColor: "#c41e3a",
        });
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    rehydrateThresholds({ commit }) {
      commit("REHYDRATE_THRESHOLDS");
    },
  },

  getters: {
    currentThresholds: (state) => state.thresholds || state.defaultThresholds,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error,
    warningThresholds: (state) =>
      (state.thresholds || state.defaultThresholds).warningThreshold,
    criticalThresholds: (state) =>
      (state.thresholds || state.defaultThresholds).criticalThreshold,
  },
};

// Helper functions
function validateThresholds(warning, critical) {
  if (!warning || !critical) return false;

  const requiredAxes = ["x", "y", "z"];

  // Check if all axes exist
  const hasAllAxes = requiredAxes.every(
    (axis) => warning.hasOwnProperty(axis) && critical.hasOwnProperty(axis)
  );

  if (!hasAllAxes) return false;

  // Check if warning thresholds are less than critical thresholds
  return requiredAxes.every((axis) => {
    const w = Number(warning[axis]);
    const c = Number(critical[axis]);
    return !isNaN(w) && !isNaN(c) && w < c;
  });
}
