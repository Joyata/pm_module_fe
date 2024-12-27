import { toast } from "vue-sonner";
import api from "@/apis/CommonAPI";

export default {
  namespaced: true,
  state: {
    BIRA: [],
    selectedBIRA: null,
    loading: false,
  },
  mutations: {
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    SET_BIRA(state, BIRA) {
      state.BIRA = BIRA;
    },
    SET_SELECTED_BIRA(state, BIRA) {
      state.selectedBIRA = BIRA;
    },
    UPDATE_BIRA(state, updatedBIRA) {
      const index = state.BIRA.findIndex((BIRA) => BIRA.id === updatedBIRA.id);
      if (index !== -1) {
        state.BIRA.splice(index, 1, updatedBIRA);
      }
    },
  },

  actions: {
    async fetchBIRA({ commit }) {
      commit("SET_LOADING", true);
      try {
        //     const response = await api.get("/bira");
        //     commit("SET_BIRA", response.data.data);
        // } catch (error) {
        //     toast.error("Error fetching BIRA");
        // }
        const BIRA = [
          {
            id: 1,
            date: "28-06-2024",
            kanbanNo: "522 A",
            line: "SAND PREP",
            machineName: "BC - 18",
            machineNo: "ISX-006",
            pic: "A. ROHMAN",
            problem: "Sampling belt gerepes",
            countermeasure: "-",
            status: "OPEN",
          },
          {
            id: 2,
            date: "27-06-2024",
            kanbanNo: "412 A",
            line: "RCS",
            machineName: "GYRATORY SCREEN",
            machineNo: "ISX-016",
            pic: "RENALDY S.",
            problem: "Vbelt Lifetime",
            countermeasure: "-",
            status: "OPEN",
          },
          {
            id: 3,
            date: "27-06-2024",
            kanbanNo: "434 A",
            line: "RCS",
            machineName: "SPEED MULLER",
            machineNo: "ISX-015",
            pic: "RENALDY S.",
            problem: "Flowmeter oli tidak bisa dilihat (buram)",
            countermeasure: "-",
            status: "OPEN",
          },
          {
            id: 4,
            date: "26-06-2024",
            kanbanNo: "520 A",
            line: "SAND PREP",
            machineName: "BC - 16",
            machineNo: "ISX-006",
            pic: "A. ROHMAN",
            problem: "Roller side macet 2 pc",
            countermeasure: "-",
            status: "OPEN",
          },
          {
            id: 5,
            date: "26-06-2024",
            kanbanNo: "520 A",
            line: "SAND PREP",
            machineName: "BC - 16",
            machineNo: "ISX-006",
            pic: "A. ROHMAN",
            problem: "V scrapper aus",
            countermeasure: "-",
            status: "OPEN",
          },
          {
            id: 6,
            date: "26-06-2024",
            kanbanNo: "512 A",
            line: "SAND PREP",
            machineName: "SAND COOLER MIA",
            machineNo: "ISX-005",
            pic: "A. ROHMAN",
            problem: "Pompa MIA rembes",
            countermeasure: "-",
            status: "OPEN",
          },
          {
            id: 7,
            date: "26-06-2024",
            kanbanNo: "305 C",
            line: "DIE PRESS",
            machineName: "D.C. SHOT BLAST",
            machineNo: "IDC-010",
            pic: "NURHIDAYAT",
            problem: "Item Check sudah tidak ada RV",
            countermeasure: "-",
            status: "OPEN",
          },
          {
            id: 8,
            date: "26-06-2024",
            kanbanNo: "305 C",
            line: "DIE PRESS",
            machineName: "D.C. SHOT BLAST",
            machineNo: "IDC-010",
            pic: "NURHIDAYAT",
            problem: "Pulse jet NG",
            countermeasure: "-",
            status: "OPEN",
          },
        ];
        commit("SET_BIRA", BIRA);
      } catch (error) {
        console.error("Error fetching BIRA:", error);
        toast.error("Error fetching BIRA");
      } finally {
        commit("SET_LOADING", false);
      }
    },
    selectBIRA({ commit }, BIRA) {
      commit("SET_SELECTED_BIRA", BIRA);
    },
    updateBIRAStatus({ commit }, { BIRAId, newStatus }) {
      commit("UPDATE_BIRA", { id: BIRAId, status: newStatus });
    },
  },
  getters: {
    allBIRA: (state) => state.BIRA,
    selectedBIRA: (state) => state.selectedBIRA,
    isLoading: (state) => state.loading,
  },
};
