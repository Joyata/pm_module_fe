<template>
  <CRow>
    <CCol :md="12">
      <SearchFilter
        @search="handleSearch"
        :unreadCount="unreadCount"
        @toggleNotifications="toggleNotificationsModal"
      ></SearchFilter>
    </CCol>
  </CRow>
  <CRow>
    <CCol :md="12">
      <CCard class="mb-3">
        <CCardBody>
          <CRow class="mb-3">
            <CCol xs="12" md="6" lg="4">
              <CInputGroup>
                <CInputGroupText as="label" for="MachineSelect">
                  <CIcon
                    icon="cil-findInPage"
                    class="flex-shrink-0 me-2"
                  ></CIcon>
                  Machine</CInputGroupText
                >
                <CFormSelect
                  id="MachineSelect"
                  v-model="selectedMachine"
                  name="machine_nm"
                  :options="machineOptions"
                  @change="onMachineChange"
                >
                  <option value="" disabled selected>Select Machine</option>
                </CFormSelect>
              </CInputGroup>
            </CCol>
            <CCol
              xs="12"
              md="6"
              lg="8"
              class="d-flex justify-content-md-end mt-3 mt-md-0"
            >
              <CButton
                color="success"
                class="d-inline-flex align-item-center text-white"
                @click="openAddModal"
                :disabled="!selectedStation"
              >
                <CIcon icon="cil-plus" class="flex-shrink-0 me-2"></CIcon>Add
              </CButton>
            </CCol>
          </CRow>
          <CRow class="mb-3">
            <CCol>
              <div v-if="loading" class="text-center py-4">
                <CSpinner />

                <div class="mt-2">Loading...</div>
              </div>
              <TableMachine
                v-else
                :machines="paginatedMachines"
                :station-id="selectedStation"
                @refresh="refreshData"
              ></TableMachine>
            </CCol>
          </CRow>

          <!-- Pagination Controls -->
          <CPagination
            v-if="totalPages > 1"
            align="end"
            aria-label="Page navigation example"
          >
            <CPaginationItem :disabled="currentPage === 1" @click="prevPage">
              Previous</CPaginationItem
            >
            <CPaginationItem
              v-for="page in totalPages"
              :key="page"
              :active="page === currentPage"
              @click="goToPage(page)"
              >{{ page }}</CPaginationItem
            >
            <CPaginationItem
              :disabled="currentPage === totalPages"
              @click="nextPage"
              >Next</CPaginationItem
            >
          </CPagination>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Add Modal -->
  <CModal size="lg" :visible="showAddModal" @close="closeAddModal">
    <CModalHeader>
      <CModalTitle>Add Machine</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="px-2">
        <CFormInput
          class="mb-3"
          v-model="newMachine.machine_nm"
          label="Machine Name"
          :state="isValidMachineName"
          :feedback="machineNameFeedback"
          required
        />
        <CFormInput
          class="mb-3"
          v-model="newMachine.part_nm"
          label="Part Name"
          :state="isValidPartName"
          :feedback="partNameFeedback"
          required
        />
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="closeAddModal">Close</CButton>
      <CButton
        color="primary"
        @click="handleAddMachine"
        :disabled="!isFormValid || isSubmitting"
        >{{ isSubmitting ? "Adding..." : "Add" }}</CButton
      >
    </CModalFooter>
  </CModal>

  <!-- Notifications Modal -->
  <Notifications
    :visible="showNotificationsModal"
    @close="toggleNotificationsModal"
  ></Notifications>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import SearchFilter from "../../components/pm/SearchFilter";
import Notifications from "../../components/pm/Notifications";
import TableMachine from "../../components/pm/TableMachine";
import Swal from "sweetalert2";

export default {
  name: "PMMasterMachine",
  components: {
    SearchFilter,
    Notifications,
    TableMachine,
  },
  data() {
    return {
      selectedStation: null,
      showAddModal: false,
      showNotificationsModal: false,
      isSubmitting: false,
      selectedMachine: "",
      newMachine: {
        machine_nm: "",
        part_nm: "",
        station_id: "",
      },
      currentPage: 1,
      itemsPerPage: 5,
    };
  },

  async created() {
    if (this.selectedStation) {
      this.refreshData();
    }
    await this.$store.dispatch(
      "notifications/initializeNotifications",
      this.user?.role
    );
  },

  computed: {
    ...mapState("auth", ["user"]),
    ...mapState("machines", ["machines", "loading"]),
    ...mapGetters("machines", ["machinesWithParts", "uniqueMachines"]),
    ...mapGetters("notifications", ["getUnreadNotifications"]),

    unreadCount() {
      return this.getUnreadNotifications.length;
    },

    userRole() {
      return this.user?.role;
    },

    isValidMachineName() {
      return this.newMachine.machine_nm?.trim().length > 0;
    },

    machineNameFeedback() {
      if (!this.isValidMachineName) return "Machine name is required";
      return "";
    },

    isValidPartName() {
      return this.newMachine.part_nm?.trim().length > 0;
    },

    partNameFeedback() {
      if (!this.isValidPartName) return "Part name is required";
      return "";
    },

    isFormValid() {
      return this.isValidMachineName && this.isValidPartName;
    },

    paginatedMachines() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredMachines.slice(start, end);
    },

    filteredMachines() {
      if (!this.selectedMachine || this.selectedMachine === "all") {
        return this.machinesWithParts;
      }

      return this.machinesWithParts.filter(
        (machine) => machine.machine_nm === this.selectedMachine
      );
    },

    totalPages() {
      return Math.ceil(this.filteredMachines.length / this.itemsPerPage);
    },

    machineOptions() {
      let defaultOption = {
        value: 0,
        label: "Select Machine",
        disabled: true,
        selected: true,
      };
      let allOption = {
        value: "all",
        label: "All",
      };
      let options = this.uniqueMachines.map((machines) => ({
        value: machines.machine_nm,
        label: machines.machine_nm,
      }));
      return [defaultOption, allOption, ...options];
    },
  },

  methods: {
    ...mapActions("machines", [
      "fetchMachinesByStation",
      "selectMachine",
      "createMachine",
    ]),
    async handleSearch(searchParams) {
      if (this.selectedStation !== searchParams.station_id) {
        this.selectedStation = searchParams.station_id;
        this.currentPage = 1;
        this.selectedMachine = "";
        if (this.selectedStation) {
          await this.fetchMachinesByStation(this.selectedStation);
        }
      }
    },

    async refreshData() {
      if (this.selectedStation) {
        await this.fetchMachinesByStation(this.selectedStation);
      }
    },

    async onMachineChange(event) {
      const selectedMachineId = event.target.value;
      if (selectedMachineId === "all") {
        this.selectMachine(null);
        return;
      }
      const selectedMachine = this.uniqueMachines.find(
        (machine) => machine.machine_nm === selectedMachineId
      );
      if (selectedMachine) {
        this.selectMachine(selectedMachine);
      }
    },

    openAddModal() {
      if (!this.selectedStation) {
        Swal.fire({
          title: "Error",
          text: "Please select a station to add machine",
          icon: "error",
        });
      }
      this.showAddModal = true;
      this.newMachine.station_id = this.selectedStation;
    },

    closeAddModal() {
      this.showAddModal = false;
      this.newMachine = {
        machine_nm: "",
        part_nm: "",
        station_id: "",
      };
      this.isSubmitting = false;
    },

    async handleAddMachine() {
      console.log("Adding new machine with data:", this.newMachine);
      if (!this.selectedStation) {
        Swal.fire({
          title: "Error",
          text: "Please select a station to add a machine",
          icon: "error",
        });
        return;
      }

      if (!this.newMachine.machine_nm || !this.newMachine.part_nm) {
        Swal.fire({
          title: "Error",
          text: "Please fill in all fields",
          icon: "error",
        });
        return;
      }

      // Set the station_id before creating
      this.newMachine.station_id = this.selectedStation;

      try {
        const success = await this.createMachine({
          ...this.newMachine,
          station_id: this.selectedStation,
        });
        if (success) {
          this.closeAddModal();
          await this.refreshData();
          Swal.fire({
            title: "Success",
            text: "Machine added successfully",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        console.error("Error adding machine:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to add machine. Please try again.",
          icon: "error",
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    toggleNotificationsModal() {
      this.showNotificationsModal = !this.showNotificationsModal;
    },
  },
};
</script>

<style scoped>
@media (max-width: 576px) {
  .w-sm-auto {
    width: auto !important;
  }
}
</style>
