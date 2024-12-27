import { toast } from "vue-sonner";
import api from "@/apis/CommonAPI";

export default {
  namespaced: true,

  state: {
    checksheets: [],
    pmHistory: [],
    parts: {},
    selectedChecksheet: null,
    loading: false,
    error: null,
    filters: {
      kanbanNo: "",
      machineName: "",
      submittedBy: "",
      reviewedBy: "",
      status: "ALL",
    },
  },

  mutations: {
    SET_CHECKSHEETS(state, checksheets) {
      state.checksheets = checksheets;
    },

    SET_SELECTED_CHECKSHEET(state, checksheet) {
      state.selectedChecksheet = checksheet;
    },

    SET_PM_HISTORY(state, history) {
      state.pmHistory = history;
    },

    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters };
    },

    RESET_FILTERS(state) {
      state.filters = {
        kanbanNo: "",
        machineName: "",
        submittedBy: "",
        reviewedBy: "",
        status: "ALL",
      };
    },

    UPDATE_WORK_ORDER_STATUS(state, { workOrderId, status }) {
      const checksheets = state.checksheets.filter(
        (c) => c.work_order_id === workOrderId
      );
      checksheets.forEach((checksheet) => {
        if (checksheet.work_order) {
          checksheet.work_order.status = status;
        }
      });
    },

    SET_PARTS(state, parts) {
      console.log("SET_PARTS mutation called with:", parts);
      state.parts = parts.reduce((acc, part) => {
        if (part && part._id) {
          acc[part._id] = part;
        }
        return acc;
      }, {});
      console.log("Updated parts state:", state.parts);
    },

    SET_LOADING(state, status) {
      state.loading = status;
    },

    SET_ERROR(state, error) {
      state.error = error;
    },

    CLEAR_ERROR(state) {
      state.error = null;
    },

    CLEAR_STATE(state) {
      state.checksheets = [];
      state.selectedChecksheet = null;
      state.error = null;
    },
  },

  actions: {
    async fetchChecksheets({ commit }) {
      commit("SET_LOADING", true);

      try {
        // Get current user (Team Leader) from localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        console.log("Current user:", user);

        // Get history kanban for Team Leader's work orders
        const historyKanbanResponse = await api.get(
          `/kanban/history-kanban`,
          "?"
        );
        console.log("History Kanban response:", historyKanbanResponse);

        if (historyKanbanResponse?.data?.data) {
          // Filter submissions for work orders created by this team leader
          const submissions = historyKanbanResponse.data.data.filter(
            (submission) => submission.work_order?.created_by === user?._id
          );

          console.log(
            "Filtered submissions for Team Leader's work orders:",
            submissions
          );

          // Format the checksheets data
          const checksheets = submissions.map((submission) => ({
            _id: submission._id,
            kanban_id: submission.kanban_id,
            work_order_id: submission.work_order_id,
            created_by: submission.created_by, // Team member who submitted
            created_dt: submission.created_dt,
            team_member: submission.work_order?.user_id,
            team_leader: submission.work_order?.created_by,
            itemcheck: submission.itemcheck.map((item) => ({
              ...item,
              _id: item.itemcheck_id,
              filename: item.filename,
              contentType: item.contentType,
              value: item.value,
              ocr_value: item.ocr_value,
            })),
            work_order: {
              ...submission.work_order,
              work_dt: submission.work_order?.work_dt,
              status: submission?.status || "PENDING",
            },
          }));

          commit("SET_CHECKSHEETS", checksheets);
          console.log("Processed checksheets:", checksheets);
          return checksheets;
        }
      } catch (error) {
        console.error("Error fetching checksheets:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to fetch checksheets");
        return [];
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async fetchParts({ commit }, partIds) {
      try {
        console.log("fetchParts action called with IDs:", partIds);
        if (!partIds || partIds.length === 0) return [];

        const uniquePartIds = [...new Set(partIds)];
        console.log("Unique part IDs to fetch:", uniquePartIds);

        const promises = uniquePartIds.map((id) => {
          console.log(`Fetching part with ID: ${id}`);
          return api.get(`/asset/list-asset?collection=part&id=${id}`, "?");
        });

        const responses = await Promise.all(promises);
        console.log("Raw API responses:", responses);

        const parts = responses.reduce((acc, response) => {
          if (response?.data?.data) {
            acc.push(...response.data.data);
          }
          return acc;
        }, []);

        console.log("Processed parts data:", parts);

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

    async fetchPMHistory({ commit }) {
      commit("SET_LOADING", true);
      try {
        const response = await api.get("/kanban/history-kanban", "?");

        if (response?.data?.data) {
          // Get unique user IDs for fetching names
          const userIds = new Set();
          response.data.data.forEach((item) => {
            if (item.created_by) userIds.add(item.created_by);
            if (item.reviewed_by) userIds.add(item.reviewed_by);
          });

          // Fetch user names in parallel
          const userPromises = Array.from(userIds).map(async (userId) => {
            try {
              const userResponse = await api.get(
                `/user/list-user?id=${userId}`,
                "?"
              );
              return {
                id: userId,
                name: userResponse?.data?.data?.username || "Unknown User",
              };
            } catch (error) {
              console.error(`Error fetching user ${userId}:`, error);
              return { id: userId, name: "Unknown User" };
            }
          });

          const users = await Promise.all(userPromises);
          const userMap = users.reduce((acc, user) => {
            acc[user.id] = user.name;
            return acc;
          }, {});

          const formattedHistory = response.data.data.map((history) => ({
            id: history._id,
            date: new Date(history.created_dt).toLocaleDateString(),
            kanbanNo: history.kanban_nm,
            machineNo: history.machine?.machine_no || "-",
            machineName: history.machine?.machine_nm || "-",
            period: history.period,
            submittedBy: userMap[history.created_by] || "Unknown User",
            submittedById: history.created_by,
            reviewedBy: userMap[history.reviewed_by] || "Unknown User",
            reviewedById: history.reviewed_by,
            status: history.work_order?.status || "PENDING",
            items: history.itemcheck.map((item) => ({
              itemCheck: item.itemcheck_nm,
              method: item.method || "-",
              machineCondition: item.machine_condition || "-",
              duration: item.duration || "-",
              minValue: item.min || "-",
              maxValue: item.max || "-",
              input: item.value || "-",
              result: item.result || "-",
              remarks: item.remarks || "-",
              approved:
                history.review_details?.find((r) => r.itemcheck_id === item._id)
                  ?.status || "PENDING",
            })),
            review_remarks: history.review_remarks || "",
            reviewed_dt: history.reviewed_dt
              ? new Date(history.reviewed_dt).toLocaleDateString()
              : "-",
          }));

          commit("SET_PM_HISTORY", formattedHistory);
          return formattedHistory;
        }
      } catch (error) {
        console.error("Error fetching PM history:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to fetch PM history");
        return [];
      } finally {
        commit("SET_LOADING", false);
      }
    },

    selectChecksheet({ commit }, checksheet) {
      commit("SET_SELECTED_CHECKSHEET", checksheet);
    },

    updateFilters({ commit }, filters) {
      commit("SET_FILTERS", filters);
    },

    resetFilters({ commit }) {
      commit("RESET_FILTERS");
    },

    async reviewWorkOrder(
      { commit, dispatch },
      { workOrderId, status, remarks }
    ) {
      try {
        console.log("Reviewing work order:", { workOrderId, status, remarks });

        const response = await api.put(`/kanban/edit-work-order`, workOrderId, {
          status,
          remarks,
          updated_by: JSON.parse(localStorage.getItem("user"))._id,
        });

        if (response?.data?.status === 200) {
          commit("UPDATE_WORK_ORDER_STATUS", {
            workOrderId,
            status,
          });

          toast.success("Review submitted successfully");
          await dispatch("fetchChecksheets");
          return true;
        }

        throw new Error(response.data?.message || "Failed to submit review");
      } catch (error) {
        console.error("Error reviewing work order:", error);
        toast.error(error.message || "Failed to submit review");
        return false;
      }
    },

    async fetchPMHistory({ commit }) {
      try {
        // Get current user for filtering
        const user = JSON.parse(localStorage.getItem("user"));

        const response = await api.get(`/kanban/history-kanban`, "?");

        if (response?.data?.data) {
          const formattedHistory = response.data.data.map((history) => ({
            id: history._id,
            date: new Date(history.created_dt).toLocaleDateString(),
            kanbanNo: history.kanban_nm,
            submittedBy: history.created_by,
            reviewedBy: history.reviewed_by,
            status: history.work_order?.status || "PENDING",
            itemcheck: history.itemcheck,
            review_remarks: history.review_remarks,
            reviewed_dt: history.reviewed_dt,
          }));

          commit("SET_PM_HISTORY", formattedHistory);
          return formattedHistory;
        }
      } catch (error) {
        console.error("Error fetching PM history:", error);
        toast.error(error.message || "Failed to fetch PM history");
        return [];
      }
    },

    clearState({ commit }) {
      commit("CLEAR_STATE");
    },
  },

  getters: {
    allChecksheets: (state) => state.checksheets,

    selectedChecksheet: (state) => state.selectedChecksheet,

    checksheetsByWorkOrder: (state) => (workOrderId) =>
      state.checksheets.filter(
        (checksheet) => checksheet.work_order_id === workOrderId
      ),

    pendingChecksheets: (state) =>
      state.checksheets.filter(
        (checksheet) => checksheet.work_order?.status === "PENDING"
      ),

    approvedChecksheets: (state) =>
      state.checksheets.filter(
        (checksheet) => checksheet.work_order?.status === "APPROVED"
      ),

    rejectedChecksheets: (state) =>
      state.checksheets.filter(
        (checksheet) => checksheet.work_order?.status === "REJECTED"
      ),

    // Get unique work orders (to avoid duplicates from multiple submissions)
    uniqueWorkOrders: (state) => {
      const workOrderMap = {};
      state.checksheets.forEach((checksheet) => {
        if (checksheet.work_order && !workOrderMap[checksheet.work_order._id]) {
          workOrderMap[checksheet.work_order._id] = checksheet.work_order;
        }
      });
      return Object.values(workOrderMap);
    },

    // Gets latest submission for each work order
    latestSubmissions: (state) => {
      const workOrderMap = {};
      state.checksheets.forEach((checksheet) => {
        const currentLatest = workOrderMap[checksheet.work_order_id];
        if (
          !currentLatest ||
          new Date(checksheet.created_dt) > new Date(currentLatest.created_dt)
        ) {
          workOrderMap[checksheet.work_order_id] = checksheet;
        }
      });
      return Object.values(workOrderMap);
    },

    checksheetsByStatus: (state) => (status) =>
      state.checksheets.filter(
        (checksheet) => checksheet.work_order?.status === status
      ),

    checksheetsByDate: (state) => (date) =>
      state.checksheets.filter((checksheet) => {
        const checksheetDate = new Date(checksheet.created_dt).toDateString();
        const targetDate = new Date(date).toDateString();
        return checksheetDate === targetDate;
      }),

    isLoading: (state) => state.loading,

    error: (state) => state.error,

    hasError: (state) => !!state.error,

    totalCount: (state) => state.checksheets.length,

    statusCounts: (state) => {
      const workOrders = new Set(state.checksheets.map((c) => c.work_order_id));
      const counts = {
        total: workOrders.size,
        pending: 0,
        approved: 0,
        rejected: 0,
      };

      workOrders.forEach((workOrderId) => {
        const submissions = state.checksheets.filter(
          (c) => c.work_order_id === workOrderId
        );
        const latestSubmission = submissions.reduce((latest, current) =>
          new Date(current.created_dt) > new Date(latest.created_dt)
            ? current
            : latest
        );

        const status = latestSubmission.work_order?.status || "PENDING";
        if (status === "PENDING") counts.pending++;
        if (status === "APPROVED") counts.approved++;
        if (status === "REJECTED") counts.rejected++;
      });

      return counts;
    },

    getPart: (state) => (partId) => state.parts[partId] || null,

    filteredPMHistory: (state) => {
      return state.pmHistory.filter((item) => {
        const matchKanban =
          !state.filters.kanbanNo ||
          item.kanbanNo
            .toLowerCase()
            .includes(state.filters.kanbanNo.toLowerCase());

        const matchMachine =
          !state.filters.machineName ||
          item.machineName
            .toLowerCase()
            .includes(state.filters.machineName.toLowerCase());

        const matchSubmitter =
          !state.filters.submittedBy ||
          item.submittedBy
            .toLowerCase()
            .includes(state.filters.submittedBy.toLowerCase());

        const matchReviewer =
          !state.filters.reviewedBy ||
          item.reviewedBy
            .toLowerCase()
            .includes(state.filters.reviewedBy.toLowerCase());

        const matchStatus =
          state.filters.status === "ALL" ||
          item.status === state.filters.status;

        return (
          matchKanban &&
          matchMachine &&
          matchSubmitter &&
          matchReviewer &&
          matchStatus
        );
      });
    },

    // Get unique values for filters
    uniqueKanbanNos: (state) => [
      ...new Set(state.pmHistory.map((item) => item.kanbanNo)),
    ],
    uniqueMachineNames: (state) => [
      ...new Set(state.pmHistory.map((item) => item.machineName)),
    ],
    uniqueSubmitters: (state) => [
      ...new Set(state.pmHistory.map((item) => item.submittedBy)),
    ],
    uniqueReviewers: (state) => [
      ...new Set(state.pmHistory.map((item) => item.reviewedBy)),
    ],

    // Get statistics
    statistics: (state) => {
      return {
        total: state.pmHistory.length,
        pending: state.pmHistory.filter((item) => item.status === "PENDING")
          .length,
        reviewed: state.pmHistory.filter((item) => item.status === "REVIEWED")
          .length,
        rejected: state.pmHistory.filter((item) => item.status === "REJECTED")
          .length,
      };
    },
  },
};
