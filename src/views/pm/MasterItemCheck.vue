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
                  :itemchecks="allItemchecks"
                  :loading="isLoading"
                  :spareParts="sparePartsOptions"
                  :tools="toolsOptions"
                  :stationId="stationId"
                  @fetch-item-checks="handleFetchItemChecks"
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
            :state="isValidItemCheckName"
            :feedback="itemCheckNameFeedback"
            required
          />
          <CFormInput
            class="mb-3"
            v-model="newItemCheck.std"
            label="Standard"
            placeholder="Enter standard value"
            :state="isValidStandard"
            :feedback="standardFeedback"
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
                :state="isValidUnit"
                :feedback="unitFeedback"
                :required="newItemCheck.min || newItemCheck.max"
              />
            </CCol>
          </CRow>
          <CFormSelect
            class="mb-3"
            v-model="newItemCheck.period"
            label="Period"
            :state="isValidPeriod"
            :feedback="periodFeedback"
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
            :options="sparePartsOptions"
          />
          <CFormSelect
            class="mb-3"
            v-model="newItemCheck.tools_id"
            label="Tool"
            :options="toolsOptions"
          />
        </CCol>
      </CRow>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="closeAddModal">Close</CButton>
      <CButton
        color="primary"
        @click="handleAddItemCheck"
        :disabled="!isFormValid || isLoading"
        >{{ isLoading ? "Adding..." : "Add" }}</CButton
      >
    </CModalFooter>
  </CModal>
</template>

<script>
import TableItemCheck from "../../components/pm/TableItemCheck.vue";
import Swal from "sweetalert2";
import router from "../../router";
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "PMMasterItemCheck",

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
      stationId: "",
      partId: "",
      partNm: "",
      machineNm: "",
    };
  },

  computed: {
    ...mapState("auth", ["user"]),
    ...mapState("itemchecks", ["loading"]),
    ...mapGetters("itemchecks", [
      "allItemchecks",
      "allTools",
      "allSpareParts",
      "isLoading",
    ]),

    sparePartsOptions() {
      return [
        { label: "Select spare part", value: "" },
        ...this.allSpareParts.map((part) => ({
          label: part.spare_part_nm,
          value: part._id,
        })),
      ];
    },

    toolsOptions() {
      return [
        { label: "Select tool", value: "" },
        ...this.allTools.map((tool) => ({
          label: tool.tool_nm,
          value: tool._id,
        })),
      ];
    },

    isValidItemCheckName() {
      return this.newItemCheck.itemcheck_nm?.trim().length > 0;
    },

    itemCheckNameFeedback() {
      if (!this.isValidItemCheckName) return "Item check name is required";
      return "";
    },

    isValidStandard() {
      return this.newItemCheck.std?.trim().length > 0;
    },

    standardFeedback() {
      if (!this.isValidStandard) return "Standard is required";
      return "";
    },

    isValidPeriod() {
      return this.newItemCheck.period?.trim().length > 0;
    },

    periodFeedback() {
      if (!this.isValidPeriod) return "Period is required";
      return "";
    },

    isValidUnit() {
      if (this.newItemCheck.min || this.newItemCheck.max) {
        return this.newItemCheck.unit?.trim().length > 0;
      }
      return true;
    },

    unitFeedback() {
      if (!this.isValidUnit) return "Unit is required when min or max is set";
      return "";
    },

    isFormValid() {
      const hasRequiredFields =
        this.isValidItemCheckName && this.isValidStandard && this.isValidPeriod;

      // If min or max is provided, unit is required
      if (
        (this.newItemCheck.min || this.newItemCheck.max) &&
        !this.isValidUnit
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
    this.machineId = this.$route.query.machine_id;
    this.stationId = this.$route.query.station_id;

    console.log("Component created with:", {
      machineId: this.$route.query.machine_id,
      machineNm: this.machineNm,
      partId: this.partId,
      partNm: this.partNm,
      stationId: this.stationId,
    });

    // Validate required IDs
    if (!this.partId || !this.$route.query.machine_id || !this.stationId) {
      Swal.fire({
        title: "Error",
        text: "Missing required parameters",
        icon: "error",
      });
      this.$router.back();
      return;
    }

    // Initialize data
    await this.initializeData();
  },

  methods: {
    ...mapActions("itemchecks", [
      "fetchItemchecksByPart",
      "fetchTools",
      "fetchSpareParts",
      "createItemcheck",
    ]),

    async initializeData() {
      try {
        await Promise.all([
          this.handleFetchItemChecks(),
          this.fetchTools(this.stationId),
          this.fetchSpareParts(this.stationId),
        ]);
      } catch (error) {
        console.error("Error initializing data:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to initialize data",
          icon: "error",
        });
      }
    },

    async handleFetchItemChecks() {
      await this.fetchItemchecksByPart(this.partId);
    },

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

    async handleAddItemCheck() {
      if (!this.isFormValid) {
        Swal.fire({
          title: "Error",
          text: "Please fill in all required fields correctly",
          icon: "error",
        });
        return;
      }

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

        const success = await this.createItemcheck(payload);

        if (success) {
          this.closeAddModal();
          Swal.fire({
            title: "Success",
            text: "Item check added successfully",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
          });
          await this.handleFetchItemChecks();
        }
      } catch (error) {
        console.error("Error adding item check:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to add item check. Please try again.",
          icon: "error",
        });
      }
    },

    goBack() {
      this.$router.back();
    },
  },
};
</script>
