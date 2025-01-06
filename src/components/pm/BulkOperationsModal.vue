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
          <p class="text-muted small">
            Upload your completed Excel template (max 100 schedules)
          </p>

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
                  <span class="text-muted ms-2">{{
                    formatFileSize(selectedFile.size)
                  }}</span>
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
            {{
              loading
                ? `Processing (${progress.processed}/${progress.total})`
                : "Import Schedules"
            }}
          </CButton>

          <!-- Progress Bar (when loading) -->
          <CProgress v-if="loading" class="mt-3">
            <CProgressBar
              :value="(progress.processed / progress.total) * 100"
              color="primary"
            >
              {{ Math.round((progress.processed / progress.total) * 100) }}%
            </CProgressBar>
          </CProgress>
        </CCol>
      </CRow>
    </CModalBody>

    <CModalFooter>
      <CButton color="secondary" @click="$emit('close')">Close</CButton>
    </CModalFooter>
  </CModal>
</template>

<script>
import * as XLSX from "xlsx";
import { mapGetters, mapState } from "vuex";
import Swal from "sweetalert2";

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
      progress: {
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
      },
    };
  },

  computed: {
    ...mapState("schedule", ["kanbans"]),
    ...mapGetters("user", ["allUsers"]),

    activeTeamMembers() {
      return this.allUsers.filter(
        (user) => user.role === "team_member" && !user.deleted_by
      );
    },
  },

  methods: {
    formatFileSize(bytes) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },

    async downloadTemplate() {
      try {
        // Create template structure
        const template = [
          ["Kanban ID", "Date (YYYY-MM-DD)", "User ID", "", "Instructions:"],
          ["= = = START FILLING BELOW THIS ROW = = =", "", "", "", ""],
          ["", "", "", "", "1. Do not modify the column headers"],
          ["", "", "", "", "2. Copy Kanban ID from Column A below"],
          ["", "", "", "", "3. Use date format: YYYY-MM-DD"],
          ["", "", "", "", "4. Maximum 100 schedules per import"],
          [
            "",
            "",
            "",
            "",
            "5. User ID is required - copy from team members list",
          ],
          ["", "", "", "", ""],
          ["", "", "", "", "Available Kanbans:"],
          ["", "", "", "", "Kanban ID | Name | Machine"],

          // Add kanban information
          ...this.kanbans.map((kanban) => [
            "",
            "",
            "",
            "",
            `${kanban._id} | ${kanban.kanban_nm} | ${
              kanban.machine_nm || "No Machine"
            }`,
          ]),

          ["", "", "", "", ""],
          ["", "", "", "", "Available Team Members:"],
          ["", "", "", "", "User ID | Name"],

          // Add team member information
          ...this.activeTeamMembers.map((user) => [
            "",
            "",
            "",
            "",
            `${user._id} | ${user.username}`,
          ]),
        ];

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(template);

        // Apply text format to all cells to prevent Excel auto-formatting
        const range = XLSX.utils.decode_range(ws["!ref"]);
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const dateCell = XLSX.utils.encode_cell({ r: R, c: 1 }); // Column B
          if (!ws[dateCell]) continue;

          // Force text format for date column
          ws[dateCell].t = "s"; // Set cell type to string
          ws[dateCell].z = "@"; // Force text format
        }

        // Set column widths
        ws["!cols"] = [
          { wch: 40 }, // Column A: Kanban ID
          { wch: 15, z: "@" }, // Column B: Date - with text format
          { wch: 40 }, // Column C: User ID
          { wch: 5 }, // Column D: Spacer
          { wch: 80 }, // Column E: Instructions and reference data
        ];

        // Add some styling
        ws["!merges"] = [
          // Merge instruction header cell
          { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } },
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Schedule Template");

        // Generate Excel file
        XLSX.writeFile(wb, "schedule_import_template.xlsx");

        await Swal.fire({
          icon: "success",
          title: "Template Downloaded",
          text: "Your schedule import template has been downloaded.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error downloading template:", error);
        await Swal.fire({
          icon: "error",
          title: "Download Failed",
          text: "Failed to download the template. Please try again.",
        });
      }
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];

      if (!validTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "Please upload an Excel file (.xlsx or .xls).",
        });
        this.clearFile();
        return;
      }

      this.selectedFile = file;
    },

    clearFile() {
      this.selectedFile = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    },

    handleClose() {
      if (this.loading) {
        return;
      }
      this.clearFile();
      this.$emit("close");
    },

    validateSchedule(schedule, rowIndex) {
      const errors = [];

      // Validate Kanban ID
      if (!schedule.kanban_id) {
        errors.push(`Row ${rowIndex}: Kanban ID is required`);
      } else {
        const kanban = this.kanbans.find((k) => k._id === schedule.kanban_id);
        if (!kanban) {
          errors.push(
            `Row ${rowIndex}: Invalid Kanban ID - please copy the exact ID from Column A in the template`
          );
        }
      }

      // Validate Date
      if (!schedule.date) {
        errors.push(`Row ${rowIndex}: Date is required`);
      } else {
        const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
        if (!dateRegex.test(schedule.date)) {
          errors.push(`Row ${rowIndex}: Invalid date format. Use YYYY-MM-DD`);
        } else {
          const [year, month, day] = schedule.date.split("-");
          const inputDate = new Date(year, month - 1, day);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (inputDate < today) {
            errors.push(`Row ${rowIndex}: Cannot schedule tasks in the past`);
          }
        }
      }

      // Validate User ID if provided
      if (schedule.user_id) {
        const userExists = this.activeTeamMembers.some(
          (u) => u._id === schedule.user_id
        );
        if (!userExists) {
          errors.push(
            `Row ${rowIndex}: Invalid User ID - please copy the exact ID from the team members list`
          );
        }
      }

      return errors;
    },

    async processExcelFile() {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

            // Convert to JSON with header row
            const rows = XLSX.utils.sheet_to_json(firstSheet, {
              raw: true,
              defval: "", // Default value for empty cells
              header: ["Kanban ID", "Date (YYYY-MM-DD)", "User ID"],
              range: 2, // Start from row 3 (after headers and marker row)
            });

            console.log("Processed rows:", rows);

            // Process dates manually
            rows.forEach((row) => {
              if (row["Date (YYYY-MM-DD)"]) {
                // Handle different possible date formats
                let date;
                if (typeof row["Date (YYYY-MM-DD)"] === "string") {
                  // Try to parse various date formats
                  if (row["Date (YYYY-MM-DD)"].includes("/")) {
                    const [month, day, year] =
                      row["Date (YYYY-MM-DD)"].split("/");
                    date = new Date(year, month - 1, day);
                  } else {
                    date = new Date(row["Date (YYYY-MM-DD)"]);
                  }
                } else if (typeof row["Date (YYYY-MM-DD)"] === "number") {
                  // Handle Excel date number
                  const excelDate = XLSX.SSF.parse_date_code(
                    row["Date (YYYY-MM-DD)"]
                  );
                  date = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
                }

                if (date && !isNaN(date)) {
                  // Format to YYYY-MM-DD
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  row["Date (YYYY-MM-DD)"] = `${year}-${month}-${day}`;
                }
              }
            });

            console.log("Processed dates:", rows);

            // Remove header and instruction rows
            const schedules = rows
              .filter(
                (row) =>
                  row["Kanban ID"] &&
                  row["Date (YYYY-MM-DD)"] &&
                  row["User ID"] &&
                  !row["Kanban ID"].includes("|") // Skip reference data rows
              )
              .map((row) => ({
                kanban_id: row["Kanban ID"]?.trim(),
                date: row["Date (YYYY-MM-DD)"]?.trim(),
                user_id: row["User ID"]?.trim() || null,
                status: "PLAN",
              }));

            console.log("Processed schedules:", schedules);

            if (schedules.length === 0) {
              throw new Error("No valid schedules found in the file");
            }

            resolve(schedules);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = reject;
        reader.readAsArrayBuffer(this.selectedFile);
      });
    },

    async importSchedules() {
      if (!this.selectedFile) return;

      this.loading = true;
      this.progress = {
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
      };

      try {
        const schedules = await this.processExcelFile();
        this.progress.total = schedules.length;

        // Validate all schedules first
        const allErrors = [];
        schedules.forEach((schedule, index) => {
          const errors = this.validateSchedule(schedule, index + 1);
          allErrors.push(...errors);
        });

        if (allErrors.length > 0) {
          const formattedErrors = allErrors.reduce((acc, error) => {
            const rowMatch = error.match(/Row (\d+)/);
            if (rowMatch) {
              const rowNum = rowMatch[1];
              if (!acc[rowNum]) acc[rowNum] = [];
              acc[rowNum].push(error.replace(`Row ${rowNum}: `, ""));
            }
            return acc;
          }, {});

          const errorMessage = Object.entries(formattedErrors)
            .map(([rowNum, errors]) => `Row ${rowNum}:\n${errors.join("\n")}`)
            .join("\n\n");

          throw new Error(errorMessage);
        }

        console.log("Valid schedules:", schedules);

        // Process valid schedules
        const result = await this.$store.dispatch(
          "schedule/bulkAddWorkOrders",
          schedules
        );

        // Show results
        const message = `
        Successfully imported: ${result.successful}
        Failed: ${result.failed}
        Total: ${result.total}`;
        await Swal.fire({
          icon: result.failed > 0 ? "warning" : "success",
          title: "Import Complete",
          text: message.replace(/\n\s+/g, "\n"),
        });

        if (result.successful > 0) {
          this.$emit("close");
        }
      } catch (error) {
        console.error("Import error:", error);
        await Swal.fire({
          icon: "error",
          title: "Import Failed",
          text: error.message,
        });
      } finally {
        this.loading = false;
      }
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
