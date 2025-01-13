import { toast } from "vue-sonner";
import api from "@/apis/CommonAPI";

export default {
  namespaced: true,

  state: {
    checksheets: [],
    historyChecksheets: [],
    parts: {},
    selectedChecksheet: null,
    loading: false,
    error: null,
    filters: {
      status: "ALL",
      kanbanNo: "ALL",
      machineName: "ALL",
    },
  },

  mutations: {
    SET_CHECKSHEETS(state, checksheets) {
      state.checksheets = checksheets;
      console.log("SET_CHECKSHEETS:", checksheets);
    },

    SET_PM_HISTORY(state, historyChecksheets) {
      state.historyChecksheets = historyChecksheets;
    },

    SET_SELECTED_CHECKSHEET(state, checksheet) {
      state.selectedChecksheet = checksheet;
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

    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters };
    },

    RESET_FILTERS(state) {
      state.filters = {
        kanbanNo: "ALL",
        machineName: "ALL",
        dateRange: null,
        status: "ALL",
      };
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
      state.reviewedChecksheets = [];
      state.selectedChecksheet = null;
      state.error = null;
    },

    UPDATE_CHECKSHEET_STATUS(state, { checksheetId, workOrderId, status }) {
      // Update status in checksheets array
      const checksheet = state.checksheets.find((c) => c._id === checksheetId);
      if (checksheet && checksheet.work_order) {
        checksheet.work_order.review_status = status;
      }

      // Update status in selected checksheet if it matches
      if (state.selectedChecksheet?._id === checksheetId) {
        state.selectedChecksheet.work_order.review_status = status;
      }
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
        const response = await api.get(`/kanban/history-kanban`, "?");
        console.log("History Kanban response:", response);

        if (response?.data?.data) {
          // Filter submissions for work orders created by this team leader
          const submissions = response.data.data.filter(
            (submission) => submission.work_order?.created_by === user?._id
          );

          console.log(
            "Filtered submissions for Team Leader's work orders:",
            submissions
          );

          // Fetch kanban details for all submissions
          const kanbanPromises = [
            ...new Set(submissions.map((s) => s.kanban_id)),
          ].map((kanbanId) =>
            api.get(`/kanban/list-kanban?id=${kanbanId}`, "?")
          );

          const kanbanResponses = await Promise.all(kanbanPromises);
          const kanbanDetails = kanbanResponses.reduce((acc, response) => {
            const kanban = response?.data?.data[0];
            if (kanban) {
              acc[kanban._id] = kanban;
            }
            return acc;
          }, {});

          // Format the checksheets data
          const checksheets = submissions.map((submission) => ({
            _id: submission._id,
            kanban_id: submission.kanban_id,
            kanban_nm:
              kanbanDetails[submission.kanban_id]?.kanban_nm ||
              submission.kanban_id,
            work_order_id: submission.work_order_id,
            created_by: submission.created_by || submission.submitted_by, // Team member who submitted
            created_dt: submission.created_dt || submission.submitted_dt,
            team_member: submission.work_order?.user_id,
            team_leader: submission.work_order?.created_by,
            machine: {
              machine_nm:
                kanbanDetails[submission.kanban_id]?.machine?.machine_nm || "-",
            },
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
              review_status: submission.work_order?.review_status || "PENDING",
            },
            notes: submission.notes,
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

    async fetchPMHistory({ commit }) {
      commit("SET_LOADING", true);

      try {
        // Get history kanban for Team Leader's work orders
        const response = await api.get(`/kanban/history-kanban`, "?");
        console.log("History Kanban response:", response);

        if (response?.data?.data) {
          // Filter submissions for work orders created by this team leader
          const submissions = response.data.data;

          console.log("Work orders:", submissions);

          // Fetch kanban details for all submissions
          const kanbanPromises = [
            ...new Set(submissions.map((s) => s.kanban_id)),
          ].map((kanbanId) =>
            api.get(`/kanban/list-kanban?id=${kanbanId}`, "?")
          );

          const kanbanResponses = await Promise.all(kanbanPromises);
          const kanbanDetails = kanbanResponses.reduce((acc, response) => {
            const kanban = response?.data?.data[0];
            if (kanban) {
              acc[kanban._id] = kanban;
            }
            return acc;
          }, {});

          // Format the checksheets data
          const historyChecksheets = submissions.map((submission) => ({
            _id: submission._id,
            kanban_id: submission.kanban_id,
            kanban_nm:
              kanbanDetails[submission.kanban_id]?.kanban_nm ||
              submission.kanban_id,
            work_order_id: submission.work_order_id,
            created_by: submission.created_by || submission.submitted_by, // Team member who submitted
            created_dt: submission.created_dt || submission.submitted_dt,
            team_member: submission.work_order?.user_id,
            team_leader: submission.work_order?.created_by,
            machine: {
              machine_nm:
                kanbanDetails[submission.kanban_id]?.machine?.machine_nm || "-",
            },
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
              review_status: submission.work_order?.review_status || "PENDING",
            },
            notes: submission.notes,
          }));
          commit("SET_PM_HISTORY", historyChecksheets);
          console.log("Processed history checksheets:", historyChecksheets);
          return historyChecksheets;
        }
      } catch (error) {
        console.error("Error fetching checksheets:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to fetch history checksheets");
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

    async fetchKanbanDetails({ commit }, kanbanId) {
      try {
        const response = await api.get(
          `/kanban/list-kanban?id=${kanbanId}`,
          "?"
        );
        return response?.data?.data[0];
      } catch (error) {
        console.error("Error fetching kanban details:", error);
        toast.error("Failed to fetch kanban details");
        return null;
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

    clearState({ commit }) {
      commit("CLEAR_STATE");
    },
  },

  getters: {
    allChecksheets: (state) => state.checksheets,

    selectedChecksheet: (state) => state.selectedChecksheet,

    getPart: (state) => (partId) => state.parts[partId] || null,

    reviewedChecksheets: (state) => {
      return state.historyChecksheets.filter(
        (checksheet) =>
          checksheet.work_order?.review_status === "APPROVED" ||
          checksheet.work_order?.review_status === "REJECTED"
      );
    },

    filteredReviewedChecksheets: (state, getters) => {
      let filtered = getters.reviewedChecksheets;

      if (state.filters.status !== "ALL") {
        filtered = filtered.filter(
          (cs) => cs.work_order?.review_status === state.filters.status
        );
      }

      if (state.filters.kanbanNo !== "ALL") {
        filtered = filtered.filter(
          (cs) => cs.kanban_nm === state.filters.kanbanNo
        );
      }

      if (state.filters.machineName !== "ALL") {
        filtered = filtered.filter(
          (cs) => cs.machine?.machine_nm === state.filters.machineName
        );
      }

      return filtered;
    },

    uniqueKanbanNosInHistory: (state, getters) => {
      return [
        ...new Set(
          getters.reviewedChecksheets.map((cs) => ({
            id: cs.kanban_id,
            name: cs.kanban_nm || cs.kanban_id,
          }))
        ),
      ].map((k) => k.name);
    },

    uniqueMachineNamesInHistory: (state, getters) => {
      return [
        ...new Set(
          getters.reviewedChecksheets
            .map((cs) => cs.machine?.machine_nm)
            .filter((name) => name)
        ),
      ];
    },

    checksheetsByWorkOrder: (state) => (workOrderId) =>
      state.checksheets.filter(
        (checksheet) => checksheet.work_order_id === workOrderId
      ),

    pendingChecksheets: (state) =>
      state.checksheets.filter(
        (checksheet) => checksheet.work_order?.review_status === "PENDING"
      ),

    approvedChecksheets: (state) =>
      state.checksheets.filter(
        (checksheet) => checksheet.work_order?.review_status === "APPROVED"
      ),

    rejectedChecksheets: (state) =>
      state.checksheets.filter(
        (checksheet) => checksheet.work_order?.review_status === "REJECTED"
      ),

    uniqueWorkOrders: (state) => {
      const workOrderMap = {};
      state.checksheets.forEach((checksheet) => {
        if (checksheet.work_order && !workOrderMap[checksheet.work_order._id]) {
          workOrderMap[checksheet.work_order._id] = checksheet.work_order;
        }
      });
      return Object.values(workOrderMap);
    },

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
        (checksheet) => checksheet.work_order?.review_status === status
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
      const counts = {
        total: state.checksheets.length,
        pending: 0,
        approved: 0,
        rejected: 0,
      };

      state.checksheets.forEach((checksheet) => {
        const status = checksheet.work_order?.review_status || "PENDING";
        if (status === "PENDING") counts.pending++;
        else if (status === "APPROVED") counts.approved++;
        else if (status === "REJECTED") counts.rejected++;
      });
      return counts;
    },
  },
};
