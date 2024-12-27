<template>
  <CModal :visible="visible" @close="$emit('close')" size="lg">
    <CModalHeader>
      <CModalTitle>Bulk Schedule Operations</CModalTitle>
    </CModalHeader>

    <CModalBody>
      <CRow>
        <!-- Download Template Section -->
        <CCol :xs="12" class="mb-4">
          <h6>Download Template</h6>
          <p class="text-muted small">
            Download the Excel template for bulk schedule import
          </p>
          <CButton color="success" @click="downloadTemplate">
            <CIcon icon="cil-cloud-download" class="me-2" />
            Download Template
          </CButton>
        </CCol>

        <!-- Upload Section -->
        <CCol :xs="12">
          <h6>Import Schedules</h6>
          <p class="text-muted small">Upload your completed Excel template</p>

          <div class="border rounded p-3 mb-3">
            <input
              type="file"
              ref="fileInput"
              class="d-none"
              accept=".xlsx,.xls"
              @change="handleFileUpload"
            />
            <div class="text-center">
              <CButton
                color="primary"
                @click="$refs.fileInput.click()"
                :disabled="loading"
              >
                <CIcon icon="cil-cloud-upload" class="me-2" />
                Select Excel File
              </CButton>
            </div>

            <!-- File Preview -->
            <div v-if="selectedFile" class="mt-3">
              <div
                class="d-flex align-items-center justify-content-between bg-light p-2 rounded"
              >
                <div>
                  <CIcon icon="cil-file" class="me-2" />
                  {{ selectedFile.name }}
                </div>
                <CButton
                  color="danger"
                  variant="ghost"
                  size="sm"
                  @click="clearFile"
                >
                  <CIcon icon="cil-x" />
                </CButton>
              </div>
            </div>
          </div>

          <!-- Import Button -->
          <CButton
            color="primary"
            class="w-100"
            @click="importSchedules"
            :disabled="!selectedFile || loading"
          >
            <CSpinner v-if="loading" size="sm" class="me-2" />
            {{ loading ? "Processing..." : "Import Schedules" }}
          </CButton>
        </CCol>
      </CRow>

      <!-- Validation Results -->
      <div v-if="validationResults.length" class="mt-4">
        <h6>Validation Results</h6>
        <div class="validation-results">
          <div
            v-for="(result, index) in validationResults"
            :key="index"
            class="alert"
            :class="result.type === 'error' ? 'alert-danger' : 'alert-warning'"
          >
            <div>
              <strong>Row {{ result.row }}:</strong> {{ result.message }}
            </div>
          </div>
        </div>
      </div>
    </CModalBody>

    <CModalFooter>
      <CButton color="secondary" @click="$emit('close')">Close</CButton>
    </CModalFooter>
  </CModal>
</template>

<script>
import * as XLSX from "xlsx";
import { mapGetters, mapState } from "vuex";
import { toast } from "vue-sonner";

export default {
  name: "BulkOperationsModal",

  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      selectedFile: null,
      loading: false,
      validationResults: [],
    };
  },

  computed: {
    ...mapState("schedule", ["kanbans"]),
    ...mapGetters("user", ["allUsers"]),
  },

  methods: {
    async downloadTemplate() {
      try {
        // Create template structure
        const template = [
          ["Kanban ID", "Date (DD-MM-YYYY)", "User ID (Optional)"],
          ["", "Example: 25-12-2024", ""],
          ["Instructions:", "", ""],
          ["1. Do not modify the header row", "", ""],
          ["2. Fill in the Kanban ID from the list below", "", ""],
          ["3. Use the exact date format: DD-MM-YYYY", "", ""],
          ["4. User ID is optional - leave blank for unassigned tasks", "", ""],
          ["", "", ""],
        ];

        // Add available kanbans info
        if (this.kanbans.length) {
          template.push(["Available Kanban IDs:"]);
          this.kanbans.forEach((kanban) => {
            template.push([
              `${kanban._id} - ${kanban.kanban_nm} (${
                kanban.machine_nm || "No Machine"
              })`,
            ]);
          });
        }

        // Add available users info
        if (this.allUsers.length) {
          template.push(["", "", ""]);
          template.push(["Available User IDs:"]);
          this.allUsers
            .filter((user) => user.role === "team_member" && !user.deleted_by)
            .forEach((user) => {
              template.push([`${user._id} - ${user.username}`]);
            });
        }

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(template);

        // Add some styling
        ws["!cols"] = [
          { wch: 40 }, // Kanban ID column width
          { wch: 20 }, // Date column width
          { wch: 40 }, // User ID column width
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Schedule Template");

        // Generate Excel file
        XLSX.writeFile(wb, "schedule_import_template.xlsx");
        toast.success("Template downloaded successfully");
      } catch (error) {
        console.error("Error downloading template:", error);
        toast.error("Failed to download template");
      }
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.validationResults = []; // Clear previous validation results
      }
    },

    clearFile() {
      this.selectedFile = null;
      this.validationResults = [];
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    },

    validateRow(row, rowIndex) {
      const results = [];

      // Skip empty rows and reference data
      if (!row["Kanban ID"] || row["Kanban ID"].includes("-")) {
        return results;
      }

      // Validate Kanban ID
      if (!row["Kanban ID"]) {
        results.push({
          row: rowIndex + 2, // +2 for header row and 1-based indexing
          type: "error",
          message: "Kanban ID is required",
        });
      } else if (!this.kanbans.find((k) => k._id === row["Kanban ID"].trim())) {
        results.push({
          row: rowIndex + 2,
          type: "error",
          message: "Invalid Kanban ID",
        });
      }

      // Validate Date
      if (!row["Date (DD-MM-YYYY)"]) {
        results.push({
          row: rowIndex + 2,
          type: "error",
          message: "Date is required",
        });
      } else {
        const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
        if (!dateRegex.test(row["Date (DD-MM-YYYY)"].trim())) {
          results.push({
            row: rowIndex + 2,
            type: "error",
            message: "Invalid date format. Use DD-MM-YYYY",
          });
        } else {
          // Validate date is not in the past
          const [day, month, year] = row["Date (DD-MM-YYYY)"].split("-");
          const inputDate = new Date(year, month - 1, day);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (inputDate < today) {
            results.push({
              row: rowIndex + 2,
              type: "error",
              message: "Cannot schedule tasks in the past",
            });
          }
        }
      }

      // Validate User ID if provided
      const userId = row["User ID (Optional)"]?.trim();
      if (userId && !this.allUsers.find((u) => u._id === userId)) {
        results.push({
          row: rowIndex + 2,
          type: "warning",
          message: "Invalid User ID - will be set as unassigned",
        });
      }

      return results;
    },

    async importSchedules() {
      if (!this.selectedFile) return;

      this.loading = true;
      this.validationResults = [];

      try {
        const data = await this.readExcelFile(this.selectedFile);

        // Validate all rows first
        let allValidationResults = [];
        const validRows = [];

        data.forEach((row, index) => {
          // Skip empty rows and reference data
          if (!row["Kanban ID"] || row["Kanban ID"].includes("-")) {
            return;
          }

          const rowResults = this.validateRow(row, index);
          allValidationResults = [...allValidationResults, ...rowResults];

          // If no errors (warnings are ok), add to valid rows
          if (!rowResults.some((r) => r.type === "error")) {
            validRows.push(row);
          }
        });

        this.validationResults = allValidationResults;

        // Only proceed if there are valid rows
        if (validRows.length === 0) {
          toast.error("No valid schedules found to import");
          return;
        }

        // Process valid rows
        const schedules = validRows.map((row) => ({
          kanban_id: row["Kanban ID"].trim(),
          date: row["Date (DD-MM-YYYY)"].trim(),
          user_id: row["User ID (Optional)"]?.trim() || null,
          status: "PLAN",
        }));

        // Call Vuex action to handle bulk import
        const result = await this.$store.dispatch(
          "schedule/bulkAddWorkOrders",
          schedules
        );

        toast.success(`Successfully imported ${result.successful} schedules`);
        if (result.failed > 0) {
          toast.error(`Failed to import ${result.failed} schedules`);
        }

        this.$emit("close");
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import schedules");
      } finally {
        this.loading = false;
      }
    },

    async readExcelFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            // Get first worksheet
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            // Convert to JSON with header row
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              raw: false,
              defval: "", // Default value for empty cells
            });

            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    },
  },
};
</script>

<style scoped>
.validation-results {
  max-height: 200px;
  overflow-y: auto;
}

.alert {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
}

.modal-body {
  max-height: 80vh;
  overflow-y: auto;
}
</style>
