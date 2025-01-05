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
                @refresh="handleTableRefresh"
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

  <!-- Add Mode Selection Modal -->
  <CModal size="sm" :visible="showAddModeModal" @close="closeAddModeModal">
    <CModalHeader>
      <CModalTitle>Add New</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="d-grid gap-2">
        <CButton color="primary" @click="openNewMachineModal">
          <CIcon icon="cil-industry" class="me-2"></CIcon>
          Add New Machine
        </CButton>
        <CButton color="success" @click="openNewPartModal">
          <CIcon icon="cil-puzzle" class="me-2"></CIcon>
          Add Part to Existing Machine
        </CButton>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="closeAddModeModal">Close</CButton>
    </CModalFooter>
  </CModal>

  <!-- Add New Machine Modal -->
  <CModal
    size="lg"
    :visible="showNewMachineModal"
    @close="closeNewMachineModal"
  >
    <CModalHeader>
      <CModalTitle>Add New Machine</CModalTitle>
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
      <CButton color="secondary" @click="closeNewMachineModal">Close</CButton>
      <CButton
        color="primary"
        @click="handleAddMachine"
        :disabled="!isFormValid || isSubmitting"
        >{{ isSubmitting ? "Adding..." : "Add" }}</CButton
      >
    </CModalFooter>
  </CModal>

  <!-- Add New Part Modal -->
  <CModal size="lg" :visible="showNewPartModal" @close="closeNewPartModal">
    <CModalHeader>
      <CModalTitle>Add New Part</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="px-2">
        <CFormSelect
          class="mb-3"
          v-model="newPart.machine_id"
          label="Select Machine"
          :state="isValidMachineSelect"
          :feedback="machineSelectFeedback"
          :options="existingMachineOptions"
          required
        ></CFormSelect>
        <CFormInput
          class="mb-3"
          v-model="newPart.part_nm"
          label="Part Name"
          :state="isValidNewPartName"
          :feedback="newPartNameFeedback"
          required
        ></CFormInput>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="closeNewPartModal">Close</CButton>
      <CButton
        color="primary"
        @click="handleAddPart"
        :disabled="!isNewPartFormValid || isSubmitting"
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
import { CFormInput, CFormSelect } from "@coreui/vue";

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
      showAddModeModal: false,
      showNewMachineModal: false,
      showNewPartModal: false,
      showNotificationsModal: false,
      isSubmitting: false,
      selectedMachine: "",
      newMachine: {
        machine_nm: "",
        part_nm: "",
        station_id: "",
      },
      newPart: {
        machine_id: "",
        part_nm: "",
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

    existingMachineOptions() {
      return this.machines
        .filter((machine) => !machine.deleted_by)
        .map((machine) => ({
          value: machine._id,
          label: machine.machine_nm,
        }));
    },

    isValidMachineSelect() {
      return this.newPart.machine_id && this.newPart.machine_id.length > 0;
    },

    machineSelectFeedback() {
      if (!this.isValidMachineSelect) return "Please select a machine";
      return "";
    },

    isValidNewPartName() {
      return this.newPart.part_nm?.trim().length > 0;
    },

    newPartNameFeedback() {
      if (!this.isValidNewPartName) return "Part name is required";
      return "";
    },

    isNewPartFormValid() {
      return this.isValidMachineSelect && this.isValidNewPartName;
    },

    paginatedMachines() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredMachines.slice(start, end);
    },

    filteredMachines() {
      // Reset page to 1 if filtered data length is less than current page's data
      const filtered =
        !this.selectedMachine || this.selectedMachine === "all"
          ? this.machinesWithParts
          : this.machinesWithParts.filter(
              (machine) => machine.machine_nm === this.selectedMachine
            );

      // Check if we need to reset pagination
      const totalItems = filtered.length;
      const lastPageForItems = Math.ceil(totalItems / this.itemsPerPage);
      if (this.currentPage > lastPageForItems) {
        this.$nextTick(() => {
          this.currentPage = Math.max(1, lastPageForItems);
        });
      }

      return filtered;
    },

    totalPages() {
      return Math.ceil(this.filteredMachines.length / this.itemsPerPage);
    },

    machineOptions() {
      let defaultOption = {
        value: "",
        label: "Select Machine",
        disabled: true,
        selected: true,
      };
      let allOption = {
        value: "all",
        label: "All",
      };
      let options = _.uniqBy(this.machines, "machine_nm")
        .filter((machine) => !machine.deleted_by)
        .map((machine) => ({
          value: machine.machine_nm,
          label: machine.machine_nm,
        }));
      return [defaultOption, allOption, ...options];
    },
  },

  methods: {
    ...mapActions("machines", [
      "fetchMachinesByStation",
      "selectMachine",
      "createMachine",
      "createPart",
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
        this.currentPage = 1;
        await this.fetchMachinesByStation(this.selectedStation);
      }
    },

    async handleTableRefresh() {
      this.selectedMachine = "all";
      this.currentPage = 1;
      await this.refreshData();
    },

    async onMachineChange(event) {
      const selectedMachineName = event.target.value;
      console.log("Selected machine name:", selectedMachineName);

      this.currentPage = 1;

      if (selectedMachineName || selectedMachineName === "all") {
        this.selectMachine = "";
        return;
      }
      this.selectedMachine = selectedMachineName;
    },

    openAddModal() {
      if (!this.selectedStation) {
        Swal.fire({
          title: "Error",
          text: "Please select a station to add machine",
          icon: "error",
        });
        return;
      }
      this.showAddModeModal = true;
    },

    closeAddModeModal() {
      this.showAddModeModal = false;
    },

    openNewMachineModal() {
      this.closeAddModeModal();
      this.showNewMachineModal = true;
      this.newMachine.station_id = this.selectedStation;
    },

    closeNewMachineModal() {
      this.showNewMachineModal = false;
      this.newMachine = {
        machine_nm: "",
        part_nm: "",
        station_id: "",
      };
      this.isSubmitting = false;
    },

    openNewPartModal() {
      this.closeAddModeModal();
      this.showNewPartModal = true;
    },

    closeNewPartModal() {
      this.showNewPartModal = false;
      this.newPart = {
        machine_id: "",
        part_nm: "",
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
          this.closeNewMachineModal();
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

    async handleAddPart() {
      if (!this.isNewPartFormValid) {
        Swal.fire({
          title: "Error",
          text: "Please fill in all fields",
          icon: "error",
        });
        return;
      }

      this.isSubmitting = true;

      try {
        const success = await this.createPart({
          machine_id: this.newPart.machine_id,
          part_nm: this.newPart.part_nm,
        });

        if (success) {
          this.closeNewPartModal();
          await this.refreshData();
          Swal.fire({
            title: "Success",
            text: "Part added successfully",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        console.error("Error adding part:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to add part. Please try again.",
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
