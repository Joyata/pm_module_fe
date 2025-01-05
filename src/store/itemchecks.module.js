import { toast } from "vue-sonner";
import api from "@/apis/CommonAPI";

// API endpoints
const API_PREFIX = "/itemcheck";
const ENDPOINTS = {
  LIST: `${API_PREFIX}/list-itemcheck`,
  CREATE: `${API_PREFIX}/add-itemcheck`,
  UPDATE: `${API_PREFIX}/edit-itemcheck`,
  DELETE: `${API_PREFIX}/delete-itemcheck`,
  TOOLS: `${API_PREFIX}/list-tool`,
  SPARE_PARTS: `${API_PREFIX}/list-sparepart`,
};

export default {
  namespaced: true,

  state: {
    itemchecks: [],
    selectedItemCheck: null,
    tools: [],
    spareParts: [],
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
    SET_ITEMCHECKS(state, itemchecks) {
      state.itemchecks = itemchecks;
    },
    SET_TOOLS(state, tools) {
      state.tools = tools;
    },
    SET_SPARE_PARTS(state, spareParts) {
      state.spareParts = spareParts;
    },
    SET_SELECTED_ITEMCHECK(state, itemcheck) {
      state.selectedItemcheck = itemcheck;
    },
    ADD_ITEMCHECK(state, itemcheck) {
      state.itemchecks.unshift(itemcheck);
    },
    UPDATE_ITEMCHECK(state, updatedItemcheck) {
      state.itemchecks = state.itemchecks.map((item) =>
        item._id === updatedItemcheck._id ? updatedItemcheck : item
      );
    },
    DELETE_ITEMCHECK(state, itemcheckId) {
      state.itemchecks = state.itemchecks.filter(
        (item) => item._id !== itemcheckId
      );
    },
    CLEAR_ITEMCHECKS(state) {
      state.itemchecks = [];
      state.selectedItemcheck = null;
      state.error = null;
    },
  },

  actions: {
    async fetchItemchecksByPart({ commit }, partId) {
      commit("SET_LOADING", true);
      try {
        const response = await api.get(
          `${ENDPOINTS.LIST}?part_id=${partId}`,
          "?"
        );

        if (response?.data?.status === 200) {
          const activeItemchecks = (response.data.data || []).filter(
            (item) => !item.deleted_by
          );
          commit("SET_ITEMCHECKS", activeItemchecks);
          return true;
        } else {
          throw new Error(
            response?.data?.message || "Failed to fetch itemchecks"
          );
        }
      } catch (error) {
        console.error("Error fetching itemchecks:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to fetch itemchecks");
        commit("SET_ITEMCHECKS", []);
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async fetchTools({ commit }, stationId) {
      try {
        const response = await api.get(
          `${ENDPOINTS.TOOLS}?station_id=${stationId}`,
          "?"
        );

        if (response?.data?.status === 200) {
          commit("SET_TOOLS", response.data.data || []);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error fetching tools:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to fetch tools");
        return false;
      }
    },

    async fetchSpareParts({ commit }, stationId) {
      try {
        const response = await api.get(
          `${ENDPOINTS.SPARE_PARTS}?station_id=${stationId}`,
          "?"
        );

        if (response?.data?.status === 200) {
          commit("SET_SPARE_PARTS", response.data.data || []);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error fetching spare parts:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to fetch spare parts");
        return false;
      }
    },

    async createItemcheck({ commit }, itemcheckData) {
      commit("SET_LOADING", true);
      try {
        const response = await api.post(ENDPOINTS.CREATE, itemcheckData);

        if (response?.data?.status === 200) {
          const newItemcheck = {
            _id: response.data.data.result_item.insertedId,
            ...itemcheckData,
          };
          commit("ADD_ITEMCHECK", newItemcheck);
          toast.success("Itemcheck created successfully");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error creating itemcheck:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to create itemcheck");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateItemcheck({ commit }, { itemcheckId, itemcheckData }) {
      commit("SET_LOADING", true);
      try {
        const response = await api.put(
          ENDPOINTS.UPDATE,
          itemcheckId,
          itemcheckData
        );

        if (response?.data?.status === 200) {
          commit("UPDATE_ITEMCHECK", {
            _id: itemcheckId,
            ...itemcheckData,
          });
          toast.success("Itemcheck updated successfully");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating itemcheck:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to update itemcheck");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async deleteItemcheck({ commit }, itemcheckId) {
      commit("SET_LOADING", true);
      try {
        // Get user from localStorage
        const user = JSON.parse(localStorage.getItem("user"));

        console.log("Attempting to delete itemcheck:", {
          id: itemcheckId,
          user_id: user?._id,
        });

        const response = await api.delete(ENDPOINTS.DELETE, itemcheckId);
        console.log("Delete Itemcheck API response: ", response);

        if (response?.data?.status === 200) {
          console.log(
            "Delete successful, committing ID to state:",
            itemcheckId
          );
          commit("DELETE_ITEMCHECK", itemcheckId);
          toast.success("Itemcheck deleted successfully");
          return true;
        } else {
          throw new Error(
            response?.data?.message || "Error deleting itemcheck"
          );
        }
      } catch (error) {
        console.error("Error deleting itemcheck:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to delete itemcheck");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    selectItemcheck({ commit }, itemcheck) {
      commit("SET_SELECTED_ITEMCHECK", itemcheck);
    },

    clearItemchecks({ commit }) {
      commit("CLEAR_ITEMCHECKS");
    },
  },

  getters: {
    allItemchecks: (state) => state.itemchecks,
    selectedItemcheck: (state) => state.selectedItemcheck,
    allTools: (state) => state.tools,
    allSpareParts: (state) => state.spareParts,
    isLoading: (state) => state.loading,
    hasError: (state) => state.error,
    getError: (state) => state.error,
  },
};
