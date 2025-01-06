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
                <CInputGroupText as="label" for="ToolSelect">
                  <CIcon
                    icon="cil-findInPage"
                    class="flex-shrink-0 me-2"
                  ></CIcon>
                  Tool</CInputGroupText
                >
                <CFormSelect
                  id="ToolSelect"
                  v-model="selectedTool"
                  name="tool_nm"
                  :options="toolOptions"
                  @change="onToolChange"
                >
                  <option value="" disabled selected>Select Tool</option>
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
                <CIcon icon="cil-plus" class="flex-shrink-0 me-2"></CIcon
                >Add</CButton
              >
            </CCol>
          </CRow>
          <CRow class="mb-3">
            <CCol>
              <div v-if="loading" class="text-center py-4">
                <CSpinner />
                <div class="mt-2">Loading...</div>
              </div>
              <TableTools
                v-else
                :tools="paginatedTools"
                :station-id="selectedStation"
                @fetch-tools="fetchToolsList"
              ></TableTools>
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
              :active="currentPage === page"
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
      <CModalTitle>Add Tool</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="px-2">
        <CFormInput
          class="mb-3"
          v-model="newTool.tool_nm"
          label="Tool Name"
          placeholder="Enter tool name"
          required
        />
        <CFormInput
          class="mb-3"
          type="text"
          inputmode="numeric"
          v-model="newTool.quantity"
          label="Quantity"
          placeholder="Enter quantity"
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
      <CButton color="primary" @click="addTool()">Add</CButton>
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
import Notifications from "../../components/pm/Notifications.vue";
import TableTools from "../../components/pm/TableTools.vue";
import Swal from "sweetalert2";

export default {
  name: "PMMasterTools",
  components: {
    SearchFilter,
    Notifications,
    TableTools,
  },
  data() {
    return {
      selectedStation: null,
      showAddModal: false,
      showNotificationsModal: false,
      selectedTool: "",
      newTool: {
        tool_nm: "",
        quantity: "",
        station_id: "",
      },
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  async created() {
    if (this.selectedStation) {
      this.fetchToolsList();
    }
    await this.$store.dispatch(
      "notifications/initializeNotifications",
      this.user?.role
    );
  },

  computed: {
    ...mapState("auth", ["user"]),
    ...mapState("tools", ["tools", "loading"]),
    ...mapGetters("tools", ["allTools"]),
    ...mapGetters("notifications", ["getUnreadNotifications"]),

    unreadCount() {
      return this.getUnreadNotifications.length;
    },

    userRole() {
      return this.user?.role;
    },

    paginatedTools() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      const slicedTools = this.filteredTools.slice(start, end);
      console.log("Paginated tools:", slicedTools);
      return slicedTools;
    },

    filteredTools() {
      // Only show tools for selected station
      const stationTools = this.allTools.filter(
        (tool) => tool.station_id === this.selectedStation
      );

      if (
        !this.selectedTool ||
        this.selectedTool === "0" ||
        this.selectedTool === "all"
      ) {
        return stationTools;
      }
      return stationTools.filter((tool) => tool.tool_nm === this.selectedTool);
    },

    totalPages() {
      return Math.ceil(this.filteredTools.length / this.itemsPerPage);
    },

    toolOptions() {
      let defaultOption = {
        value: 0,
        label: "Select Tool",
        disabled: true,
        selected: true,
      };
      let allOption = {
        value: "all",
        label: "All",
      };
      let options = this.allTools.map((tools) => ({
        value: tools.tool_nm,
        label: tools.tool_nm,
      }));
      return [defaultOption, allOption, ...options];
    },
  },

  methods: {
    ...mapActions("tools", ["fetchTools", "selectTool", "createTool"]),
    async handleSearch(searchParams) {
      this.selectedStation = searchParams.station_id;
      this.currentPage = 1; // Reset to first page on new search
      this.selectedTool = ""; // Reset tool selection on station change
      await this.fetchToolsList();
    },

    async fetchToolsList() {
      if (!this.selectedStation) return;

      try {
        await this.fetchTools({
          station_id: this.selectedStation,
        });
      } catch (error) {
        console.error("Error fetching tools: ", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load tools. Please try again.",
          icon: "error",
        });
      }
    },

    onToolChange(event) {
      const selectedToolId = event.target.value;
      const selectedTool = this.allTools.find(
        (tools) => tools.tool_nm === selectedToolId
      );
      if (selectedTool) {
        this.selectTool(selectedTool);
      }
    },

    openAddModal() {
      if (!this.selectedStation) {
        Swal.fire({
          title: "Error",
          text: "Please select a station to add a tool",
          icon: "error",
        });
      }
      this.showAddModal = true;
    },
    async addTool() {
      console.log("Adding new tool with data:", this.newTool);
      if (!this.selectedStation) {
        Swal.fire({
          title: "Error",
          text: "Please select a station to add a tool",
          icon: "error",
        });
        return;
      }

      if (!this.newTool.tool_nm || !this.newTool.quantity) {
        Swal.fire({
          title: "Error",
          text: "Please fill in all fields",
          icon: "error",
        });
        return;
      }

      // Set the station_id before creating
      this.newTool.station_id = this.selectedStation;

      try {
        const success = await this.createTool(this.newTool);
        if (success) {
          this.showAddModal = false;
          this.newTool = {
            tool_nm: "",
            quantity: "",
            station_id: "",
          };
          await this.fetchToolsList();
          Swal.fire({
            title: "Success",
            text: "Tool added successfully",
            icon: "success",
          });
        }
      } catch (error) {
        console.error("Error adding tool:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to add tool. Please try again.",
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
