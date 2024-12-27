<template>
  <div>
    <CTable align="middle" responsive hover bordered>
      <CTableHead color="dark">
        <CTableRow>
          <CTableHeaderCell>Date Submitted</CTableHeaderCell>
          <CTableHeaderCell>Kanban No.</CTableHeaderCell>
          <CTableHeaderCell>Machine Name</CTableHeaderCell>
          <CTableHeaderCell>Submitted By</CTableHeaderCell>
          <CTableHeaderCell>Items</CTableHeaderCell>
          <CTableHeaderCell>Status</CTableHeaderCell>
          <CTableHeaderCell>Action</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow v-if="loading">
          <CTableDataCell class="text-center" colspan="7">
            <CSpinner component="span" size="sm" aria-hidden="true" />
            Loading...
          </CTableDataCell>
        </CTableRow>
        <CTableRow v-else-if="paginatedChecksheets.length <= 0">
          <CTableDataCell class="text-center" colspan="7"
            >No submitted checksheets found.</CTableDataCell
          >
        </CTableRow>
        <CTableRow
          v-for="checksheet in paginatedChecksheets"
          :key="checksheet._id"
        >
          <CTableDataCell scope="row">{{
            formatDate(checksheet.created_dt)
          }}</CTableDataCell>
          <CTableDataCell>{{
            getKanbanName(checksheet.kanban_id)
          }}</CTableDataCell>
          <CTableDataCell>{{
            getMachineName(checksheet.kanban_id)
          }}</CTableDataCell>
          <CTableDataCell>{{
            getUserName(checksheet.created_by)
          }}</CTableDataCell>
          <CTableDataCell class="text-center">{{
            checksheet.itemcheck?.length || 0
          }}</CTableDataCell>
          <CTableDataCell class="text-center">
            <CBadge
              :color="getStatusColor(checksheet.work_order?.status)"
              shape="rounded-pill"
            >
              {{ checksheet.work_order?.status || "PENDING" }}
            </CBadge>
          </CTableDataCell>
          <CTableDataCell class="text-center">
            <CButton
              class="text-white"
              style="background-color: blue"
              size="sm"
              @click="viewChecksheet(checksheet)"
              :disabled="checksheet.work_order?.status === 'REVIEWED'"
            >
              Review
            </CButton>
          </CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>

    <!-- Fullscreen Reviewable Check Sheet Modal -->
    <Teleport to="body">
      <CModal
        fullscreen
        :visible="showReviewableChecksheet"
        backdrop="static"
        @close="closeReviewableChecksheet"
      >
        <CModalBody>
          <ReviewableChecksheet
            v-if="selectedChecksheet"
            :checksheet="selectedChecksheet"
            @back="closeReviewableChecksheet"
            @review-submitted="handleReviewSubmitted"
          ></ReviewableChecksheet>
        </CModalBody>
      </CModal>
    </Teleport>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ReviewableChecksheet from "./ReviewableChecksheet.vue";
import api from "../../apis/CommonAPI";
import Swal from "sweetalert2";

export default {
  name: "TableSubmittedChecksheets",

  components: {
    ReviewableChecksheet,
  },

  props: {
    currentPage: {
      type: Number,
      required: true,
    },
    itemsPerPage: {
      type: Number,
      required: true,
    },
    filteredChecksheets: {
      type: Array,
      required: true,
      default: () => [],
    },
    statusFilter: {
      type: String,
      default: "ALL",
    },
  },

  data() {
    return {
      showReviewableChecksheet: false,
      selectedChecksheet: null,
      userMap: new Map(), // Cache for user names
      kanbanMap: new Map(), // Cache for kanban details
      currentLoadPromise: null,
      loading: false,
    };
  },

  computed: {
    ...mapGetters("checksheets", ["allChecksheets", "isLoading"]),

    paginatedChecksheets() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredChecksheets.slice(start, end);
    },
    totalPages() {
      return this.filteredChecksheets
        ? Math.ceil(this.filteredChecksheets.length / this.itemsPerPage)
        : 0;
    },
  },

  watch: {
    totalPages: {
      immediate: true,
      handler(newValue) {
        this.$emit("update:totalPages", newValue);
      },
    },
  },
  mounted() {
    // this.fetchData();
    this.fetchChecksheets();
  },

  methods: {
    ...mapActions("checksheets", ["fetchChecksheets"]),

    async loadDetailsForChecksheets(checksheets) {
      if (!checksheets?.length) return;

      // Get unique IDs not in cache
      const uniqueUserIds = [
        ...new Set(
          checksheets
            .map((c) => c.created_by)
            .filter((id) => !this.userMap.has(id))
        ),
      ];

      const uniqueKanbanIds = [
        ...new Set(
          checksheets
            .map((c) => c.kanban_id)
            .filter((id) => !this.kanbanMap.has(id))
        ),
      ];

      if (!uniqueUserIds.length && !uniqueKanbanIds.length) {
        console.log("All details already cached");
        return;
      }

      this.loading = true;
      try {
        const loadPromise = Promise.all([
          ...uniqueUserIds.map((id) => this.loadUserName(id)),
          ...uniqueKanbanIds.map((id) => this.loadKanbanDetails(id)),
        ]);
        this.currentLoadPromise = loadPromise;

        await loadPromise;

        // // Only process results if this is still the current operation
        // if (this.currentLoadPromise === loadPromise) {
        //   console.log("Details loaded successfully");
        // }
      } catch (error) {
        console.error("Error loading details:", error);
      } finally {
        if (this.currentLoadPromise) {
          this.loading = false;
          this.currentLoadPromise = null;
        }
      }
    },

    formatDate(date) {
      if (!date) return "-";
      const formattedDate = new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }); // Use toLocaleDateString for consistent comparison
      console.log(formattedDate);
      return formattedDate;
    },

    getStatusColor(status) {
      const colors = {
        PENDING: "warning",
        COMPLETED: "success",
        REJECTED: "danger",
      };
      const color = colors[status] || "secondary";
      return color;
    },

    async loadUserName(userId) {
      if (!userId) {
        return "Unknown";
      }

      try {
        // Check if already in cache
        if (this.userMap.has(userId)) {
          const cachedName = this.userMap.get(userId);
          return cachedName;
        }

        const response = await api.get(`/user/list-user?id=${userId}`, "?");

        // Extract username from the response
        const username = response?.data?.data?.username;

        if (username) {
          // Store in cache
          this.userMap.set(userId, username);
          return username;
        }

        return userId;
      } catch (error) {
        console.error("Error fetching user name:", error);
        return userId;
      }
    },

    async loadKanbanDetails(kanbanId) {
      if (!kanbanId) {
        return null;
      }

      try {
        // Check cache first
        if (this.kanbanMap.has(kanbanId)) {
          const cachedKanban = this.kanbanMap.get(kanbanId);
          return cachedKanban;
        }

        const response = await api.get(
          `/kanban/list-kanban?id=${kanbanId}`,
          "?"
        );
        console.log("Kanban API response:", response);

        // Extract kanban from the response
        const kanban = response?.data?.data[0];
        console.log("Extracted kanban:", kanban);

        if (kanban) {
          // Store complete kanban object in cache
          this.kanbanMap.set(kanbanId, {
            kanban_nm: kanban.kanban_nm,
            period: kanban.period,
            machine: {
              machine_nm: kanban.machine?.machine_nm || "-",
            },
            itemcheck: kanban.itemcheck || [],
          });

          return this.kanbanMap.get(kanbanId);
        }

        return null;
      } catch (error) {
        console.error("Error fetching kanban details:", error);
        return null;
      }
    },

    getUserName(userId) {
      const username = this.userMap.get(userId) || userId;
      return username;
    },

    getKanbanName(kanbanId) {
      const kanban = this.kanbanMap.get(kanbanId);
      return kanban?.kanban_nm || kanbanId;
    },

    getMachineName(kanbanId) {
      const kanban = this.kanbanMap.get(kanbanId);
      return kanban?.machine?.machine_nm || "-";
    },

    async viewChecksheet(checksheet) {
      try {
        // Ensure we have kanban details
        if (!this.kanbanMap.has(checksheet.kanban_id)) {
          await this.loadKanbanDetails(checksheet.kanban_id);
        }
        // Ensure we have user details
        if (!this.userMap.has(checksheet.created_by)) {
          await this.loadUserName(checksheet.created_by);
        }

        const kanbanDetails = this.kanbanMap.get(checksheet.kanban_id);
        console.log("Kanban details:", kanbanDetails);
        console.log("Itemcheck from kanban:", kanbanDetails.itemcheck);

        if (!kanbanDetails) {
          throw new Error("Failed to load kanban details");
        }

        this.selectedChecksheet = {
          ...checksheet,
          kanbanNo: kanbanDetails.kanban_nm,
          machineName: kanbanDetails.machine?.machine_nm || "-",
          period: kanbanDetails.period,
          date: this.formatDate(checksheet.created_dt),
          submittedBy: this.getUserName(checksheet.created_by),
          items: checksheet.itemcheck.map((item) => {
            const itemcheckDetails = kanbanDetails.itemcheck.find(
              (i) => i._id === item.itemcheck_id
            );

            return {
              id: item.itemcheck_id,
              part_id: itemcheckDetails?.part_id || null,
              itemCheck: itemcheckDetails.itemcheck_nm || "-",
              period: itemcheckDetails?.period || "-",
              standard: itemcheckDetails?.std || "-",
              minValue: itemcheckDetails?.min || "-",
              maxValue: itemcheckDetails?.max || "-",
              unit: itemcheckDetails?.unit || "-",
              input: item.value,
              ocrValue: item.ocr_value,
              capturedImage: item.filename
                ? `${process.env.VUE_APP_API_URL}/uploads/itemcheck/${item.filename}`
                : null,
              status: null,
              result: this.determineResult(
                item.value,
                itemcheckDetails?.min,
                itemcheckDetails?.max,
                itemcheckDetails?.std
              ),
            };
          }),
        };

        this.showReviewableChecksheet = true;
      } catch (error) {
        console.error("Error viewing checksheet:", error);
        Swal.fire("Error", "Failed to view checksheet", "error");
      }
    },

    determineResult(value, min, max, standard) {
      if (standard === "ok") {
        return value?.toLowerCase() === "ok" ? "OK" : "NG";
      }

      if (standard === "value") {
        const numValue = parseFloat(value);
        const minVal = parseFloat(min);
        const maxVal = parseFloat(max);

        if (isNaN(numValue) || isNaN(minVal) || isNaN(maxVal)) {
          return "NG";
        }

        return numValue >= minVal && numValue <= maxVal ? "OK" : "NG";
      }

      return "NG";
    },

    closeReviewableChecksheet() {
      this.showReviewableChecksheet = false;
      this.selectedChecksheet = null;
    },

    async handleReviewSubmitted() {
      await this.fetchChecksheets();
      this.closeReviewableChecksheet();
      this.$emit("refresh");
    },
  },

  watch: {
    // Replace the existing watch with this optimized version
    filteredChecksheets: {
      immediate: true,
      handler(newChecksheets) {
        // Cancel any existing load operation
        if (this.currentLoadPromise) {
          console.log("Cancelling previous load operation");
          this.currentLoadPromise = null;
        }

        this.loadDetailsForChecksheets(newChecksheets);
      },
    },
  },
};
</script>
