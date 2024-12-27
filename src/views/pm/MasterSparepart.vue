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
                <CInputGroupText as="label" for="SparepartSelect">
                  <CIcon
                    icon="cil-findInPage"
                    class="flex-shrink-0 me-2"
                  ></CIcon>
                  Sparepart</CInputGroupText
                >
                <CFormSelect
                  id="SparepartSelect"
                  v-model="selectedSparepart"
                  name="spare_part_nm"
                  :options="sparepartOptions"
                  @change="onSparepartChange"
                >
                  <option value="" disabled selected>Select Sparepart</option>
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
              <TableSparepart
                v-else
                :spareparts="paginatedSpareparts"
                :station-id="selectedStation"
                :fetch-spareparts="fetchSparepartsList"
              ></TableSparepart>
            </CCol>
          </CRow>

          <!-- Pagination Controls -->
          <CPagination
            v-if="totalPages > 1"
            align="end"
            aria-label="Page navigation example"
          >
            <CPaginationItem :disabled="currentPage === 1" @click="prevPage">
              Previous
            </CPaginationItem>
            <CPaginationItem
              v-for="page in totalPages"
              :key="page"
              :active="page === currentPage"
              @click="goToPage(page)"
            >
              {{ page }}
            </CPaginationItem>
            <CPaginationItem
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              Next
            </CPaginationItem>
          </CPagination>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Add Modal -->
  <CModal
    size="lg"
    :visible="showAddModal"
    @close="
      () => {
        showAddModal = false;
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Add Sparepart</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="px-2">
        <CFormInput
          class="mb-3"
          v-model="newSparepart.spare_part_nm"
          label="Sparepart Name"
          placeholder="Enter sparepart name"
          required
        />
        <CFormInput
          class="mb-3"
          type="text"
          inputmode="numeric"
          v-model="newSparepart.quantity"
          label="Quantity"
          placeholder="Enter quantity"
          required
        />
        <CFormInput
          class="mb-3"
          v-model="newSparepart.unit"
          label="Unit"
          placeholder="Enter unit"
          required
        />
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton
        color="secondary"
        @click="
          () => {
            showAddModal = false;
          }
        "
        >Close</CButton
      >
      <CButton color="primary" @click="addSparepart()">Add</CButton>
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
import TableSparepart from "../../components/pm/TableSparepart";
import Swal from "sweetalert2";

export default {
  name: "PMMasterSparepart",
  components: {
    SearchFilter,
    Notifications,
    TableSparepart,
  },
  data() {
    return {
      selectedStation: null,
      showAddModal: false,
      showNotificationsModal: false,
      selectedSparepart: "",
      newSparepart: {
        spare_part_nm: "",
        quantity: "",
        unit: "",
        station_id: "",
      },
      sparepartOptions: [],
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  async created() {
    if (this.selectedStation) {
      this.fetchSparepartsList();
    }
    await this.$store.dispatch(
      "notifications/initializeNotifications",
      this.user?.role
    );
  },

  computed: {
    ...mapState("auth", ["user"]),
    ...mapState("spareparts", ["spareparts", "loading"]),
    ...mapGetters("spareparts", ["allSpareparts"]),
    ...mapGetters("notifications", ["getUnreadNotifications"]),

    unreadCount() {
      return this.getUnreadNotifications.length;
    },

    userRole() {
      return this.user?.role;
    },

    paginatedSpareparts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      const slicedSpareparts = this.filteredSpareparts.slice(start, end);
      return slicedSpareparts;
    },

    filteredSpareparts() {
      // Only show spareparts for selected station
      const stationSpareparts = this.allSpareparts.filter(
        (sparepart) => sparepart.station_id === this.selectedStation
      );

      if (
        !this.selectedSparepart ||
        this.selectedSparepart === "0" ||
        this.selectedSparepart === "all"
      ) {
        return stationSpareparts;
      }
      return stationSpareparts.filter(
        (sparepart) => sparepart.spare_part_nm === this.selectedSparepart
      );
    },

    totalPages() {
      return Math.ceil(this.filteredSpareparts.length / this.itemsPerPage);
    },

    sparepartOptions() {
      let defaultOption = {
        value: 0,
        label: "Select Sparepart",
        disabled: true,
        selected: true,
      };
      let allOption = {
        value: "all",
        label: "All",
      };
      let options = this.allSpareparts.map((spareparts) => ({
        value: spareparts.spare_part_nm,
        label: spareparts.spare_part_nm,
      }));
      return [defaultOption, allOption, ...options];
    },
  },

  methods: {
    ...mapActions("spareparts", [
      "fetchSpareparts",
      "selectSparepart",
      "createSparepart",
    ]),
    async handleSearch(searchParams) {
      this.selectedStation = searchParams.station_id;
      this.currentPage = 1; // Reset to first page on new search
      this.selectedSparepart = ""; // Reset sparepart selection on station change
      await this.fetchSparepartsList();
    },

    async fetchSparepartsList() {
      if (!this.selectedStation) return;

      try {
        await this.fetchSpareparts({
          station_id: this.selectedStation,
        });
      } catch (error) {
        console.error("Error fetching spareparts:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load spareparts. Please try again.",
          icon: "error",
        });
      }
    },

    async onSparepartChange(event) {
      const selectedSparepartId = event.target.value;
      const selectedSparepart = this.allSpareparts.find(
        (sparepart) => sparepart.spare_part_nm === selectedSparepartId
      );
      if (selectedSparepart) {
        this.selectSparepart(selectedSparepart);
      }
    },

    openAddModal() {
      if (!this.selectedStation) {
        Swal.fire({
          title: "Error",
          text: "Please select a station to add a sparepart",
          icon: "error",
        });
      }
      this.showAddModal = true;
    },

    async addSparepart() {
      console.log("Adding new sparepart with data:", this.newSparepart);
      if (!this.selectedStation) {
        Swal.fire({
          title: "Error",
          text: "Please select a station to add a sparepart",
          icon: "error",
        });
        return;
      }

      if (
        !this.newSparepart.spare_part_nm ||
        !this.newSparepart.quantity ||
        !this.newSparepart.unit
      ) {
        Swal.fire({
          title: "Error",
          text: "Please fill in all fields",
          icon: "error",
        });
        return;
      }

      // Set the station_id before creating
      this.newSparepart.station_id = this.selectedStation;

      try {
        const success = await this.createSparepart(this.newSparepart);
        if (success) {
          this.showAddModal = false;
          this.newSparepart = {
            spare_part_nm: "",
            quantity: "",
            unit: "",
            station_id: "",
          };
          await this.fetchSparepartsList();
          Swal.fire({
            title: "Success",
            text: "Sparepart added successfully",
            icon: "success",
          });
        }
      } catch (error) {
        console.error("Error adding sparepart:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to add sparepart. Please try again.",
          icon: "error",
        });
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
