import { toast } from "vue-sonner";
import api from "@/apis/CommonAPI";

// API endpoints
const API_PREFIX = "/itemcheck";
const ENDPOINTS = {
  LIST: `${API_PREFIX}/list-tool`,
  CREATE: `${API_PREFIX}/add-tool`,
  UPDATE: `${API_PREFIX}/edit-tool`,
  DELETE: `${API_PREFIX}/delete-tool`,
};

//Helper function to calculate status based on quantity
const calculateStatus = (quantity) => {
  const parsedQuantity = parseInt(quantity);
  if (parsedQuantity === 0) return "Out of Stock";
  if (parsedQuantity <= 5) return "Low Stock";
  return "In Stock";
};

export default {
  namespaced: true,

  state: {
    tools: [],
    selectedTool: null,
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
    SET_TOOLS(state, tools) {
      // Initialize tools with calculated status
      state.tools = tools.map((tool) => ({
        ...tool,
        status: calculateStatus(tool.quantity),
      }));
    },
    SET_SELECTED_TOOL(state, tool) {
      state.selectedTool = tool
        ? {
            ...tool,
            status: calculateStatus(tool.quantity),
          }
        : null;
    },
    ADD_TOOL(state, newTool) {
      // Construct the tool object with the data we have
      const toolToAdd = {
        _id: newTool._id,
        tool_nm: newTool.tool_nm,
        quantity: parseInt(newTool.quantity),
        station_id: newTool.station_id,
      };
      console.log("Adding tool to state:", toolToAdd);
      state.tools = [toolToAdd, ...state.tools];
    },
    UPDATE_TOOL(state, updatedTool) {
      const index = state.tools.findIndex(
        (tool) => tool._id === updatedTool._id
      );
      if (index !== -1) {
        // Update tool and recalculate status
        const newTool = {
          ...updatedTool,
          status: calculateStatus(updatedTool.quantity),
        };
        state.tools.splice(index, 1, newTool);
      }
    },
    UPDATE_TOOL_QUANTITY(state, { toolId, quantity }) {
      const index = state.tools.findIndex((tool) => tool._id === toolId);
      if (index !== -1) {
        const updatedTool = {
          ...state.tools[index],
          quantity: quantity,
          status: calculateStatus(quantity),
        };
        state.tools.splice(index, 1, updatedTool);
      }
    },
    DELETE_TOOL(state, toolId) {
      console.log("In DELETE_TOOL mutation with ID:", toolId);
      if (!toolId) {
        console.error("No toolId provided to DELETE_TOOL mutation");
        return;
      }

      const initialCount = state.tools.length;
      state.tools = state.tools.filter((tool) => {
        const keepTool = tool._id !== toolId;
        console.log("Comparing tool:", {
          toolId: toolId,
          currentTool: tool._id,
          keeping: keepTool,
        });
        return keepTool;
      });
      console.log(`Deleted ${initialCount - state.tools.length} tools`);
    },
    CLEAR_TOOLS(state) {
      state.tools = [];
      state.selectedTool = null;
      state.error = null;
    },
  },

  actions: {
    // Fetch tools list
    async fetchTools({ commit }, params = {}) {
      commit("SET_LOADING", true);
      try {
        const url = `${ENDPOINTS.LIST}?station_id=${params.station_id}`;
        const response = await api.get(url, "?", (response, error) => {
          if (error) {
            throw error;
          }
          return response;
        });
        console.log("API response: ", response);

        if (response?.data?.status === 200) {
          // Filter out soft-deleted items (items with deleted_by not null)
          const activeTools = (response.data.data || []).filter(
            (item) => !item.deleted_by
          );

          commit("SET_TOOLS", activeTools);
        } else {
          throw new Error(response?.data?.message || "Failed to fetch tools");
        }
      } catch (error) {
        console.error("Error fetching tools:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to fetch tools");
        commit("SET_TOOLS", []);
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Create new tool
    async createTool({ commit }, toolData) {
      console.log("toolData received in store:", toolData);
      commit("SET_LOADING", true);
      try {
        const dataToSend = {
          tool_name: toolData.tool_nm,
          quantity: parseInt(toolData.quantity),
          station_id: toolData.station_id,
        };

        const response = await api.post(
          ENDPOINTS.CREATE,
          dataToSend,
          (response, error) => {
            if (error) {
              throw error;
            }
            return response;
          }
        );
        console.log("Create Tool API response: ", response);

        if (response?.data?.status === 200) {
          // Construct the new tool object combining the response and the original data
          const newTool = {
            _id: response.data.data.insertedId,
            tool_nm: toolData.tool_nm,
            quantity: parseInt(toolData.quantity),
            station_id: toolData.station_id,
          };
          console.log("New tool being added to state:", newTool);
          commit("ADD_TOOL", newTool);
          toast.success("Tool added successfully");
          return true;
        } else {
          throw new Error(response?.data?.message || "Failed to create tool");
        }
      } catch (error) {
        console.error("Error creating tool:", error);
        commit("SET_ERROR", error);
        toast.error(error.message || "Failed to create tool");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Update existing tool
    async updateTool({ commit, state }, { toolId, toolData }) {
      commit("SET_LOADING", true);
      try {
        const response = await api.put(ENDPOINTS.UPDATE, toolId, {
          tool_nm: toolData.tool_nm,
          quantity: parseInt(toolData.quantity),
        });
        console.log("Update Tool API response: ", response);

        if (response?.data?.status === 200) {
          const originalTool = state.tools.find((t) => t._id === toolId);
          const updatedTool = {
            _id: toolId,
            tool_nm: toolData.tool_nm,
            quantity: parseInt(toolData.quantity),
            station_id: originalTool.station_id,
          };

          commit("UPDATE_TOOL", updatedTool);
          toast.success("Tool updated successfully");
          return true;
        } else {
          throw new Error(response?.data?.message || "Error updating tool");
        }
      } catch (error) {
        console.error("Error updating tool:", error);
        commit("SET_ERROR", error);
        toast.error(error.message || "Failed to update tool");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Delete tool
    async deleteTool({ commit }, toolId) {
      commit("SET_LOADING", true);
      try {
        const response = await api.delete(ENDPOINTS.DELETE, toolId);
        console.log("Delete Tool API response: ", response);

        if (response?.data?.status === 200) {
          console.log("Delete successful, committing ID to state:", toolId);
          commit("DELETE_TOOL", toolId);
          toast.success("Tool deleted successfully");
          return true;
        } else {
          throw new Error(response?.data?.message || "Error deleting tool");
        }
      } catch (error) {
        console.error("Error deleting tool:", error);
        toast.error(error.message || "Failed to delete tool");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Select a tool
    selectTool({ commit }, tool) {
      commit("SET_SELECTED_TOOL", tool);
    },

    updateToolQuantity({ commit }, { toolId, quantity }) {
      commit("UPDATE_TOOL_QUANTITY", { toolId, quantity });
    },

    // Clear tools state
    clearTools({ commit }) {
      commit("CLEAR_TOOLS");
    },
  },

  getters: {
    allTools: (state) => state.tools,
    selectedTool: (state) => state.selectedTool,
    isLoading: (state) => state.loading,
    getStatus: () => (quantity) => calculateStatus(quantity),
    hasError: (state) => !!state.error,
    getError: (state) => state.error,
  },
};
