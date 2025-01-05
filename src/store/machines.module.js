import { toast } from "vue-sonner";
import api from "@/apis/CommonAPI";

// API endpoints
const API_PREFIX = "/asset";
const ENDPOINTS = {
  LIST: `${API_PREFIX}/list-asset`,
  CREATE: `${API_PREFIX}/new-asset`,
  UPDATE: `${API_PREFIX}/edit-asset`,
  DELETE: `${API_PREFIX}/delete-asset`,
};

export default {
  namespaced: true,

  state: {
    machines: [],
    parts: {}, // Object to store parts by machine ID
    selectedMachine: null,
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
    SET_MACHINES(state, machines) {
      state.machines = machines;
    },
    SET_PARTS(state, { machineId, parts }) {
      state.parts = {
        ...state.parts,
        [machineId]: parts.filter((part) => !part.deleted_by),
      };
    },
    SET_SELECTED_MACHINE(state, machine) {
      state.selectedMachine = machine;
    },
    ADD_MACHINE(state, newMachine) {
      const machineToAdd = {
        _id: newMachine._id,
        machine_nm: newMachine.machine_nm,
        part_nm: newMachine.part_nm,
      };
      console.log("Adding machine to state:", machineToAdd);
      state.machines = [machineToAdd, ...state.machines];
    },
    ADD_PART(state, { machineId, part }) {
      if (state.parts[machineId]) {
        state.parts[machineId].push(part);
      } else {
        state.parts[machineId] = [part];
      }
    },
    UPDATE_MACHINE_NAME(state, { machineId, machine_nm }) {
      // Update machine_nm for all rows with this machineId
      state.machines = state.machines.map((machine) =>
        machine._id === machineId ? { ...machine, machine_nm } : machine
      );
    },
    UPDATE_PART(state, { partId, part_nm }) {
      // Update in machines array
      state.machines = state.machines.map((machine) =>
        machine.part_id === partId ? { ...machine, part_nm } : machine
      );

      // Update in parts object
      Object.keys(state.parts).forEach((machineId) => {
        state.parts[machineId] = state.parts[machineId].map((part) =>
          part._id === partId ? { ...part, part_nm } : part
        );
      });
    },
    DELETE_MACHINE(state, machineId) {
      console.log("In DELETE_MACHINE mutation with ID:", machineId);
      if (!machineId) {
        console.error("No machineId provided to DELETE_MACHINE mutation");
        return;
      }

      const initialCount = state.machines.length;
      state.machines = state.machines.filter((machine) => {
        const keepMachine = machine._id !== machineId;
        console.log("Comparing machine:", {
          machineId: machineId,
          currentMachine: machine._id,
          keeping: keepMachine,
        });
        return keepMachine;
      });
      console.log(`Deleted ${initialCount - state.machines.length} machines`);
    },
    DELETE_PART(state, partId) {
      // Remove from parts object
      Object.keys(state.parts).forEach((machineId) => {
        if (state.parts[machineId]) {
          state.parts[machineId] = state.parts[machineId].filter(
            (part) => part._id !== partId
          );
        }
      });

      // Remove from machines array where part_id matches
      state.machines = state.machines.filter(
        (machine) => !machine.part_id || machine.part_id !== partId
      );
    },
    CLEAR_MACHINES(state) {
      state.machines = [];
      state.selectedMachine = null;
      state.error = null;
    },
  },

  actions: {
    // Fetch machines list
    async fetchMachinesByStation({ commit, dispatch }, stationId) {
      commit("SET_LOADING", true);
      try {
        const url = `${ENDPOINTS.LIST}?collection=machine&parent_id=${stationId}`;
        const response = await api.get(url, "?", (response, error) => {
          if (error) {
            throw error;
          }
          return response;
        });
        console.log("API response: ", response);

        if (response?.data?.status === 200) {
          // Filter out soft-deleted items (items with deleted_by not null)
          const activeMachines = (response.data.data || []).filter(
            (item) => !item.deleted_by
          );

          commit("SET_MACHINES", activeMachines);

          // Fetch parts sequentially instead of concurrently
          for (const machine of activeMachines) {
            try {
              // Add a small delay between requests
              await new Promise((resolve) => setTimeout(resolve, 100));
              await dispatch("fetchPartsByMachine", machine._id);
            } catch (error) {
              console.error(
                `Error fetching parts for machine ${machine._id}:`,
                error
              );
              // Continue with next machine even if one fails
              continue;
            }
          }

          return true;
        } else {
          throw new Error(
            response?.data?.message || "Failed to fetch machines"
          );
        }
      } catch (error) {
        console.error("Error fetching machines:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to fetch machines");
        commit("SET_MACHINES", []);
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Fetch parts for a specific machine
    async fetchPartsByMachine({ commit }, machineId) {
      try {
        // Add retry logic
        let retries = 3;
        let lastError = null;

        while (retries > 0) {
          try {
            const url = `${ENDPOINTS.LIST}?collection=part&parent_id=${machineId}`;
            const response = await api.get(url, "?", (response, error) => {
              if (error) {
                throw error;
              }
              return response;
            });
            console.log("API response: ", response);

            if (response?.data?.status === 200) {
              commit("SET_PARTS", {
                machineId,
                parts: response.data.data || [],
              });
              return true;
            } else {
              throw new Error(
                response?.data?.message || "Failed to fetch parts"
              );
            }
          } catch (error) {
            lastError = error;
            retries--;
            if (retries > 0) {
              // Wait before retrying (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, (3 - retries) * 1000)
              );
              continue;
            }
            throw error;
          }
        }
        throw lastError;
      } catch (error) {
        console.error(`Error fetching parts for machine ${machineId} :`, error);
        commit("SET_PARTS", { machineId, parts: [] });
        return false;
      }
    },

    // Create new machine
    async createMachine({ commit }, machineData) {
      console.log("machineData received in store:", machineData);
      commit("SET_LOADING", true);
      try {
        // Create machine first
        const machineResult = await api.post(ENDPOINTS.CREATE, {
          collection: "machine",
          name: machineData.machine_nm,
          parent_id: machineData.station_id,
        });

        if (machineResult?.data?.status === 200) {
          // Create associated part
          const partResult = await api.post(ENDPOINTS.CREATE, {
            collection: "part",
            name: machineData.part_nm,
            parent_id: machineResult.data.data.result.insertedId,
          });

          if (partResult?.data?.status === 200) {
            const newMachine = {
              _id: machineResult.data.data.result.insertedId,
              machine_nm: machineData.machine_nm,
              part_nm: machineData.part_nm,
              station_id: machineData.station_id,
              part_id: partResult.data.data.result.insertedId,
            };
            console.log("New machine being added to state:", newMachine);
            commit("ADD_MACHINE", newMachine);
            toast.success("Machine created successfully");
          }
          return true;
        } else {
          throw new Error(
            response?.data?.message || "Failed to create machine"
          );
        }
      } catch (error) {
        console.error("Error creating machine:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to create machine");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Create new part
    async createPart({ commit, dispatch }, partData) {
      commit("SET_LOADING", true);
      try {
        const response = await api.post(ENDPOINTS.CREATE, {
          collection: "part",
          name: partData.part_nm,
          parent_id: partData.machine_id,
        });
        console.log("API response:", response);

        if (response?.data?.status === 200) {
          const newPartId = response.data.data.result.insertedId;

          // Add the new part to state
          commit("ADD_PART", {
            machineId: partData.machine_id,
            part: {
              _id: newPartId,
              part_nm: partData.part_nm,
              machine_id: partData.machine_id,
              created_dt: new Date().toISOString(),
            },
          });

          // Refresh the machine's parts
          await dispatch("fetchPartsByMachine", partData.machine_id);
          toast.success("Part added successfully");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error creating part:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to create part");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Update existing machine
    async updateMachine({ commit }, { machineId, machineData }) {
      commit("SET_LOADING", true);
      try {
        const response = await api.put(ENDPOINTS.UPDATE, machineId, {
          collection: "machine",
          _id: machineId,
          name: machineData.machine_nm,
        });
        console.log("Update Machine API response:", response);

        if (response?.data?.status === 200) {
          // Update all instances of this machine in the state
          commit("UPDATE_MACHINE_NAME", {
            machineId,
            machine_nm: machineData.machine_nm,
          });
          toast.success("Machine name updated successfully");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating machine:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to update machine");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updatePart({ commit }, { partId, partData }) {
      commit("SET_LOADING", true);
      try {
        const response = await api.put(ENDPOINTS.UPDATE, partId, {
          collection: "part",
          _id: partId,
          name: partData.part_nm,
        });

        if (response?.data?.status === 200) {
          commit("UPDATE_PART", {
            partId,
            part_nm: partData.part_nm,
          });
          toast.success("Part updated successfully");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating part:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to update part");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Delete machine
    async deleteMachine({ commit }, machineId) {
      commit("SET_LOADING", true);
      try {
        // Get machine's parts first
        const parts = await api.get(
          `${ENDPOINTS.LIST}?collection=part&parent_id=${machineId}`,
          "?"
        );

        // Delete machine
        const machineResponse = await api.delete(ENDPOINTS.DELETE, machineId);
        console.log("Delete Machine API response: ", machineResponse);

        // Delete associated parts and their itemchecks
        if (parts?.data?.data) {
          for (const part of parts.data.data) {
            await api.delete(ENDPOINTS.DELETE, part._id);
            // Delete itemchecks for this part
            const itemchecks = await api.get(
              `/itemcheck/list-itemcheck?part_id=${part._id}`,
              "?"
            );
            if (itemchecks?.data?.data) {
              for (const check of itemchecks.data.data) {
                await api.delete("/itemcheck/delete-itemcheck", check._id);
              }
            }
          }
        }

        if (machineResponse?.data?.status === 200) {
          console.log("Delete successful, committing ID to state:", machineId);
          commit("DELETE_MACHINE", machineId);
          toast.success("Machine deleted successfully");
          return true;
        } else {
          throw new Error(response?.data?.message || "Error deleting machine");
        }
      } catch (error) {
        console.error("Error deleting machine:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to delete machine");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async deletePart({ commit, dispatch }, partId) {
      commit("SET_LOADING", true);
      try {
        console.log("Deleting part with ID:", partId);
        const response = await api.put(ENDPOINTS.DELETE, partId, {
          collection: "part",
          _id: partId,
        });

        console.log("Delete Part API response:", response);

        if (response?.data?.status === 200) {
          commit("DELETE_PART", partId);

          if (response.data.data?.machine_id) {
            await dispatch(
              "fetchPartsByMachine",
              response.data.data.machine_id
            );
          }
          toast.success("Part deleted successfully");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error deleting part:", error);
        commit("SET_ERROR", error.message);
        toast.error(error.message || "Failed to delete part");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Select a machine
    selectMachine({ commit }, machine) {
      commit("SET_SELECTED_MACHINE", machine);
    },

    // Clear machine state
    clearMachines({ commit }) {
      commit("CLEAR_MACHINES");
    },
  },
  getters: {
    allMachines: (state) => state.machines,
    machinesParts: (state) => state.parts,
    getMachineParts: (state) => (machineId) => state.parts[machineId] || [],
    selectedMachine: (state) => state.selectedMachine,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    getError: (state) => state.error,

    // New getter to combine machines and their parts for the table
    machinesWithParts: (state) => {
      const machinesMap = new Map();

      state.machines.forEach((machine) => {
        const machineParts = state.parts[machine._id] || [];

        // Only add entries for machines that have parts
        if (machineParts.length > 0) {
          machineParts.forEach((part) => {
            if (!part.deleted_by) {
              // Only include non-deleted parts
              const key = `${machine._id}_${part._id}`;
              machinesMap.set(key, {
                _id: machine._id,
                machine_nm: machine.machine_nm,
                part_nm: part.part_nm,
                part_id: part._id,
                station_id: machine.station_id,
              });
            }
          });
        }
      });
      return Array.from(machinesMap.values());
    },

    uniqueMachines: (state) => {
      return _.uniqBy(state.machines, "machine_nm").map((machine) => ({
        _id: machine._id,
        machine_nm: machine.machine_nm,
      }));
    },
  },
};
