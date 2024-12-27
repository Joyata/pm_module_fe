import { toast } from "vue-sonner";
import api from "@/apis/CommonAPI";

// API endpoints
const API_PREFIX = "/itemcheck";
const ENDPOINTS = {
  LIST: `${API_PREFIX}/list-sparepart`,
  CREATE: `${API_PREFIX}/add-sparepart`,
  UPDATE: `${API_PREFIX}/edit-sparepart`,
  DELETE: `${API_PREFIX}/delete-sparepart`,
};

// Helper function to calculate status based on quantity
const calculateStatus = (quantity) => {
  const parsedQuantity = parseInt(quantity);
  if (parsedQuantity === 0) return "Out of Stock";
  if (parsedQuantity <= 5) return "Low Stock";
  return "In Stock";
};

export default {
  namespaced: true,

  state: {
    spareparts: [],
    selectedSparepart: null,
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
    SET_SPAREPARTS(state, spareparts) {
      // Initialize spareparts with calculated status
      state.spareparts = spareparts.map((sparepart) => ({
        ...sparepart,
        status: calculateStatus(sparepart.quantity),
      }));
    },
    SET_SELECTED_SPAREPART(state, sparepart) {
      state.selectedSparepart = sparepart
        ? {
            ...sparepart,
            status: calculateStatus(sparepart.quantity),
          }
        : null;
    },
    ADD_SPAREPART(state, newSparepart) {
      // Construct the sparepart object with the data we have
      const sparepartToAdd = {
        _id: newSparepart._id,
        spare_part_nm: newSparepart.spare_part_nm,
        quantity: parseInt(newSparepart.quantity),
        unit: newSparepart.unit,
        station_id: newSparepart.station_id,
      };
      console.log("Adding sparepart to state:", sparepartToAdd);
      state.spareparts = [sparepartToAdd, ...state.spareparts];
    },
    UPDATE_SPAREPART(state, updatedSparepart) {
      const index = state.spareparts.findIndex(
        (sparepart) => sparepart._id === updatedSparepart._id
      );
      if (index !== -1) {
        // Update sparepart and recalculate status
        const newSparepart = {
          ...updatedSparepart,
          status: calculateStatus(updatedSparepart.quantity),
        };
        state.spareparts.splice(index, 1, newSparepart);
      }
    },
    UPDATE_SPAREPART_QUANTITY(state, { sparepartId, quantity }) {
      const index = state.spareparts.findIndex(
        (sparepart) => sparepart._id === sparepartId
      );
      if (index !== -1) {
        const updatedSparepart = {
          ...state.spareparts[index],
          quantity: quantity,
          status: calculateStatus(quantity),
        };
        state.spareparts.splice(index, 1, updatedSparepart);
      }
    },
    DELETE_SPAREPART(state, sparepartId) {
      console.log("In DELETE_SPAREPART mutation with ID:", sparepartId);
      if (!sparepartId) {
        console.error("No sparepartId provided to DELETE_SPAREPART mutation");
        return;
      }

      const initialCount = state.spareparts.length;
      state.spareparts = state.spareparts.filter((sparepart) => {
        const keepSparepart = sparepart._id !== sparepartId;
        console.log("Comparing sparepart:", {
          sparepartId: sparepartId,
          currentSparepart: sparepart._id,
          keeping: keepSparepart,
        });
        return keepSparepart;
      });
      console.log(
        `Deleted ${initialCount - state.spareparts.length} spareparts`
      );
    },
    CLEAR_SPAREPARTS(state) {
      state.spareparts = [];
      state.selectedSparepart = null;
      state.error = null;
    },
  },

  actions: {
    // Fetch spareparts list
    async fetchSpareparts({ commit }, params = {}) {
      commit("SET_LOADING", true);
      try {
        const url = `${ENDPOINTS.LIST}?station_id=${params.station_id}`;
        const response = await api.get(url, "?", (response, error) => {
          if (error) {
            throw error;
          }
          return response;
        });
        console.log("API response:", response);

        if (response?.data?.status === 200) {
          // Filter out soft-deleted items (items with deleted_by not null)
          const activeSpareparts = (response.data.data || []).filter(
            (item) => !item.deleted_by
          );

          commit("SET_SPAREPARTS", activeSpareparts);
        } else {
          throw new Error(
            response?.data?.message || "Failed to fetch spareparts"
          );
        }
      } catch (error) {
        console.log("Error fetching spareparts:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to fetch spareparts");
        commit("SET_SPAREPARTS", []);
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Create new sparepart
    async createSparepart({ commit }, sparepartData) {
      console.log("sparepartData received in store:", sparepartData);
      commit("SET_LOADING", true);
      try {
        const dataToSend = {
          spare_part_nm: sparepartData.spare_part_nm,
          quantity: parseInt(sparepartData.quantity),
          unit: sparepartData.unit,
          station_id: sparepartData.station_id,
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
        console.log("Create Sparepart API response: ", response);

        if (response?.data?.status === 200) {
          // Construct the new sparepart object combining the response and the original data
          const newSparepart = {
            _id: response.data.data.insertedId,
            spare_part_nm: sparepartData.spare_part_nm,
            quantity: parseInt(sparepartData.quantity),
            unit: sparepartData.unit,
            station_id: sparepartData.station_id,
          };
          console.log("New sparepart being added to state:", newSparepart);
          commit("ADD_SPAREPART", newSparepart);
          toast.success("Sparepart added successfully");
          return true;
        } else {
          throw new Error(
            response?.data?.message || "Failed to create sparepart"
          );
        }
      } catch (error) {
        console.error("Error creating sparepart:", error);
        commit("SET_ERROR", error);
        toast.error(error.message || "Failed to create sparepart");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Update existing sparepart
    async updateSparepart({ commit, state }, { sparepartId, sparepartData }) {
      commit("SET_LOADING", true);
      try {
        const response = await api.put(ENDPOINTS.UPDATE, sparepartId, {
          spare_part_nm: sparepartData.spare_part_nm,
          quantity: parseInt(sparepartData.quantity),
          unit: sparepartData.unit,
        });
        console.log("Update Sparepart API response: ", response);

        if (response?.data?.status === 200) {
          const originalSparepart = state.spareparts.find(
            (s) => s._id === sparepartId
          );
          const updatedSparepart = {
            _id: sparepartId,
            spare_part_nm: sparepartData.spare_part_nm,
            quantity: parseInt(sparepartData.quantity),
            unit: sparepartData.unit,
            station_id: originalSparepart?.station_id,
          };

          commit("UPDATE_SPAREPART", updatedSparepart);
          toast.success("Sparepart updated successfully");
          return true;
        } else {
          throw new Error(
            response?.data?.message || "Error updating sparepart"
          );
        }
      } catch (error) {
        console.error("Error updating sparepart:", error);
        commit("SET_ERROR", error);
        toast.error(error.message || "Failed to update sparepart");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Delete sparepart
    async deleteSparepart({ commit }, sparepartId) {
      commit("SET_LOADING", true);
      try {
        const response = await api.delete(ENDPOINTS.DELETE, sparepartId);
        console.log("Delete Sparepart API response: ", response);

        if (response?.data?.status === 200) {
          console.log(
            "Delete successful, committing ID to state:",
            sparepartId
          );
          commit("DELETE_SPAREPART", sparepartId);
          toast.success("Sparepart deleted successfully");
          return true;
        } else {
          throw new Error(
            response?.data?.message || "Error deleting sparepart"
          );
        }
      } catch (error) {
        console.error("Error deleting sparepart:", error);
        commit("SET_ERROR", error);
        toast.error(error.message || "Failed to delete sparepart");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Select a sparepart
    selectSparepart({ commit }, sparepart) {
      commit("SET_SELECTED_SPAREPART", sparepart);
    },
    updateSparepartQuantity({ commit }, { sparepartId, quantity }) {
      commit("UPDATE_SPAREPART_QUANTITY", { sparepartId, quantity });
    },

    // Clear tools state
    clearSpareparts({ commit }) {
      commit("CLEAR_SPAREPARTS");
    },
  },

  getters: {
    allSpareparts: (state) => state.spareparts,
    selectedSparepart: (state) => state.selectedSparepart,
    isLoading: (state) => state.loading,
    getStatus: () => (quantity) => calculateStatus(quantity),
    hasError: (state) => !!state.error,
    getError: (state) => state.error,
  },
};
