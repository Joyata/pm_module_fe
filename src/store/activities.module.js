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
    activities: [],
    workOrders: [],
    kanbans: [],
    parts: {},
    selectedActivity: null,
    loading: false,
    error: null,
  },

  mutations: {
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_ACTIVITIES(state, activities) {
      state.activities = activities;
    },
    SET_WORK_ORDERS(state, workOrders) {
      state.workOrders = workOrders;
    },
    SET_KANBANS(state, kanbans) {
      state.kanbans = kanbans;
    },
    SET_PARTS(state, parts) {
      state.parts = parts.reduce((acc, part) => {
        if (part && part._id) {
          acc[part._id] = part;
        }
        return acc;
      }, {});
    },
    SET_SELECTED_ACTIVITY(state, activity) {
      state.selectedActivity = activity
        ? JSON.parse(JSON.stringify(activity))
        : null;
    },
    UPDATE_ACTIVITY(state, updatedActivity) {
      const index = state.activities.findIndex(
        (activity) => activity._id === updatedActivity._id
      );
      if (index !== -1) {
        state.activities.splice(index, 1, updatedActivity);
      }
    },
    UPDATE_ACTIVITY_STATUS(state, { activityId, newStatus }) {
      const activity = state.activities.find((a) => a._id === activityId);
      if (activity) {
        activity.status = newStatus;
      }
    },
    UPDATE_ACTIVITY_STATUS_AND_REASON(
      state,
      { activityId, newStatus, delayReason }
    ) {
      const activity = state.activities.find((a) => a._id === activityId);
      if (activity) {
        activity.status = newStatus;
        activity.delayReason = delayReason;
      }
    },
    // ADD_ACTIVITY(state, activity) {
    //   state.activities.push(activity);
    // },
    // UPDATE_ACTIVITY_DATE(state, { activityId, newDate }) {
    //   const activity = state.activities.find((a) => a.id === activityId);
    //   if (activity) {
    //     activity.date = newDate;
    //   }
    // },
  },

  actions: {
    // Fetch both kanbans and work orders
    async fetchActivities({ commit, dispatch }) {
      commit("SET_LOADING", true);

      try {
        // Get current user from localStorage with error handling
        const user = getStoredUser();
        if (!user || !user._id) {
          throw new Error("Invalid user data");
        }
        console.log("Current user:", user);

        // Fetch work orders for current user
        const workOrderResponse = await api.get(
          `/kanban/list-work-order?user_id=${user?._id}`,
          "?"
        );
        console.log(
          "Work order request URL:",
          `/kanban/list-work-order?user_id=${user?._id}`
        );
        console.log("Work order response:", workOrderResponse);

        if (workOrderResponse?.data?.data) {
          const workOrders = workOrderResponse.data.data;
          console.log("Work orders:", workOrders);

          // Fetch kanban details for each work order
          const kanbanPromises = workOrders.map((workOrder) =>
            api.get(`/kanban/list-kanban?id=${workOrder.kanban_id}`, "?")
          );
          const kanbanResponses = await Promise.all(kanbanPromises);
          const kanbans = kanbanResponses
            .map((response) => response?.data?.data?.[0])
            .filter(Boolean);

          console.log("Fetched kanbans:", kanbans);

          // Create a map for quick kanban lookup
          const kanbanMap = kanbans.reduce((acc, kanban) => {
            acc[kanban._id] = kanban;
            return acc;
          }, {});

          // Format activities by combining work orders with kanban data
          const formattedActivities = workOrders.map((workOrder) => {
            const kanban = kanbanMap[workOrder.kanban_id];
            return {
              _id: workOrder._id,
              workOrderId: workOrder._id,
              date: workOrder.work_dt || "",
              kanbanNo: kanban?.kanban_nm || "",
              kanbanId: kanban?._id || "",
              period: kanban?.period || "",
              last_check_dt: kanban?.last_check_dt,
              next_check_dt: kanban?.next_check_dt,

              // Machine details
              machineName: kanban?.machine?.machine_nm || "",
              machineId: kanban?.machine?._id || "",
              machineStationId: kanban?.machine?.station_id,

              // Status and assignment
              status: workOrder.status || "PLAN",
              assignedTo: workOrder.user_id,
              assignedToName: user?.username || "",

              // Detailed data
              itemcheck:
                kanban?.itemcheck?.map((item) => ({
                  _id: item._id,
                  itemcheck_nm: item.itemcheck_nm,
                  std: item.std,
                  min: item.min,
                  max: item.max,
                  period: item.period,
                  unit: item.unit,
                  tools_id: item.tools_id,
                  spare_part_id: item.spare_part_id,
                  part_id: item.part_id,
                })) || [],

              // Tools and spare parts
              tools: kanban?.tools || [],
              spare_parts: kanban?.spare_part || [],

              // Metadata
              created_by: workOrder.created_by,
              created_dt: workOrder.created_dt,
              updated_by: workOrder.updated_by,
              updated_dt: workOrder.updated_dt,
            };
          });

          commit("SET_ACTIVITIES", formattedActivities);
          console.log("Formatted activities:", formattedActivities);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        commit("SET_ERROR", "Failed to fetch activities");
        toast.error("Error fetching activities");
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async fetchParts({ commit }, partIds) {
      try {
        if (!partIds || partIds.length === 0) return [];

        const uniquePartIds = [...new Set(partIds)];
        const promises = uniquePartIds.map((id) =>
          api.get(`/asset/list-asset?collection=part&id=${id}`, "?")
        );

        const responses = await Promise.all(promises);
        const parts = responses.reduce((acc, response) => {
          if (response?.data?.data) {
            acc.push(...response.data.data);
          }
          return acc;
        }, []);

        if (parts.length > 0) {
          commit("SET_PARTS", parts);
        }
        return parts;
      } catch (error) {
        console.error("Error fetching parts:", error);
        toast.error("Failed to fetch parts");
        return [];
      }
    },

    // Select an activity for detailed view
    selectActivity({ commit }, activity) {
      commit("SET_SELECTED_ACTIVITY", activity);
    },

    // Update work order status
    async updateActivityStatus({ commit }, { workOrderId, newStatus }) {
      try {
        console.log("Updating activity status:", { workOrderId, newStatus });

        // Fix the format to match what backend expects
        const response = await api.put("/kanban/edit-work-order", workOrderId, {
          status: newStatus,
        });

        if (response?.data?.status === 200) {
          commit("UPDATE_ACTIVITY_STATUS", {
            activityId: workOrderId,
            newStatus,
          });
          toast.success("Status updated successfully");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating activity status:", error);
        toast.error("Failed to update activity status");
        throw error;
      }
    },

    // Update work order status with delay reason
    async updateActivityStatusAndReason(
      { commit },
      { workOrderId, newStatus, delayReason }
    ) {
      try {
        const response = await api.put(`/kanban/edit-work-order`, workOrderId, {
          status: newStatus,
          delayReason: delayReason,
        });

        if (response.data && response.data.status === 200) {
          commit("UPDATE_ACTIVITY_STATUS_AND_REASON", {
            activityId: workOrderId,
            newStatus,
            delayReason,
          });
          toast.success("Status and reason updated successfully");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating activity status and reason:", error);
        toast.error("Failed to update activity status and reason");
        return false;
      }
    },

    // Submit completed kanban work
    async submitKanban({ dispatch }, { formData }) {
      try {
        console.log("Submitting kanban with FormData");
        const response = await api.post("/kanban/submit-kanban", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Form Data in store:", formData);
        console.log("📥 API Response:", response.data);

        if (response?.data?.status === 200) {
          toast.success("Work order submitted successfully");
          await dispatch("fetchActivities");
          return true;
        }

        console.error("Submission failed:", response);
        toast.error(response?.data?.message || "Failed to submit work order");
        return false;
      } catch (error) {
        console.error("Error submitting kanban:", error);
        toast.error(
          error.response?.data?.message || "Failed to submit work order"
        );
        return false;
      }
    },

    // Add new work order
    async addWorkOder({ dispatch }, workOrderData) {
      try {
        const response = await api.post(
          `/kanban/add-work-order`,
          workOrderData
        );

        if (response.data && response.data.status === 200) {
          toast.success("Work order added successfully");
          await dispatch("fetchActivities");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error adding work order:", error);
        toast.error("Failed to add work order");
        return false;
      }
    },

    // Delete work order
    async deleteWorkOrder({ dispatch }, workOrderId) {
      try {
        const response = await api.delete(
          `/kanban/delete-work-order`,
          workOrderId
        );

        if (response.data && response.data.status === 200) {
          toast.success("Work order deleted successfully");
          await dispatch("fetchActivities");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error deleting work order:", error);
        toast.error("Failed to delete work order");
        return false;
      }
    },
  },

  getters: {
    allActivities: (state) => state.activities,
    selectedActivity: (state) => state.selectedActivity,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error,
    workOrders: (state) => state.workOrders,
    kanbans: (state) => state.kanbans,

    // Get activities filtered by user ID
    activitiesByUser: (state) => (userId) => {
      return state.activities.filter(
        (activity) => activity.assignedTo === userId
      );
    },

    // Get activities by status
    activitiesByStatus: (state) => (status) => {
      return state.activities.filter((activity) => activity.status === status);
    },

    // Get activity by ID
    getActivityById: (state) => (activityId) => {
      return state.activities.find((activity) => activity._id === activityId);
    },

    getPart: (state) => (partId) => state.parts[partId] || null,
  },
};
