import { toast } from "vue-sonner";
import api from "@/apis/CommonAPI";
import { update } from "lodash";

export default {
  namespaced: true,

  state: {
    workOrders: [], // Work orders for calendar display
    kanbans: [], // Kanbans with their itemchecks
    selectedWorkOrder: null,
    filters: {
      teamMember: "ALL",
      period: "ALL",
      status: "ALL",
      location: {
        plant_id: null,
        shop_id: null,
        line_id: null,
        station_id: null,
      },
      bulkImportStatus: {
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
      },
    },
    loading: false,
    error: null,
  },

  mutations: {
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    RESET_LOADING(state) {
      state.loading = false;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_WORK_ORDERS(state, workOrders) {
      console.log("📋 Setting work orders:", workOrders);
      state.workOrders = workOrders;
    },
    SET_KANBANS(state, kanbans) {
      console.log("🏷️ Setting kanbans:", kanbans);
      state.kanbans = kanbans;
    },
    SET_SELECTED_WORK_ORDER(state, workOrder) {
      console.log("Setting selected work order:", workOrder);
      state.selectedWorkOrder = workOrder ? { ...workOrder } : null;
    },
    SET_FILTERS(state, filters) {
      console.log("🔍 Setting filters:", filters);
      console.log("Current filters state:", state.filters);

      // Handle location separately
      if (
        filters.plant_id ||
        filters.shop_id ||
        filters.line_id ||
        filters.station_id
      ) {
        state.filters.location = {
          plant_id: filters.plant_id || state.filters.location.plant_id,
          shop_id: filters.shop_id || state.filters.location.shop_id,
          line_id: filters.line_id || state.filters.location.line_id,
          station_id: filters.station_id || state.filters.location.station_id,
        };
        console.log("📍 Updated location filters:", state.filters.location);

        // Remove location properties from filters object
        const { plant_id, shop_id, line_id, station_id, ...otherFilters } =
          filters;
        state.filters = {
          ...state.filters,
          ...otherFilters,
        };
      } else {
        state.filters = {
          ...state.filters,
          ...filters,
          location: { ...state.filters.location },
        };
      }
      console.log("🔄 Final filters state:", state.filters);
    },
    ADD_WORK_ORDER(state, workOrder) {
      state.workOrders.push(workOrder);
    },
    UPDATE_WORK_ORDER(state, { workOrderId, updates }) {
      const index = state.workOrders.findIndex((wo) => wo._id === workOrderId);
      if (index !== -1) {
        // Map API fields to local state fields
        const mappedUpdates = {
          ...updates,
          date: updates.work_dt || updates.date || state.workOrders[index].date,
          assignedTo:
            updates.user_id ||
            updates.assignedTo ||
            state.workOrders[index].assignedTo, // Map user_id to assignedTo
          status: updates.status || state.workOrders[index].status,
        };
        state.workOrders[index] = {
          ...state.workOrders[index],
          ...mappedUpdates,
        };
      }
    },
    DELETE_WORK_ORDER(state, workOrderId) {
      state.workOrders = state.workOrders.filter(
        (wo) => wo._id !== workOrderId
      );
    },
    UPDATE_KANBAN(state, { kanbanId, updates }) {
      state.kanbans = state.kanbans.map((kanban) =>
        kanban._id === kanbanId ? { ...kanban, ...updates } : kanban
      );
    },
    SET_BULK_IMPORT_STATUS(state, status) {
      state.bulkImportStatus = status;
    },
  },

  actions: {
    // Fetch kanban details
    async fetchKanbanDetails({ commit }, kanbanId) {
      try {
        console.log(`🔍 Fetching details for kanban ${kanbanId}`);
        const response = await api.get(
          `/kanban/list-kanban?id=${kanbanId}`,
          "?"
        );

        if (response?.data?.data?.[0]) {
          const kanbanDetails = response.data.data[0];
          console.log(
            `📥 Received details for kanban ${kanbanId}:`,
            kanbanDetails
          );

          commit("UPDATE_KANBAN", {
            kanbanId,
            updates: {
              last_check_dt: kanbanDetails.last_check_dt,
              next_check_dt: kanbanDetails.next_check_dt,
            },
          });

          return kanbanDetails;
        }
      } catch (error) {
        console.error(
          `❌ Error fetching details for kanban ${kanbanId}:`,
          error
        );
      }
    },

    // Fetch all kanbans and work orders
    async fetchWorkOrders({ commit, state, dispatch }) {
      console.log("🚀 Starting fetchWorkOrders");
      console.log("📍 Current location:", state.filters.location);

      commit("SET_LOADING", true);
      try {
        // First fetch kanbans for the selected station
        if (!state.filters.location.station_id) {
          console.warn("No station selected");
          return;
        }

        console.log(
          `🔍 Fetching kanbans for station: ${state.filters.location.station_id}`
        );
        const kanbanResponse = await api.get(
          `/kanban/list-kanban?station_id=${state.filters.location.station_id}`,
          "?"
        );

        console.log("📥 Kanban API Response:", kanbanResponse.data);

        if (!kanbanResponse?.data?.data) {
          throw new Error("Failed to fetch kanbans");
        }

        const kanbans = kanbanResponse.data.data;
        console.log(`✅ Found ${kanbans.length} kanbans:`, kanbans);
        commit("SET_KANBANS", kanbans);

        // Fetch detailed information for each kanban
        console.log("🔍 Fetching detailed information for each kanban");
        await Promise.all(
          kanbans.map((kanban) => dispatch("fetchKanbanDetails", kanban._id))
        );

        // Then fetch work orders
        console.log("🔍 Fetching work orders");
        const workOrderResponse = await api.get("/kanban/list-work-order", "?");
        console.log("📥 Work Order API Response:", workOrderResponse.data);

        const workOrders = workOrderResponse?.data?.data || [];
        console.log(`📋 Raw work orders (${workOrders.length}):`, workOrders);

        // Match work orders with kanban details
        const formattedWorkOrders = workOrders
          .filter((workOrder) => {
            // Find matching kanban
            const kanban = kanbans.find((k) => k._id === workOrder.kanban_id);
            // Only include work orders for kanbans in the selected station
            const keep =
              kanban && kanban.station_id === state.filters.location.station_id;
            console.log(
              `🔍 Filtering work order ${workOrder._id}: keep = ${keep}`
            );
            return keep;
          })
          .map((workOrder) => {
            console.log(`🔄 Processing work order: ${workOrder._id}`, {
              user_id: workOrder.user_id,
              formatted_assignedTo: workOrder.user_id || null,
            });
            const kanban = state.kanbans.find(
              (k) => k._id === workOrder.kanban_id
            );
            console.log("📎 Matched kanban:", kanban);

            const formatted = {
              _id: workOrder._id,
              date: workOrder.work_dt,
              kanbanId: workOrder.kanban_id,
              kanbanNo: kanban?.kanban_nm,
              machineName: kanban?.machine_nm,
              machineId: kanban?.machine_id,
              period: kanban?.period,
              status: workOrder.status || "PLAN",
              assignedTo: workOrder.user_id || null,
              itemcheckIds: kanban?.itemcheck_id || [],
              station_id: kanban?.station_id,
              last_check_dt: kanban?.last_check_dt || null,
              next_check_dt: kanban?.next_check_dt || null,
            };
            console.log("✨ Formatted work order:", formatted);
            return formatted;
          });
        console.log(
          `✅ Final formatted work orders (${formattedWorkOrders.length}):`,
          formattedWorkOrders
        );
        commit("SET_WORK_ORDERS", formattedWorkOrders);
      } catch (error) {
        console.error("Error fetching work orders:", error);
        commit("SET_ERROR", error.message);
        toast.error("Failed to fetch work orders");
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Add new work order
    async addWorkOrder({ commit, state }, workOrderData) {
      console.log("🚀 Starting addWorkOrder");
      console.log("📝 Work order data:", workOrderData);

      commit("SET_LOADING", true);
      try {
        // Ensure we have kanban data
        const kanban = state.kanbans.find(
          (k) => k._id === workOrderData.kanban_id
        );
        console.log("📎 Found kanban:", kanban);

        if (!kanban) {
          throw new Error("Selected kanban not found");
        }

        // Transform the data to match backend expectations
        const enrichedData = {
          kanban_id: workOrderData.kanban_id,
          work_dt: new Date(
            workOrderData.date.split("-").reverse().join("-")
          ).toISOString(),
          status: "PLAN",
          user_id: workOrderData.user_id || null,
        };

        const response = await api.post("/kanban/add-work-order", enrichedData);
        console.log("📥 API Response:", response.data);

        if (response?.data?.status === 200) {
          // Add the new work order to local state with complete information
          const newWorkOrder = {
            _id: response.data.data._id,
            date: workOrderData.date,
            kanbanId: kanban._id,
            kanbanNo: kanban.kanban_nm,
            machineName: kanban.machine_nm,
            machineId: kanban.machine_id,
            period: kanban.period,
            status: "PLAN",
            assignedTo: workOrderData.user_id || null,
            station_id: kanban.station_id,
          };

          commit("ADD_WORK_ORDER", newWorkOrder);
          toast.success("Work order created successfully");
          return true;
        }
        throw new Error(
          response.data?.message || "Failed to create work order"
        );
      } catch (error) {
        console.error("Error adding work order:", error);
        toast.error(error.message);
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Update work order (assign/edit)
    async updateWorkOrder({ commit, dispatch }, { workOrderId, updates }) {
      try {
        console.log("Updating work order:", { workOrderId, updates });

        // Prepare API updates
        const apiUpdates = {
          id: workOrderId,
          data: updates.data || {},
          ...(updates.date && { date: updates.date }),
          ...(updates.status && { status: updates.status }),
        };

        console.log("Prepared API updates:", apiUpdates);

        // commit("SET_LOADING", true);
        const response = await api.put(
          "/kanban/edit-work-order",
          workOrderId,
          apiUpdates
        );

        console.log("API Response:", response.data);

        if (response?.data?.status === 200) {
          // Update local state with consistent mapping
          const localUpdates = {
            ...updates,
            date: updates.date || updates.work_dt,
            assignedTo: update.data?.user_id,
            status: updates.status,
          };

          console.log("Updating local state with:", localUpdates);

          commit("UPDATE_WORK_ORDER", {
            workOrderId,
            updates: {
              ...updates,
              updates: localUpdates,
            },
          });

          // Refresh work orders to ensure consistency
          await dispatch("fetchWorkOrders");

          toast.success("Work order updated successfully");
          return true;
        }
        throw new Error(
          response.data?.message || "Failed to update work order"
        );
      } catch (error) {
        console.error("Error updating work order:", error);
        toast.error(error.message);
        return false;
      } finally {
        commit("RESET_LOADING");
      }
    },

    // Delete work order
    async deleteWorkOrder({ commit }, workOrderId) {
      commit("SET_LOADING", true);
      try {
        const response = await api.delete(
          "/kanban/delete-work-order",
          workOrderId
        );

        if (response?.data?.status === 200) {
          commit("DELETE_WORK_ORDER", workOrderId);
          toast.success("Work order deleted successfully");
          return true;
        }
        throw new Error(
          response.data?.message || "Failed to delete work order"
        );
      } catch (error) {
        console.error("Error deleting work order:", error);
        toast.error("Failed to delete work order");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Bulk import work orders
    async bulkAddWorkOrders({ commit, dispatch }, schedules) {
      commit("SET_LOADING", true);

      try {
        const total = schedules.length;
        let processed = 0;
        let successful = 0;
        let failed = 0;

        // Process schedules sequentially
        for (const schedule of schedules) {
          try {
            const response = await api.post("/kanban/add-work-order", schedule);

            if (response?.data?.status === 200) {
              // If successful, add to local state
              const kanban = this.state.schedule.kanbans.find(
                (k) => k._id === schedule.kanban_id
              );

              if (kanban) {
                const newWorkOrder = {
                  _id: response.data.data._id,
                  date: schedule.date,
                  kanbanId: schedule.kanban_id,
                  kanbanNo: kanban.kanban_nm,
                  machineName: kanban.machine_nm,
                  machineId: kanban.machine_id,
                  period: kanban.period,
                  status: "PLAN",
                  assignedTo: schedule.user_id || null,
                  station_id: kanban.station_id,
                };

                commit("ADD_WORK_ORDER", newWorkOrder);
                successful++;
              }
            } else {
              failed++;
            }
          } catch (error) {
            console.error("Failed to import schedule:", schedule, error);
            failed++;
          }

          processed++;

          // Update progress
          commit("SET_BULK_IMPORT_STATUS", {
            total,
            processed,
            successful,
            failed,
          });
        }

        // Refresh work orders after bulk import to ensure consistency
        await dispatch("fetchWorkOrders");

        return {
          successful,
          failed,
          total,
        };
      } finally {
        commit("SET_LOADING", false);
        // Reset bulk import status
        commit("SET_BULK_IMPORT_STATUS", {
          total: 0,
          processed: 0,
          successful: 0,
          failed: 0,
        });
      }
    },
  },

  getters: {
    allWorkOrders: (state) => state.workOrders,
    getLoading: (state) => state.loading,
    getError: (state) => state.error,

    // Get filtered work orders based on current filters
    filteredWorkOrders: (state) => {
      console.log("🔍 Getting filtered work orders");
      console.log("Current filters:", state.filters);
      console.log("Available work orders:", state.workOrders);

      if (!Array.isArray(state.workOrders)) {
        console.warn("⚠️ Work orders is not an array");
        return [];
      }

      return state.workOrders.filter((workOrder) => {
        // Location filtering
        const locationMatch =
          !state.filters.location.station_id ||
          workOrder.station_id === state.filters.location.station_id;

        // Team member filtering
        const teamMemberMatch =
          state.filters.teamMember === "ALL" ||
          workOrder.assignedTo === state.filters.teamMember;

        // Period filtering
        const periodMatch =
          state.filters.period === "ALL" ||
          workOrder.period === state.filters.period;

        // Status filtering
        const statusMatch =
          state.filters.status === "ALL" ||
          workOrder.status === state.filters.status;

        return locationMatch && teamMemberMatch && periodMatch && statusMatch;
      });
    },

    selectedWorkOrder: (state) => {
      console.log(
        "Getting selected work order from state:",
        state.selectedWorkOrder
      );
      return state.selectedWorkOrder;
    },

    kanbansByPeriod: (state) => (period) => {
      if (!state.kanbans) return [];
      return period === "ALL"
        ? state.kanbans
        : state.kanbans.filter((k) => k.period === period);
    },

    // Get unassigned work orders
    unassignedWorkOrders: (state) => {
      return state.workOrders.filter((wo) => !wo.assignedTo);
    },

    // Get work orders by team member
    getWorkOrdersByTeamMember: (state) => (teamMemberId) => {
      return state.workOrders.filter((wo) => wo.assignedTo === teamMemberId);
    },

    // Get work orders by status
    getWorkOrdersByStatus: (state) => (status) => {
      return state.workOrders.filter((wo) => wo.status === status);
    },

    // Get all kanbans for the selected station
    getStationKanbans: (state) => {
      return state.kanbans;
    },

    // Get a specific kanban by ID
    getKanbanById: (state) => (kanbanId) => {
      return state.kanbans.find((k) => k._id === kanbanId);
    },

    getBulkImportStatus: (state) => state.bulkImportStatus,
  },
};
