<template>
  <Teleport to="body">
    <!-- Details Modal -->
    <CModal size="xl" :visible="visible" @close="$emit('close')">
      <CModalHeader>
        <CModalTitle>Preventive Maintenance (PM)</CModalTitle>
      </CModalHeader>

      <CModalBody v-if="selectedActivity" class="details-modal">
        <!-- Top Cards Section -->
        <CRow class="info-cards mb-4">
          <!-- Basic Information Card -->
          <CCol :xs="12" :sm="6" :lg="4">
            <CCard class="info-card h-100">
              <CCardBody>
                <h6 class="section-title mb-3">Basic Information</h6>
                <div class="mb-3">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <h3 class="kanban-title mb-0">
                      {{ selectedActivity.kanbanNo }}
                    </h3>
                    <CBadge
                      :color="getStatusColor(selectedActivity.status)"
                      class="status-badge"
                      >{{ selectedActivity.status }}</CBadge
                    >
                  </div>
                </div>
                <div class="info-details">
                  <div class="info-item">
                    <CIcon icon="cil-user" />
                    <span>{{
                      selectedActivity.assignedToName ||
                      selectedActivity.assignedTo
                    }}</span>
                  </div>
                  <div class="info-item">
                    <CIcon icon="cil-calendar" />
                    <span>Period {{ selectedActivity.period }}</span>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>

          <!-- Machine Details Card -->
          <CCol :xs="12" :sm="6" :lg="4">
            <CCard class="info-card h-100">
              <CCardBody>
                <h6 class="section-title mb-3">Machine Details</h6>
                <div class="machine-name mb-3">
                  {{ selectedActivity.machineName }}
                </div>
                <div class="info-details">
                  <div class="info-item">
                    <CIcon icon="cil-clock" /><span
                      >Next Check:
                      {{ formatDate(selectedActivity.next_check_dt) }}</span
                    >
                  </div>
                  <div class="info-item">
                    <CIcon icon="cil-history" /><span
                      >Last Check:
                      {{ formatDate(selectedActivity.last_check_dt) }}</span
                    >
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>

          <!-- Action Buttons -->
          <CCol :xs="12" :lg="4" class="d-flex align-items-center mt-3">
            <div class="action-buttons">
              <CButton
                color="danger"
                class="action-btn"
                variant="outline"
                @click="openDelayModal"
              >
                <CIcon icon="cil-x" size="lg"></CIcon>
                <span>Can't Execute</span>
              </CButton>
              <CButton
                color="success"
                class="action-btn"
                @click="openCheckSheet"
              >
                <CIcon icon="cil-task" size="lg"></CIcon>
                <span>Execute</span>
              </CButton>
            </div>
          </CCol>
        </CRow>

        <!-- Resource Section: Tools & Spare Parts -->
        <CRow class="resources-section mb-4">
          <!-- Tools Card -->
          <CCol :xs="12" :md="6" class="mb-3">
            <CCard class="resource-card">
              <CCardHeader
                class="d-flex justify-content-between align-items-center"
              >
                <h6 class="mb-0">Required Tools</h6>
                <CBadge
                  :color="toolsStatus ? 'success' : 'danger'"
                  class="availability-badge"
                >
                  {{ toolsStatus ? "All Available" : "Missing Items" }}
                </CBadge>
              </CCardHeader>
              <CCardBody class="p-0">
                <CListGroup flush>
                  <CListGroupItem
                    v-for="tool in requiredTools"
                    :key="tool._id"
                    class="resource-item"
                    :class="getResourceItemClass(tool.stock >= tool.quantity)"
                  >
                    <div
                      class="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div class="resource-name">{{ tool.tool_nm }}</div>
                        <div class="resource-quantity">
                          Required for {{ tool.quantity }} check(s)
                        </div>
                      </div>
                      <CBadge
                        :color="
                          tool.stock >= tool.quantity ? 'success' : 'danger'
                        "
                        class="stock-badge"
                      >
                        Stock: {{ tool.stock }}
                      </CBadge>
                    </div>
                  </CListGroupItem>
                </CListGroup>
              </CCardBody>
            </CCard>
          </CCol>

          <!-- Spare Parts Card -->
          <CCol :xs="12" :md="6">
            <CCard class="resource-card">
              <CCardHeader
                class="d-flex justify-content-between align-items-center"
              >
                <h6 class="mb-0">Required Spare Parts</h6>
                <CBadge :color="sparePartsStatus ? 'success' : 'danger'">
                  {{ sparePartsStatus ? "All Available" : "Missing Items" }}
                </CBadge>
              </CCardHeader>
              <CCardBody class="p-0">
                <CListGroup flush>
                  <CListGroupItem
                    v-for="part in requiredSpareParts"
                    :key="part._id"
                    class="resource-item"
                    :class="getResourceItemClass(part.stock >= part.quantity)"
                  >
                    <div
                      class="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div class="resource-name">
                          {{ part.spare_part_nm }}
                        </div>
                        <div class="resource-quantity">
                          Required for {{ part.quantity }} check(s)
                        </div>
                      </div>
                      <CBadge
                        :color="
                          part.stock >= part.quantity ? 'success' : 'danger'
                        "
                        class="stock-badge"
                      >
                        Stock: {{ part.stock }} {{ part.unit }}
                      </CBadge>
                    </div>
                  </CListGroupItem>
                </CListGroup>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        <!-- Documentation Section -->
        <div class="documentation-section">
          <h6 class="section-title mb-3">Documentation</h6>
          <CButton
            color="primary"
            variant="outline"
            class="doc-button"
            @click="openSOP"
          >
            <CIcon icon="cil-description" />
            <span>Open SOP Document</span>
          </CButton>
        </div>
      </CModalBody>
    </CModal>

    <!-- Fullscreen Editable Check Sheet Modal -->
    <CModal
      fullscreen
      :visible="showEditableCheckSheet"
      backdrop="static"
      @close="closeEditableCheckSheet"
    >
      <CModalBody>
        <EditableChecksheet
          v-if="selectedActivity"
          :activity="selectedActivity"
          @submit="submitChecksheet"
          @cancel="closeEditableCheckSheet"
        ></EditableChecksheet>
      </CModalBody>
    </CModal>
  </Teleport>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import Swal from "sweetalert2";
import EditableChecksheet from "./EditableChecksheet.vue";

export default {
  name: "DetailsModal",
  components: {
    EditableChecksheet,
  },
  props: {
    visible: Boolean,
  },
  emits: ["close", "closeDetailsModal", "openDelayModal", "openSOP"],
  data() {
    return {
      loading: true,
      result: "",
      error: null,
      showEditableCheckSheet: false,
      toolsAvailability: {},
      sparePartsAvailability: {},
    };
  },
  watch: {},
  computed: {
    ...mapGetters("activities", ["selectedActivity"]),

    // Get unique tools needed for all itemchecks
    requiredTools() {
      if (!this.selectedActivity?.itemcheck) return [];

      // Get unique tools from itemchecks and count their occurrences
      const toolRequirements = {};

      this.selectedActivity.itemcheck.forEach((item) => {
        if (item.tools_id) {
          if (!toolRequirements[item.tools_id]) {
            const tool = this.selectedActivity.tools.find(
              (t) => t._id === item.tools_id
            );
            if (tool) {
              toolRequirements[item.tools_id] = {
                count: 1,
                tool: JSON.parse(JSON.stringify(tool)), // Create plain object
              };
            }
          } else {
            toolRequirements[item.tools_id].count++;
          }
        }
      });

      // Map to final format
      return Object.values(toolRequirements)
        .filter((req) => req.tool) // Filter out any undefined tools
        .map((req) => ({
          _id: req.tool._id,
          tool_nm: req.tool.tool_nm,
          quantity: req.count, // Required quantity based on itemcheck count
          stock: req.tool.quantity, // Warehouse stock from tools array
          available: this.toolsAvailability[req.tool._id]?.available || false,
        }));
    },

    // Get unique spare parts needed for all itemchecks
    requiredSpareParts() {
      if (!this.selectedActivity?.itemcheck) return [];

      // Get unique spare parts from itemchecks and count their occurrences
      const partRequirements = {};

      this.selectedActivity.itemcheck.forEach((item) => {
        if (item.spare_part_id) {
          if (!partRequirements[item.spare_part_id]) {
            const part = this.selectedActivity.spare_parts.find(
              (p) => p._id === item.spare_part_id
            );
            if (part) {
              partRequirements[item.spare_part_id] = {
                count: 1,
                part: JSON.parse(JSON.stringify(part)), // Create plain object
              };
            }
          } else {
            partRequirements[item.spare_part_id].count++;
          }
        }
      });

      // Map to final format
      return Object.values(partRequirements)
        .filter((req) => req.part) // Filter out any undefined parts
        .map((req) => ({
          _id: req.part._id,
          spare_part_nm: req.part.spare_part_nm,
          quantity: req.count, // Required quantity based on itemcheck count
          stock: req.part.quantity, // Warehouse stock from spare_part array
          unit: req.part.unit,
          available:
            this.sparePartsAvailability[req.part._id]?.available || false,
        }));
    },

    // Check overall availability
    toolsStatus() {
      return this.requiredTools.every((tool) => tool.stock >= tool.quantity);
    },

    sparePartsStatus() {
      return this.requiredSpareParts?.length > 0
        ? this.requiredSpareParts.every((part) => part.stock >= part.quantity)
        : true;
    },
  },

  methods: {
    // Modal controls
    openDelayModal() {
      this.$emit("openDelayModal");
    },

    openCheckSheet() {
      this.showEditableCheckSheet = true;
      this.$emit("close");
    },

    openSOP() {
      this.$emit("openSOP");
    },

    closeEditableCheckSheet() {
      this.showEditableCheckSheet = false;
    },

    // Checksheet submission
    async submitChecksheet(checksheetData) {
      try {
        await this.$store.dispatch(
          "checksheets/submitChecksheet",
          checksheetData
        );
        this.closeEditableCheckSheet();
        Swal.fire({
          icon: "success",
          title: "Checksheet Submitted",
          text: "The checksheet has been successfully submitted.",
        });
        // Optionally, you might want to refresh the activity data or update its status
        // await this.$store.dispatch('activities/fetchActivities');
      } catch (error) {
        console.error("Error submitting checksheet:", error);
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: "There was an error submitting the checksheet. Please try again.",
        });
      }
    },

    formatDate(dateString) {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString("default", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    getStatusColor(status) {
      switch (status?.toUpperCase()) {
        case "COMPLETED":
          return "success";
        case "IN PROGRESS":
          return "info";
        case "PLAN":
          return "warning";
        case "DELAY":
          return "danger";
        default:
          return "secondary";
      }
    },

    getResourceItemClass(stockLevel, requiredQuantity) {
      return {
        available: stockLevel >= requiredQuantity,
        unavailable: stockLevel < requiredQuantity,
        "resource-item": true,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.details-modal {
  // Base styles
  .section-title {
    color: #6c757d;
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-card {
    background: #fff;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .kanban-title {
      font-size: 1.5rem;
      font-weight: 600;
    }

    .machine-name {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .info-details {
      .info-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        color: #6c757d;

        :deep(svg) {
          width: 16px;
          height: 16px;
        }
      }
    }
  }

  .status-badge {
    padding: 0.35rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    width: 100%;

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      flex: 1;

      :deep(svg) {
        width: 24px;
        height: 24px;
      }
    }
  }

  .resource-card {
    height: 100%;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .card-header {
      background: transparent;
      border-bottom: 1px solid #e9ecef;
      padding: 1rem;
    }

    .resource-item {
      border: none;
      border-left: 4px solid transparent;
      padding: 1rem;
      transition: all 0.2s ease;

      &.available {
        border-left-color: var(--cui-success);
      }

      &.unavailable {
        border-left-color: var(--cui-danger);
      }

      .resource-name {
        font-weight: 500;
        margin-bottom: 0.25rem;
      }

      .resource-quantity {
        font-size: 0.875rem;
        color: #6c757d;
      }

      .stock-badge {
        padding: 0.35rem 0.75rem;
        font-size: 0.75rem;
      }
    }
  }

  .documentation-section {
    .doc-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;

      :deep(svg) {
        width: 20px;
        height: 20px;
      }
    }
  }

  // Extra Small devices (max 575px)
  @media (max-width: 575.98px) {
    padding: 0.75rem !important;

    .info-cards {
      margin-bottom: 0.75rem;
    }

    .info-card {
      margin-bottom: 0.75rem;
    }

    .action-buttons {
      flex-direction: column;
      margin-top: 0.75rem;
    }

    .resource-card {
      margin-bottom: 0.75rem;

      .resource-item {
        padding: 0.75rem;
      }
    }
  }

  // Small devices (576px - 767px)
  @media (min-width: 576px) and (max-width: 767.98px) {
    padding: 1rem !important;

    .action-buttons {
      flex-direction: row;
      margin-top: 1rem;
    }
  }

  // Medium devices (768px - 991px)
  @media (min-width: 768px) and (max-width: 991.98px) {
    padding: 1.25rem !important;

    .info-cards {
      margin-bottom: 1.25rem;
    }

    .resource-card {
      height: 100%;
    }
  }

  // Large devices (992px - 1199px)
  @media (min-width: 992px) and (max-width: 1199.98px) {
    .info-card,
    .resource-card {
      height: 100%;
    }

    .action-buttons {
      height: 100%;
      align-items: center;
    }
  }

  // X-Large devices (1200px - 1399px)
  @media (min-width: 1200px) and (max-width: 1399.98px) {
    .info-card {
      min-height: 200px;
    }
  }

  // XX-Large devices (1400px+)
  @media (min-width: 1400px) {
    padding: 1.5rem !important;

    .info-card {
      min-height: 220px;
    }

    .action-buttons .action-btn {
      padding: 1.25rem;
    }
  }
}
</style>
