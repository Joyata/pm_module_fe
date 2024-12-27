<template>
  <CCard class="mb-3">
    <CCardBody>
      <CRow class="align-items-center justify-content-between">
        <!-- Download Template -->
        <CCol xs="12" md="3" xl="2" class="mb-3 mb-md-0">
          <CButton color="primary" @click="downloadTemplate" class="w-100">
            <CIcon icon="cil-cloud-download" class="me-2" />
            Template
          </CButton>
        </CCol>

        <!-- Upload Schedule -->
        <CCol xs="12" md="6" xl="4" class="mb-3 mb-md-0">
          <CInputGroup>
            <CFormInput
              type="file"
              id="scheduleUpload"
              ref="fileInput"
              @change="handleFileUpload"
              accept=".xlsx, .xls"
            />
            <CButton
              type="button"
              color="primary"
              @click="uploadSchedule"
              :disabled="loading"
            >
              <template v-if="loading">
                <CSpinner size="sm" class="me-2" />
                Uploading...
              </template>
              <template v-else>
                <CIcon icon="cil-cloud-upload" class="me-2" />
                Upload
              </template>
            </CButton>
          </CInputGroup>
          <CProgress v-if="loading" class="mt-2">
            <CProgressBar :value="uploadProgress" animated>
              {{ uploadProgress }}%
            </CProgressBar>
          </CProgress>
        </CCol>

        <!-- Export Options -->
        <CCol xs="12" md="3" xl="2">
          <CDropdown variant="btn-group" class="w-100">
            <CButton color="secondary" class="w-100">
              <CIcon icon="cil-data-transfer-down" class="me-2" />
              Export
            </CButton>
            <CDropdownToggle color="secondary" split />
            <CDropdownMenu>
              <CDropdownItem @click="handleExport('schedule')">
                <CIcon icon="cil-calendar" class="me-2" />
                Schedule Export
              </CDropdownItem>
              <CDropdownItem @click="handleExport('workload')">
                <CIcon icon="cil-chart" class="me-2" />
                Workload Report
              </CDropdownItem>
              <CDropdownDivider />
              <CDropdownItem @click="showCustomExport = true">
                <CIcon icon="cil-settings" class="me-2" />
                Custom Export
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CCol>
      </CRow>

      <!-- Custom Export Modal -->
      <CModal
        :visible="showCustomExport"
        @close="showCustomExport = false"
        size="sm"
      >
        <CModalHeader>
          <CModalTitle>Custom Export</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormCheck
            v-for="option in customOptions"
            :key="option.value"
            v-model="selectedOptions"
            :value="option.value"
            :label="option.label"
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" @click="showCustomExport = false">
            Cancel
          </CButton>
          <CButton
            color="primary"
            @click="handleCustomExport"
            :disabled="selectedOptions.length === 0"
          >
            Export Selected
          </CButton>
        </CModalFooter>
      </CModal>
    </CCardBody>
  </CCard>
</template>

<script>
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { mapActions } from "vuex";

export default {
  name: "FileOperations",

  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      showCustomExport: false,
      selectedOptions: [],
      selectedFile: null,
      loading: false,
      uploadProgress: 0,
      progressInterval: null,
      customOptions: [
        { value: "schedule", label: "Schedule Details" },
        { value: "workload", label: "Workload Analytics" },
        { value: "members", label: "Team Member Details" },
        { value: "machines", label: "Machine Information" },
      ],
    };
  },

  emits: ["close", "export-schedule", "export-workload", "export-custom"],

  methods: {
    ...mapActions("activities", ["fetchActivities"]),

    handleExport(type) {
      if (type === "schedule") {
        this.$emit("export-schedule");
      } else if (type === "workload") {
        this.$emit("export-workload");
      }
      this.$emit("close");
    },

    handleCustomExport() {
      if (this.selectedOptions.length === 0) {
        return;
      }
      this.$emit("export-custom", this.selectedOptions);
      this.$emit("close");
    },

    downloadTemplate() {
      const templateData = [
        {
          date: "07-08-2024",
          kanbanNo: "123 A",
          machineName: "WATER PUMP 7",
          machineNo: "IHOU-001",
          status: "PLAN",
          lastPMDate: "07-07-2024",
          assignedTo: "John Doe",
          sopFile: "water_pump_7_sop.pdf",
          plant: "Plant A",
          shop: "Shop 1",
          line: "Line X",
          station: "Station 1",
          period: "1 Month",
          duration: "2 hours",
          tools: "Wrench, Screwdriver",
          sparepart: "Part A, Part B",
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
      XLSX.writeFile(workbook, "PM_Schedule_Template.xlsx");
    },

    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
      this.uploadProgress = 0;
    },

    async uploadSchedule() {
      if (!this.selectedFile) {
        await Swal.fire({
          title: "Error!",
          text: "Please select a file first.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      this.loading = true;
      this.uploadProgress = 0;

      try {
        this.progressInterval = setInterval(() => {
          if (this.uploadProgress < 90) {
            this.uploadProgress += 10;
          }
        }, 300);

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            console.log("Parsed Excel data:", jsonData);

            const maxId = Math.max(
              ...this.$store.getters["activities/allActivities"].map(
                (activity) => activity.id
              ),
              0
            );
            let nextId = maxId + 1;

            const formattedActivities = jsonData.map((row) => ({
              id: nextId++,
              date: this.formatDate(row.date),
              kanbanNo: row.kanbanNo,
              machineName: row.machineName,
              machineNo: row.machineNo,
              status: row.status || "PLAN",
              lastPMDate: this.formatDate(row.lastPMDate),
              assignedTo: row.assignedTo,
              sopFile: row.sopFile,
              plant: row.plant,
              shop: row.shop,
              line: row.line,
              station: row.station,
              period: row.period,
              duration: row.duration,
              tools: row.tools,
              sparepart: row.sparepart,
              delayReason: row.delayReason || "",
            }));

            this.$store.commit("activities/SET_ACTIVITIES", [
              ...this.$store.getters["activities/allActivities"],
              ...formattedActivities,
            ]);

            this.uploadProgress = 100;
            await this.fetchActivities();

            await Swal.fire({
              title: "Success!",
              text: `Successfully uploaded ${formattedActivities.length} activities.`,
              icon: "success",
              confirmButtonText: "OK",
            });

            this.selectedFile = null;
            if (this.$refs.fileInput) {
              this.$refs.fileInput.value = "";
            }
            this.$emit("close");
          } catch (error) {
            console.error("Error processing file:", error);
            await Swal.fire({
              title: "Error!",
              text: "An error occurred while processing the file. Please try again.",
              icon: "error",
              confirmButtonText: "OK",
            });
          }
        };

        reader.onerror = async (error) => {
          console.error("FileReader error:", error);
          await Swal.fire({
            title: "Error!",
            text: "An error occurred while reading the file. Please try again.",
            icon: "error",
            confirmButtonText: "OK",
          });
        };

        reader.readAsArrayBuffer(this.selectedFile);
      } catch (error) {
        console.error("Error reading file:", error);
      } finally {
        clearInterval(this.progressInterval);
        this.loading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const [day, month, year] = dateString.split("-");
      return `${day}-${month}-${year}`;
    },
  },

  beforeDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  },
};
</script>

<style scoped>
.input-group {
  flex-wrap: nowrap;
}

.dropdown-menu {
  min-width: 200px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

@media (max-width: 767.98px) {
  .btn {
    width: 100%;
  }

  .input-group {
    width: 100%;
  }
}
</style>
