<template>
  <CRow>
    <CCol :md="12">
      <CCard class="mb-3">
        <CCardHeader>
          <div class="d-flex justify-content-between">
            <CCardTitle>Item Check - {{ partNm }}</CCardTitle>
            <CButton size="sm" color="secondary" @click="goBack">Back</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol class="d-grid d-md-flex justify-content-md-end">
              <CButton
                color="success"
                class="d-flex align-item-center text-white"
                @click="openAddModal"
              >
                <CIcon icon="cil-plus" class="flex-shrink-0 me-2"></CIcon
                >Add</CButton
              >
            </CCol>
          </CRow>
          <CRow class="mt-3">
            <CCol>
              <div>
                <!-- <div v-if="loading">Loading...</div>
                    <div v-if="error">{{ error }}</div> -->
                <TableItemCheck
                  :itemchecks="itemchecks"
                  :loading="loading"
                  :spareParts="spareParts"
                  :tools="tools"
                  :stationId="stationId"
                  @fetch-ItemChecks="fetchItemChecks"
                ></TableItemCheck>
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Add Modal -->
  <CModal size="lg" :visible="showAddModal" @close="closeAddModal">
    <CModalHeader>
      <CModalTitle>Add Item Check</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CRow>
        <CCol :md="12">
          <CFormInput
            class="mb-3"
            v-model="newItemCheck.itemcheck_nm"
            label="Item Check Name"
            placeholder="Enter item check name"
            required
          />
          <CFormInput
            class="mb-3"
            v-model="newItemCheck.std"
            label="Standard"
            placeholder="Enter standard value"
            required
          />
          <CRow>
            <CCol :md="4">
              <CFormInput
                class="mb-3"
                type="number"
                step="0.1"
                v-model="newItemCheck.min"
                label="Min Value"
                placeholder="Enter min value"
              />
            </CCol>
            <CCol :md="4">
              <CFormInput
                class="mb-3"
                type="number"
                step="0.1"
                v-model="newItemCheck.max"
                label="Max Value"
                placeholder="Enter max value"
              />
            </CCol>
            <CCol :md="4">
              <CFormInput
                class="mb-3"
                v-model="newItemCheck.unit"
                label="Unit"
                placeholder="Enter unit"
                :required="newItemCheck.min || newItemCheck.max"
              />
            </CCol>
          </CRow>
          <CFormSelect
            class="mb-3"
            v-model="newItemCheck.period"
            label="Period"
            required
            :options="[
              { label: 'Select period', value: '' },
              { label: 'A - 1 Month', value: 'A' },
              { label: 'B - 3 Months', value: 'B' },
              { label: 'C - 6 Months', value: 'C' },
              { label: 'D - 1 Year', value: 'D' },
            ]"
          />
          <CFormSelect
            class="mb-3"
            v-model="newItemCheck.spare_part_id"
            label="Spare Part"
            :options="spareParts"
          />
          <CFormSelect
            class="mb-3"
            v-model="newItemCheck.tools_id"
            label="Tool"
            :options="tools"
          />
        </CCol>
      </CRow>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="closeAddModal">Close</CButton>
      <CButton color="primary" @click="addItemCheck" :disabled="loading">{{
        loading ? "Adding..." : "Add"
      }}</CButton>
    </CModalFooter>
  </CModal>
</template>

<script>
import TableItemCheck from "../../components/pm/TableItemCheck.vue";
import Swal from "sweetalert2";
import router from "../../router";
import api from "../../apis/CommonAPI";
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "PMMasterItemCheck",
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  components: {
    TableItemCheck,
  },

  data() {
    return {
      showAddModal: false,
      newItemCheck: {
        itemcheck_nm: "",
        std: "",
        period: "",
        min: null,
        max: null,
        unit: "",
        spare_part_id: null,
        tools_id: null,
        part_id: "",
      },
      itemchecks: [],
      spareParts: [{ label: "Select spare part", value: "" }],
      tools: [{ label: "Select tool", value: "" }],
      stationId: "",
      partId: "",
      partNm: "",
      machineNm: "",
      loading: false,
      error: null,
    };
  },

  computed: {
    ...mapState("auth", ["user"]),

    isFormValid() {
      const { itemcheck_nm, std, period } = this.newItemCheck;
      const hasRequiredFields = itemcheck_nm && std && period;

      // If min or max is provided, unit is required
      if (
        (this.newItemCheck.min || this.newItemCheck.max) &&
        !this.newItemCheck.unit
      ) {
        return false;
      }

      return hasRequiredFields;
    },
  },

  async created() {
    this.partId = this.$route.params.part_id;
    this.partNm = this.$route.query.part_nm;
    this.machineNm = this.$route.query.machine_nm;
    const machineId = this.$route.query.machine_id;
    const stationId = this.$route.query.station_id;
    console.log("Component created with:", {
      machineId,
      machineNm: this.machineNm,
      partId: this.partId,
      partNm: this.partNm,
      stationId,
    });

    // Validate we have required IDs
    if (!this.partId || !machineId || !stationId) {
      Swal.fire({
        title: "Error",
        text: "Missing required parameters",
        icon: "error",
      });
      this.$router.back();
      return;
    }
    await Promise.all([
      this.fetchItemChecks(),
      this.fetchSpareParts(),
      this.fetchTools(),
    ]);
  },

  methods: {
    openAddModal() {
      this.showAddModal = true;
      this.newItemCheck.part_id = this.partId;
    },

    closeAddModal() {
      this.showAddModal = false;
      this.clearForm();
    },

    clearForm() {
      this.newItemCheck = {
        itemcheck_nm: "",
        std: "",
        period: "",
        min: null,
        max: null,
        unit: "",
        spare_part_id: null,
        tools_id: null,
        part_id: this.partId,
      };
    },

    async addItemCheck() {
      if (!this.isFormValid) {
        Swal.fire({
          title: "Error",
          text: "Please fill in all required fields correctly",
          icon: "error",
        });
        return;
      }

      this.loading = true;
      try {
        // Get user from localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        console.log("User:", user);

        const payload = {
          ...this.newItemCheck,
          part_id: this.partId,
          machine_id: this.$route.query.machine_id,
          created_by: user?._id, // For created_by
          user_id: user?._id,
          tools_id: this.newItemCheck.tools_id || null,
          spare_part_id: this.newItemCheck.spare_part_id || null,
        };

        console.log("Payload:", payload);

        const response = await api.post("/itemcheck/add-itemcheck", payload);
        console.log("Response:", response);

        if (response?.data?.status === 200) {
          await this.fetchItemChecks();
          this.closeAddModal();

          Swal.fire({
            title: "Success",
            text: "Item check added successfully",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        console.error("Error adding item check:", error);
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Failed to add item check",
          icon: "error",
        });
      } finally {
        this.loading = false;
      }
    },

    async fetchItemChecks() {
      this.loading = true;

      try {
        const partId = this.$route.params.part_id;

        if (!partId) {
          throw new Error("Part ID is required");
        }

        console.log("Request part_id:", {
          part_id: partId,
        });

        const response = await api.get(
          `/itemcheck/list-itemcheck?part_id=${partId}`,
          "?"
        );

        if (response?.data?.status === 200) {
          console.log("Response data:", response.data);
          this.itemchecks = response.data.data;
          console.log("Parsed itemchecks:", this.itemchecks);
        } else {
          throw new Error(
            response?.data?.message || "Failed to fetch item checks"
          );
        }
      } catch (error) {
        console.error("Error fetching Item Checks: ", error);
        Swal.fire({
          title: "Error",
          text:
            error.message || "Failed to load Item Checks. Please try again.",
          icon: "error",
        });
      } finally {
        this.loading = false;
      }
    },

    async fetchSpareParts() {
      const stationId = this.$route.query.station_id;

      try {
        const response = await api.get(
          `/itemcheck/list-sparepart?station_id=${stationId}`,
          "?"
        );
        if (response.data?.status === 200) {
          this.spareParts = [
            { label: "Select spare part", value: "" },
            ...response.data.data.map((part) => ({
              label: `${part.spare_part_nm}`,
              value: part._id,
            })),
          ];
        }
      } catch (error) {
        console.error("Error fetching spare parts:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load spare parts",
          icon: "error",
        });
      }
    },

    async fetchTools() {
      const stationId = this.$route.query.station_id;

      try {
        const response = await api.get(
          `/itemcheck/list-tool?station_id=${stationId}`,
          "?"
        );
        if (response.data?.status === 200) {
          this.tools = [
            { label: "Select tool", value: "" },
            ...response.data.data.map((tool) => ({
              label: `${tool.tool_nm}`,
              value: tool._id,
            })),
          ];
        }
      } catch (error) {
        console.error("Error fetching tools:", error);
      }
    },

    goBack() {
      this.$router.back();
    },
  },
};
</script>
