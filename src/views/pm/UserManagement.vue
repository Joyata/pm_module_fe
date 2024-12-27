<template>
  <div>
    <CRow>
      <CCol :md="12">
        <CCard class="mb-4">
          <CCardHeader>
            <CCardTitle>User Management</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CRow class="mb-3">
              <CCol xs="12" md="6" lg="4">
                <CInputGroup>
                  <CInputGroupText as="label" for="roleSelect">
                    <CIcon icon="cil-people" class="flex-shrink-0 me-2"></CIcon>
                    Role
                  </CInputGroupText>
                  <CFormSelect
                    id="roleSelect"
                    v-model="selectedRole"
                    name="role"
                    :options="roleOptions"
                    @change="onRoleChange"
                  >
                    <option value="" disabled selected>Select Role</option>
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
                  class="d-inline-flex align-items-center text-white"
                  @click="openAddModal"
                >
                  <CIcon icon="cil-plus" class="flex-shrink-0 me-2"></CIcon>
                  Add User
                </CButton>
              </CCol>
            </CRow>

            <!-- Table Component -->
            <TableUsers
              :users="paginatedUsers"
              :loading="loading"
              :isSubmitting="isSubmitting"
              @fetch-users="fetchUsersList"
              @edit-user="openEditModal"
              @delete-user="handleDeleteUser"
            ></TableUsers>

            <!-- Pagination -->
            <CPagination
              v-if="totalPages > 1"
              align="end"
              class="mt-3"
              aria-label="Page navigation"
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

    <!-- Add User Modal -->
    <CModal size="lg" :visible="showAddModal" @close="closeAddModal">
      <CModalHeader>
        <CModalTitle>Add New User</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div class="px-2">
          <CFormInput
            class="mb-3"
            v-model="newUser.username"
            label="Username"
            placeholder="Enter username"
            :state="isValidUsername"
            :feedback="usernameFeedback"
            required
          />
          <CFormSelect
            class="mb-3"
            v-model="newUser.role"
            label="Role"
            :state="isValidRole"
            :feedback="roleFeedback"
            required
          >
            <option value="" disabled selected>Select Role</option>
            <option value="admin">Admin</option>
            <option value="team_leader">Team Leader</option>
            <option value="team_member">Team Member</option>
          </CFormSelect>

          <!-- Assignments Section -->
          <div class="mb-3">
            <label class="form-label">Assignments:</label>
            <CInputGroup class="mb-2">
              <CInputGroupText
                class="justify-content-center"
                style="width: 70px"
                >Plant</CInputGroupText
              >
              <CFormSelect
                v-model="newUser.assignments.plant"
                :options="plantOptions"
                @change="(e) => onPlantChange(e, 'new')"
              >
              </CFormSelect>
            </CInputGroup>

            <CInputGroup class="mb-2">
              <CInputGroupText
                class="justify-content-center"
                style="width: 70px"
                >Shop</CInputGroupText
              >
              <CFormSelect
                v-model="newUser.assignments.shop"
                :disabled="!newUser.assignments.plant"
                :options="shopOptions"
                @change="(e) => onShopChange(e, 'new')"
              >
              </CFormSelect>
            </CInputGroup>

            <CInputGroup class="mb-2">
              <CInputGroupText
                class="justify-content-center"
                style="width: 70px"
                >Line</CInputGroupText
              >
              <CFormSelect
                v-model="newUser.assignments.line"
                :disabled="!newUser.assignments.shop"
                :options="lineOptions"
                @change="(e) => onLineChange(e, 'new')"
              >
              </CFormSelect>
            </CInputGroup>

            <CInputGroup class="mb-2">
              <CInputGroupText
                class="justify-content-center"
                style="width: 70px"
                >Station</CInputGroupText
              >
              <CFormSelect
                v-model="newUser.assignments.station"
                :disabled="!newUser.assignments.line"
                :options="stationOptions"
              >
              </CFormSelect>
            </CInputGroup>
          </div>

          <CFormSwitch
            class="mb-3"
            v-model="newUser.is_active"
            label="Active"
            id="userActiveSwitch"
          />
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closeAddModal">Close</CButton>
        <CButton
          color="primary"
          @click="handleAddUser"
          :disabled="!isFormValid || isSubmitting"
        >
          {{ isSubmitting ? "Adding..." : "Add User" }}
        </CButton>
      </CModalFooter>
    </CModal>

    <!-- Edit User Modal -->
    <CModal size="lg" :visible="showEditModal" @close="closeEditModal">
      <CModalHeader>
        <CModalTitle>Edit User</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div class="px-2">
          <CFormInput
            class="mb-3"
            v-model="editUser.username"
            label="Username"
            :state="isValidEditUsername"
            :feedback="editUsernameFeedback"
            required
          />
          <CFormSelect
            class="mb-3"
            v-model="editUser.role"
            label="Role"
            :state="isValidEditRole"
            :feedback="editRoleFeedback"
            required
          >
            <option value="" disabled>Select Role</option>
            <option value="admin">Admin</option>
            <option value="team_leader">Team Leader</option>
            <option value="team_member">Team Member</option>
          </CFormSelect>

          <!-- Assignments Section -->
          <div class="mb-3">
            <label class="form-label">Assignments</label>
            <CInputGroup class="mb-2">
              <CInputGroupText
                class="justify-content-center"
                style="width: 70px"
                >Plant</CInputGroupText
              >
              <CFormSelect
                v-model="editUser.assignments.plant"
                :options="plantOptions"
                @change="(e) => onPlantChange(e, 'edit')"
              >
              </CFormSelect>
            </CInputGroup>

            <CInputGroup class="mb-2">
              <CInputGroupText
                class="justify-content-center"
                style="width: 70px"
                >Shop</CInputGroupText
              >
              <CFormSelect
                v-model="editUser.assignments.shop"
                :disabled="!editUser.assignments.plant"
                :options="shopOptions"
                @change="(e) => onShopChange(e, 'edit')"
              >
              </CFormSelect>
            </CInputGroup>

            <CInputGroup class="mb-2">
              <CInputGroupText
                class="justify-content-center"
                style="width: 70px"
                >Line</CInputGroupText
              >
              <CFormSelect
                v-model="editUser.assignments.line"
                :disabled="!editUser.assignments.shop"
                :options="lineOptions"
                @change="(e) => onLineChange(e, 'edit')"
              >
              </CFormSelect>
            </CInputGroup>

            <CInputGroup>
              <CInputGroupText
                class="justify-content-center"
                style="width: 70px"
                >Station</CInputGroupText
              >
              <CFormSelect
                v-model="editUser.assignments.station"
                :disabled="!editUser.assignments.line"
                :options="stationOptions"
              >
              </CFormSelect>
            </CInputGroup>
          </div>

          <CFormSwitch
            class="mb-3"
            v-model="editUser.is_active"
            label="Active"
            id="editUserActiveSwitch"
          />
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closeEditModal"> Close </CButton>
        <CButton
          color="primary"
          @click="handleEditUser"
          :disabled="!isEditFormValid || isSubmitting"
        >
          {{ isSubmitting ? "Saving..." : "Save Changes" }}
        </CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import TableUsers from "../../components/pm/TableUsers.vue";
import Swal from "sweetalert2";
import api from "../../apis/CommonAPI";

export default {
  name: "UserManagement",

  components: {
    TableUsers,
  },

  data() {
    return {
      selectedRole: "",
      showAddModal: false,
      showEditModal: false,
      isSubmitting: false,
      currentPage: 1,
      itemsPerPage: 5,

      // Form data
      newUser: {
        username: "",
        password: "Toyota123", // Default password
        role: "",
        is_active: true,
        assignments: {
          plant: "",
          shop: "",
          line: "",
          station: "",
        },
      },
      editUser: {
        _id: "",
        username: "",
        role: "",
        is_active: null,
        assignments: {
          plant: "",
          shop: "",
          line: "",
          station: "",
        },
      },

      // Location options
      plantOptions: [
        { value: "", label: "Select Plant", disabled: true, selected: true },
      ],
      shopOptions: [
        { value: "", label: "Select Shop", disabled: true, selected: true },
      ],
      lineOptions: [
        { value: "", label: "Select Line", disabled: true, selected: true },
      ],
      stationOptions: [
        { value: "", label: "Select Station", disabled: true, selected: true },
      ],
    };
  },

  computed: {
    ...mapState("user", ["users", "loading", "locationNames"]),
    ...mapGetters("user", ["getLocationName"]),

    paginatedUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredUsers.slice(start, end);
    },

    filteredUsers() {
      console.log("🔍 All users before filtering:", this.users);

      if (!this.selectedRole || this.selectedRole === "all") {
        console.log("📋 Returning all users:", this.users);
        return this.users;
      }

      return this.users.filter((user) => user.role === this.selectedRole);
    },

    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    },

    roleOptions() {
      return [
        { value: "", label: "Select Role", disabled: true, selected: true },
        { value: "all", label: "All" },
        { value: "admin", label: "Admin" },
        { value: "team_leader", label: "Team Leader" },
        { value: "team_member", label: "Team Member" },
      ];
    },

    // Form validation computed properties
    isValidUsername() {
      return this.newUser.username.length >= 3;
    },

    usernameFeedback() {
      return !this.isValidUsername
        ? "Username must be at least 3 characters"
        : "";
    },

    isValidPassword() {
      return this.newUser.password.length >= 8;
    },

    passwordFeedback() {
      return !this.isValidPassword
        ? "Password must be at least 8 characters"
        : "";
    },

    isValidRole() {
      return this.newUser.role && this.newUser.role !== "";
    },

    roleFeedback() {
      return !this.isValidRole ? "Please select a role" : "";
    },

    isFormValid() {
      return (
        this.isValidUsername &&
        this.isValidPassword &&
        this.isValidRole &&
        this.newUser.role !== ""
      );
    },

    // Edit form validation
    isValidEditUsername() {
      return this.editUser.username.length >= 3;
    },
    editUsernameFeedback() {
      return !this.isValidEditUsername
        ? "Username must be at least 3 characters"
        : "";
    },

    isValidEditRole() {
      return !!this.editUser.role;
    },
    editRoleFeedback() {
      return !this.isValidEditRole ? "Please select a role" : "";
    },

    isEditFormValid() {
      return this.isValidEditUsername && this.isValidEditRole;
    },
  },

  methods: {
    ...mapActions("user", [
      "fetchUsers",
      "createUser",
      "updateUser",
      "deleteUser",
      "fetchLocationName",
    ]),

    // Location selection handling
    async fetchLocationOptions(type, parentId = null) {
      try {
        let url = `/asset/list-asset?collection=${type}`;
        if (parentId) {
          url += `&parent_id=${parentId}`;
        }

        console.log(`Fetching ${type} with URL:`, url);

        const response = await api.get(url, "?");

        if (response?.data?.status === 200) {
          console.log(`Response for ${type}:`, response.data);
          const mappedData = response.data.data.map((item) => ({
            value: item._id,
            label: item[`${type}_nm`],
          }));
          console.log(`Mapped ${type} options:`, mappedData);
          return mappedData;
        }
        return [];
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        return [];
      }
    },

    resetDependentFields(level, form = "new") {
      const target = form === "new" ? this.newUser : this.editUser;

      switch (level) {
        case "plant":
          target.assignments.shop = "";
          target.assignments.line = "";
          target.assignments.station = "";
          this.shopOptions = [
            { value: "", label: "Select Shop", disabled: true, selected: true },
          ];
          this.lineOptions = [
            { value: "", label: "Select Line", disabled: true, selected: true },
          ];
          this.stationOptions = [
            {
              value: "",
              label: "Select Station",
              disabled: true,
              selected: true,
            },
          ];
          break;
        case "shop":
          target.assignments.line = "";
          target.assignments.station = "";
          this.lineOptions = [
            { value: "", label: "Select Line", disabled: true, selected: true },
          ];
          this.stationOptions = [
            {
              value: "",
              label: "Select Station",
              disabled: true,
              selected: true,
            },
          ];
          break;
        case "line":
          target.assignments.station = "";
          this.stationOptions = [
            {
              value: "",
              label: "Select Station",
              disabled: true,
              selected: true,
            },
          ];
          break;
      }
    },

    async onPlantChange(event, form = "new") {
      const value = event.target.value;
      console.log("Plant changed event value:", value);

      const target = form === "new" ? this.newUser : this.editUser;
      target.assignments.plant = value; // Set the value explicitly

      this.resetDependentFields("plant", form);

      if (value) {
        console.log("Fetching shops for plant:", value);
        const shops = await this.fetchLocationOptions("shop", value);
        console.log("Fetched shops:", shops);
        this.shopOptions = [
          { value: "", label: "Select Shop", disabled: true, selected: true },
          ...shops,
        ];
      }
    },

    async onShopChange(event, form = "new") {
      const value = event.target.value;
      console.log("Shop changed event value:", value);

      const target = form === "new" ? this.newUser : this.editUser;
      target.assignments.shop = value;

      this.resetDependentFields("shop", form);

      if (value) {
        console.log("Fetching lines for shop:", value);
        const lines = await this.fetchLocationOptions("line", value);
        console.log("Fetched lines:", lines);
        this.lineOptions = [
          { value: "", label: "Select Line", disabled: true, selected: true },
          ...lines,
        ];
      }
    },

    async onLineChange(event, form = "new") {
      const value = event.target.value;
      console.log("Line changed event value:", value);

      const target = form === "new" ? this.newUser : this.editUser;
      target.assignments.line = value;

      this.resetDependentFields("line", form);

      if (value) {
        console.log("Fetching stations for line:", value);
        const stations = await this.fetchLocationOptions("station", value);
        console.log("Fetched stations:", stations);
        this.stationOptions = [
          {
            value: "",
            label: "Select Station",
            disabled: true,
            selected: true,
          },
          ...stations,
        ];
      }
    },

    async openAddModal() {
      this.showAddModal = true;
      const plants = await this.fetchLocationOptions("plant");
      this.plantOptions = [
        { value: "", label: "Select Plant", disabled: true, selected: true },
        ...plants,
      ];
    },

    async openEditModal(user) {
      console.log("Opening edit modal for user:", user);
      console.log("User assignments:", user.assignments);

      // First ensure we have a clean assignments object
      const assignments = {
        plant: user.assignments?.plant || "",
        shop: user.assignments?.shop || "",
        line: user.assignments?.line || "",
        station: user.assignments?.station || "",
      };

      // Set initial user data
      this.editUser = {
        _id: user._id,
        username: user.username,
        role: user.role,
        is_active: user.is_active ?? false,
        assignments, // Use the cleaned assignments object
      };

      console.log("Cleaned assignments:", assignments);
      console.log("Initialized editUser:", this.editUser);

      try {
        // Load all location options sequentially
        if (assignments.plant) {
          const plants = await this.fetchLocationOptions("plant");
          this.plantOptions = [
            { value: "", label: "Select Plant", disabled: true },
            ...plants,
          ];
          console.log("Updated plantOptions:", this.plantOptions);
        }

        if (assignments.shop) {
          const shops = await this.fetchLocationOptions(
            "shop",
            assignments.plant
          );
          this.shopOptions = [
            { value: "", label: "Select Shop", disabled: true },
            ...shops,
          ];
          console.log("Updated shopOptions:", this.shopOptions);
        }

        if (assignments.line) {
          const lines = await this.fetchLocationOptions(
            "line",
            assignments.shop
          );
          this.lineOptions = [
            { value: "", label: "Select Line", disabled: true },
            ...lines,
          ];
          console.log("Updated lineOptions:", this.lineOptions);
        }

        if (assignments.station) {
          const stations = await this.fetchLocationOptions(
            "station",
            assignments.line
          );
          this.stationOptions = [
            { value: "", label: "Select Station", disabled: true },
            ...stations,
          ];
          console.log("Updated stationOptions:", this.stationOptions);
        }

        console.log("Final assignments state:", {
          editUser: this.editUser.assignments,
          plantOptions: this.plantOptions,
          shopOptions: this.shopOptions,
          lineOptions: this.lineOptions,
          stationOptions: this.stationOptions,
        });
      } catch (error) {
        console.error("Error loading location options:", error);
      }

      this.showEditModal = true;
    },

    closeAddModal() {
      this.showAddModal = false;
      this.resetForm("new");
    },

    closeEditModal() {
      this.showEditModal = false;
      this.resetForm("edit");
    },

    resetForm(form) {
      const target = form === "new" ? this.newUser : this.editUser;
      if (form === "new") {
        target.username = "";
        target.password = "Toyota123"; // Reset to default password
        target.role = "";
      }
      target.assignments = {
        plant: "",
        shop: "",
        line: "",
        station: "",
      };
      target.is_active = true;

      this.plantOptions = [
        { value: "", label: "Select Plant", disabled: true, selected: true },
      ];
      this.resetDependentFields("plant", form);
    },

    onRoleChange() {
      this.currentPage = 1;
    },

    async handleAddUser() {
      if (!this.isFormValid) {
        Swal.fire({
          title: "Error",
          text: "Please fill in all required fields correctly",
          icon: "error",
        });
        return;
      }

      // Create a clean assignments object
      const assignments = {
        plant: this.newUser.assignments.plant || null,
        shop: this.newUser.assignments.shop || null,
        line: this.newUser.assignments.line || null,
        station: this.newUser.assignments.station || null,
      };

      // Create user data with assignments
      const userData = {
        username: this.newUser.username,
        password: this.newUser.password,
        role: this.newUser.role,
        is_active: this.newUser.is_active,
        assignments: assignments, // Include the assignments
      };

      console.log("Creating new user with data:", userData);

      this.isSubmitting = true;
      try {
        const success = await this.createUser(userData);
        if (success) {
          console.log("User created successfully:", success);
          this.closeAddModal();
          this.currentPage = 1;
          await this.fetchUsersList();
          Swal.fire({
            title: "Success",
            text: "User added successfully",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        console.error("Error adding user:", error);
        Swal.fire({
          title: "Error",
          text: error.message || "Failed to add user. Please try again.",
          icon: "error",
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async handleEditUser() {
      if (!this.isEditFormValid) {
        Swal.fire({
          title: "Error",
          text: "Please fill in all required fields correctly",
          icon: "error",
        });
        return;
      }

      this.isSubmitting = true;
      try {
        const userData = {
          id: this.editUser._id,
          username: this.editUser.username,
          role: this.editUser.role,
          is_active: this.editUser.is_active,
          assignments: {
            plant: this.editUser.assignments.plant || null,
            shop: this.editUser.assignments.shop || null,
            line: this.editUser.assignments.line || null,
            station: this.editUser.assignments.station || null,
          },
        };
        console.log("Sending update with userData:", userData);

        const success = await this.updateUser({
          userId: this.editUser._id,
          userData,
        });

        if (success) {
          this.closeEditModal();
          this.currentPage = 1;
          await this.fetchUsersList();
          Swal.fire({
            title: "Success",
            text: "User updated successfully",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        console.error("Error updating user:", error);
        Swal.fire({
          title: "Error",
          text: error.message || "Failed to update user. Please try again.",
          icon: "error",
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async handleDeleteUser(userId) {
      this.isSubmitting = true;
      try {
        Swal.fire({
          title: "Delete User",
          text: "Are you sure you want to delete this user?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "Cancel",
        }).then(async (result) => {
          if (result.isConfirmed) {
            const success = await this.deleteUser(userId);
            if (success) {
              this.currentPage = 1;
              await this.fetchUsersList();
              Swal.fire({
                title: "Success",
                text: "User deleted successfully",
                icon: "success",
                timer: 2000,
                timerProgressBar: true,
              });
            }
          }
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        await Swal.fire({
          title: "Error",
          text: error.message || "Failed to delete user. Please try again.",
          icon: "error",
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    // Pagination methods
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

    async fetchUsersList() {
      await this.fetchUsers();
    },
  },

  async created() {
    await this.fetchUsersList();
  },

  // Add props and emits
  props: {
    currentUserId: {
      type: String,
      default: () => JSON.parse(localStorage.getItem("user"))?._id,
    },
  },

  emits: ["fetch-users"],

  beforeDestroy() {
    // Clear any pending timers
    Object.values(this.fetchDebounceTimers || {}).forEach((timer) => {
      clearTimeout(timer);
    });
  },
};
</script>

<style scoped>
.mobile-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 1rem;
}

.mobile-card-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
}

.mobile-label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.875rem;
}

.mobile-value {
  color: #212529;
}

.mobile-card-actions {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #dee2e6;
}

.table-scroll-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 767.98px) {
  .mobile-card {
    margin-left: -0.5rem;
    margin-right: -0.5rem;
    border-radius: 0;
  }
}

.cell-content {
  vertical-align: middle !important;
}
</style>
