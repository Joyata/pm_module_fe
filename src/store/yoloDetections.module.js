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
    async fetchDetections(
      { commit, state },
      { checksheetDate, timeWindowMinutes } = {}
    ) {
      if (state.loading) return state.detections;

      console.log("Fetch detections called with:", {
        checksheetDate,
        rawChecksheetDate: checksheetDate,
        parsedChecksheetDate: checksheetDate ? new Date(checksheetDate) : null,
        timeWindowMinutes,
      });

      commit("SET_LOADING", true);
      try {
        const response = await api.get("/kanban/yolo-images", "?");
        console.log("YOLO detections response:", response);

        if (response?.data?.data) {
          // Transform the data to include full image URLs - using let instead of const
          let detections = response.data.data.map((detection) => ({
            ...detection,
            imageUrl: `${process.env.VUE_APP_API_URL}/uploads/yolo/${detection.filename}`,
            detectionTime: new Date(detection.created_dt).toLocaleString(),
            total_person: detection["total person"],
            created_dt: new Date(detection.created_dt),
          }));

          // Filter detections based on checksheet date if provided
          if (checksheetDate) {
            const checksheetDateTime = new Date(checksheetDate);
            const timeWindowMs = timeWindowMinutes * 60 * 1000;

            console.log("Filtering detections with parameters:", {
              checksheetDate: checksheetDateTime,
              timeWindowMinutes,
              windowStart: new Date(
                checksheetDateTime.getTime() - timeWindowMs
              ),
              windowEnd: new Date(checksheetDateTime.getTime() + timeWindowMs),
            });

            // Filter detections within the time window
            detections = detections.filter((detection) => {
              const timeDiff = Math.abs(
                detection.created_dt - checksheetDateTime
              );
              const isInWindow = timeDiff <= timeWindowMs;

              if (isInWindow) {
                console.log("Detection within window:", {
                  detectionTime: detection.created_dt,
                  timeDiffMinutes: timeDiff / (1000 * 60),
                });
              }

              return isInWindow;
            });

            // Sort by time difference from checksheet creation time
            detections = detections.sort((a, b) => {
              const diffA = Math.abs(a.created_dt - checksheetDateTime);
              const diffB = Math.abs(b.created_dt - checksheetDateTime);
              return diffA - diffB;
            });

            // Take up to 20 images closest to the checksheet time
            detections = detections.slice(0, 20);

            console.log(
              `Selected ${detections.length} detections within ${timeWindowMinutes} minutes of checksheet date`
            );
          } else {
            // If no checksheet date provided, just take the most recent 20
            detections = detections.sort((a, b) => b.created_dt - a.created_dt);
            detections = detections.slice(0, 20);
          }

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
