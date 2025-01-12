import { toast } from "vue-sonner";
import api from "@/apis/CommonAPI";

export default {
  namespaced: true,

  state: {
    detections: [],
    loading: false,
    error: null,
    initialized: false,
  },

  mutations: {
    SET_DETECTIONS(state, detections) {
      state.detections = detections;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_INITIALIZED(state, status) {
      state.initialized = status;
    },
  },

  actions: {
    async fetchDetections({ commit, state }) {
      // Don't fetch if already loading
      if (state.loading) return state.detections;

      commit("SET_LOADING", true);
      try {
        const response = await api.get("/rmq/carefull", "?");
        console.log("YOLO detections response:", response);

        if (response?.data?.data) {
          // Transform the data to include full image URLs
          const detections = response.data.data.map((detection) => ({
            ...detection,
            imageUrl: `${process.env.VUE_APP_API_URL}/uploads/yolo/${detection.filename}`,
            detectionTime: new Date(detection.created_dt).toLocaleString(),
            total_person: detection["total person"],
          }));

          // Sort detections by created_dt in describing order (newest first)
          detections.sort(
            (a, b) => new Date(b.created_dt) - new Date(a.created_dt)
          );

          commit("SET_DETECTIONS", detections);
          commit("SET_INITIALIZED", true);
          return detections;
        }
        commit("SET_INITIALIZED", true);
        return [];
      } catch (error) {
        console.error("Error fetching YOLO detections:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to fetch detection images");
        return [];
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },

  getters: {
    allDetections: (state) => state.detections,
    isLoading: (state) => state.loading,
    error: (state) => state.error,
    hasDetections: (state) => state.detections.length > 0,
    getLatestDetection: (state) => state.detections[0] || null,
  },
};
