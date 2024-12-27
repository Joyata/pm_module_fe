import { toast } from "vue-sonner";
import api from "@/apis/CommonAPI";

export default {
  namespaced: true,
  state: {
    SOP: [],
    selectedSOP: null,
    loading: false,
  },
  mutations: {
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    SET_SOP(state, SOP) {
      state.SOP = SOP;
    },
    SET_SELECTED_SOP(state, SOP) {
      state.selectedSOP = SOP;
    },
    ADD_SOP(state, newSOP) {
      state.SOP.unshift(newSOP);
    },
    UPDATE_SOP(state, updatedSOP) {
      const index = state.SOP.findIndex((SOP) => SOP.id === updatedSOP.id);
      if (index !== -1) {
        state.SOP.splice(index, 1, updatedSOP);
      }
    },
  },

  actions: {
    async fetchSOP({ commit }) {
      commit("SET_LOADING", true);
      try {
        //     const response = await api.get("/sop");
        //     commit("SET_SOP", response.data.data);
        // } catch (error) {
        //     toast.error("Error fetching SOP");
        // }
        const SOP = [
          {
            sopId: "SOP001",
            sopName: "Machine Startup",
            description: "Procedure for starting up the machine safely.",
            createdDate: "2023-01-10",
            lastUpdated: "2024-01-15",
            status: "Active",
            pdfUrl: "https://google.com",
          },
          {
            sopId: "SOP002",
            sopName: "Maintenance Check",
            description: "Regular maintenance check procedure.",
            createdDate: "2022-05-23",
            lastUpdated: "2023-11-05",
            status: "Active",
            pdfUrl: "https://google.com",
          },
          {
            sopId: "SOP003",
            sopName: "Safety Inspection",
            description: "Procedure for conducting safety inspections.",
            createdDate: "2021-08-15",
            lastUpdated: "2024-02-20",
            status: "Inactive",
            pdfUrl: "https://google.com",
          },
          {
            sopId: "SOP004",
            sopName: "Emergency Shutdown",
            description: "Steps to follow during an emergency shutdown.",
            createdDate: "2022-03-12",
            lastUpdated: "2024-06-10",
            status: "Active",
            pdfUrl: "https://google.com",
          },
          {
            sopId: "SOP005",
            sopName: "Quality Control",
            description: "Procedure for quality control inspections.",
            createdDate: "2023-07-07",
            lastUpdated: "2024-04-25",
            status: "Active",
            pdfUrl: "https://google.com",
          },
          {
            sopId: "SOP006",
            sopName: "Equipment Calibration",
            description: "Process for calibrating equipment.",
            createdDate: "2023-09-18",
            lastUpdated: "2024-03-30",
            status: "Active",
            pdfUrl: "https://google.com",
          },
          {
            sopId: "SOP007",
            sopName: "Waste Disposal",
            description: "Guidelines for proper waste disposal.",
            createdDate: "2022-11-05",
            lastUpdated: "2024-05-12",
            status: "Active",
            pdfUrl: "https://google.com",
          },
          {
            sopId: "SOP008",
            sopName: "Chemical Handling",
            description: "Safety procedures for handling chemicals.",
            createdDate: "2023-02-28",
            lastUpdated: "2024-01-20",
            status: "Active",
            pdfUrl: "https://google.com",
          },
          {
            sopId: "SOP009",
            sopName: "Data Backup",
            description: "Process for backing up important data.",
            createdDate: "2022-08-14",
            lastUpdated: "2024-04-05",
            status: "Inactive",
            pdfUrl: "https://google.com",
          },
          {
            sopId: "SOP010",
            sopName: "Machine Cleaning",
            description: "Steps for cleaning machinery after use.",
            createdDate: "2023-06-22",
            lastUpdated: "2024-02-18",
            status: "Active",
            pdfUrl: "https://google.com",
          },
          {
            sopId: "SOP011",
            sopName: "Inventory Management",
            description: "Procedures for managing inventory.",
            createdDate: "2022-12-03",
            lastUpdated: "2024-03-15",
            status: "Active",
            pdfUrl: "https://google.com",
          },
          {
            sopId: "SOP012",
            sopName: "Employee Training",
            description: "Guidelines for conducting employee training.",
            createdDate: "2023-04-09",
            lastUpdated: "2024-05-01",
            status: "Active",
            pdfUrl: "https://google.com",
          },
          {
            sopId: "SOP013",
            sopName: "Product Packaging",
            description: "Standards for packaging finished products.",
            createdDate: "2023-08-30",
            lastUpdated: "2024-04-10",
            status: "Active",
            pdfUrl: "https://google.com",
          },
          {
            sopId: "SOP014",
            sopName: "Equipment Maintenance",
            description: "Scheduled maintenance procedures for equipment.",
            createdDate: "2022-10-17",
            lastUpdated: "2024-02-28",
            status: "Active",
            pdfUrl: "https://google.com",
          },
          {
            sopId: "SOP015",
            sopName: "Customer Complaint Handling",
            description: "Process for addressing customer complaints.",
            createdDate: "2023-03-25",
            lastUpdated: "2024-01-05",
            status: "Active",
            pdfUrl: "https://google.com",
          },
        ];
        commit("SET_SOP", SOP);
      } catch (error) {
        console.error("Error fetching SOP:", error);
        toast.error("Error fetching SOP");
      } finally {
        commit("SET_LOADING", false);
      }
    },
    selectSOP({ commit }, SOP) {
      commit("SET_SELECTED_SOP", SOP);
    },
    updateSOPStatus({ commit }, { SOPId, newStatus }) {
      commit("UPDATE_SOP", { id: SOPId, status: newStatus });
    },
    createSOP({ commit }, newSOP) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            commit("ADD_SOP", newSOP);
            resolve();
          } catch (error) {
            reject(error);
          }
        }, 1000);
      });
    },
  },
  getters: {
    allSOP: (state) => state.SOP,
    selectedSOP: (state) => state.selectedSOP,
    isLoading: (state) => state.loading,
  },
};
