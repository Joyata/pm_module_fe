import axios from "axios";
import { toast } from "vue-sonner";
import api from "@/apis/CommonAPI";
import Swal from "sweetalert2";

export default {
  namespaced: true,

  state: {
    // Profile related state
    profile: null,
    locationNames: {
      plant: "-",
      shop: "-",
      line: "-",
      station: "-",
    },

    // User management related state
    users: [],
    selectedUser: null,

    // Common state
    loading: false,
    updating: false,
    error: null,
    locationCache: {},
  },

  mutations: {
    // Profile mutations
    SET_PROFILE(state, profile) {
      console.log("📝 Setting profile:", profile);
      state.profile = profile;

      // Reset location names when profile changes
      state.locationNames = {
        plant: "-",
        shop: "-",
        line: "-",
        station: "-",
      };
    },
    UPDATE_PROFILE_PICTURE(state, path) {
      console.log("📝 Updating profile picture path:", path);
      if (state.profile) {
        state.profile = {
          ...state.profile,
          path: path,
        };
      }
    },

    // Location mutations
    SET_LOCATION_NAMES(state, { type, id, name }) {
      console.log("📝 Setting location name:", { type, id, name });
      // Update locationNames directly
      state.locationNames[type] = name;

      // Also cache it
      if (!state.locationCache[type]) {
        state.locationCache[type] = {};
      }
      state.locationCache[type][id] = name;
    },

    RESET_LOCATION_NAMES(state) {
      console.log("🔄 Resetting location names");
      state.locationNames = {
        plant: "-",
        shop: "-",
        line: "-",
        station: "-",
      };
    },

    // User management mutations
    SET_USERS(state, users) {
      console.log("📝 Setting users:", users);
      state.users = users;
    },
    SET_SELECTED_USER(state, user) {
      console.log("📝 Setting selected user:", user);
      state.selectedUser = user;
    },
    ADD_USER(state, user) {
      console.log("📝 Adding new user:", user);
      state.users = [user, ...state.users];
    },
    UPDATE_USER(state, updatedUser) {
      console.log("📝 Updating user:", updatedUser);
      const index = state.users.findIndex(
        (user) => user._id === updatedUser._id
      );
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser);
      }
    },
    DELETE_USER(state, userId) {
      console.log("Deleting user with ID:", userId);
      // Filter out the deleted user while keeping active ones
      state.users = state.users.filter((user) => {
        const keep = user._id !== userId;
        console.log(`User ${user._id}: keeping = ${keep}`);
        return keep;
      });
      console.log("Updated users array:", state.users);
    },

    // Common mutations
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_UPDATING(state, status) {
      state.updating = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
    CLEAR_STATE(state) {
      state.users = [];
      state.selectedUser = null;
      state.error = null;
      state.locationNames = {};
    },
  },

  actions: {
    // Profile actions
    async fetchProfile({ commit, dispatch, state }, userId) {
      console.log("🔍 Fetching profile for user:", userId);
      commit("SET_LOADING", true);

      try {
        const response = await api.get(`/user/list-user?id=${userId}`, "?");
        console.log("📥 Profile API Response:", response.data);

        if (response?.data?.status === 200) {
          const userData = response.data.data;
          commit("SET_PROFILE", userData);

          // Fetch location names for the profile
          if (userData.assignments) {
            console.log(
              "📍 Fetching location names for assignments:",
              userData.assignments
            );
            const locationTypes = ["plant", "shop", "line", "station"];

            const fetchPromises = locationTypes.map(async (type) => {
              const id = userData.assignments[type];
              if (id) {
                const name = await dispatch("fetchLocationName", { type, id });
                commit("SET_LOCATION_NAMES", { type, id, name });
              }
            });

            await Promise.all(fetchPromises);
          }

          return userData;
        }
        throw new Error(response.data?.message || "Failed to fetch profile");
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
        commit("SET_ERROR", error);
        toast.error(error.message || "Failed to fetch profile");
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Location name actions
    async fetchLocationName({ commit, state }, { type, id }) {
      console.log(`🔍 [fetchLocationName] Starting fetch for ${type} ID:`, id);
      console.log(`Current locationNames state:`, state.locationNames);

      if (!type || !id) {
        console.log(`⚠️ [fetchLocationName] Invalid type or id:`, { type, id });
        return "-";
      }

      // Check if we already have this location name
      if (state.locationCache[type]?.[id]) {
        console.log(
          `📍 [fetchLocationName] Found cached name for ${type} ${id}:`,
          state.locationCache[type][id]
        );
        return state.locationCache[type][id];
      }

      try {
        const url = `/asset/list-asset?collection=${type}&id=${id}`;
        console.log(`🌐 [fetchLocationName] Fetching URL:`, url);

        const response = await api.get(url, "?");
        console.log(
          `📥 [fetchLocationName] ${type} API Response:`,
          response.data
        );

        if (
          response?.data?.status === 200 &&
          Array.isArray(response.data.data)
        ) {
          const matchingItem = response.data.data.find(
            (item) => item._id === id
          );
          console.log(
            `🔎 [fetchLocationName] Matching item for ${type}:`,
            matchingItem
          );

          if (matchingItem) {
            const name = matchingItem[`${type}_nm`] || matchingItem.name;
            console.log(`✅ [fetchLocationName] Found name for ${type}:`, {
              id,
              name,
            });

            // Important: Use SET_LOCATION_NAMES instead of SET_LOCATION_NAME
            commit("SET_LOCATION_NAMES", { type, id, name });

            // Verify the state was updated
            console.log(
              `🔄 [fetchLocationName] Updated state:`,
              state.locationNames[type]?.[id]
            );

            return name;
          }
          console.log(
            `⚠️ [fetchLocationName] No matching item found for ${type} ${id}`
          );
        }

        console.log(
          `⚠️ [fetchLocationName] Invalid response format for ${type}`
        );
        return "-";
      } catch (error) {
        console.error(
          `❌ [fetchLocationName] Error fetching ${type} name:`,
          error
        );
        return "-";
      }
    },

    async fetchUserLocationNames({ commit, dispatch }, user) {
      console.log(
        "👤 [fetchUserLocationNames] Starting for user:",
        user?.username
      );
      commit("RESET_LOCATION_NAMES"); // Reset first

      if (!user?.assignments) {
        console.log("⚠️ No assignments for user");
        return;
      }

      try {
        const locationTypes = ["plant", "shop", "line", "station"];
        const fetchPromises = locationTypes.map(async (type) => {
          const id = user.assignments[type];
          if (id && typeof id === "string" && id.trim()) {
            console.log(`🔍 Fetching ${type} name for ID:`, id);
            const response = await api.get(
              `/asset/list-asset?collection=${type}&id=${id}`,
              "?"
            );

            if (
              response?.data?.status === 200 &&
              Array.isArray(response.data.data)
            ) {
              const matchingItem = response.data.data.find(
                (item) => item._id === id
              );
              if (matchingItem) {
                const name = matchingItem[`${type}_nm`] || matchingItem.name;
                console.log(`✅ Found ${type} name:`, name);
                commit("SET_LOCATION_NAMES", { type, id, name });
                return name;
              }
            }
          }
          return "-";
        });

        await Promise.all(fetchPromises);
      } catch (error) {
        console.error("❌ Error fetching location names:", error);
      }
    },

    async updateProfilePicture({ commit }, file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        // First ensure we have a proper file
        if (!file || !file.type.startsWith("image/")) {
          throw new Error("Invalid file type. Please upload an image.");
        }

        const response = await axios.put(
          `${process.env.VUE_APP_API_URL}/user/upload-profile-pic`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("id_token")}`,
            },
          }
        );
        console.log("📥 API Response:", response.data);

        if (response?.data?.status === 200) {
          // Create the path based on the user ID and filename
          const userId = JSON.parse(localStorage.getItem("user"))._id;
          const path = `./uploads/profile_pic/${userId}_${file.name}`;

          commit("UPDATE_PROFILE_PICTURE", path);
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Profile picture updated successfully",
            timer: 2000,
            timerProgressBar: true,
          });
          return response.data;
        }
        throw new Error(
          response.data?.message || "Failed to update profile picture"
        );
      } catch (error) {
        console.error("Error updating profile picture. Full error:", error);
        commit("SET_ERROR", error);
        toast.error(error.message || "Failed to update profile picture");
        await Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.message || "Failed to update profile picture",
          confirmButtonColor: "#c41e3a",
        });
        throw error;
      }
    },

    async updatePassword({ commit }, { id, old_password, password }) {
      commit("SET_UPDATING", true);
      try {
        // Pass id as the second parameter to match CommonAPI's put method
        const response = await api.put("/user/edit-password", id, {
          old_password,
          password,
        });

        console.log("Password update response:", response.data);

        if (response.data?.status === 200) {
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Password updated successfully",
            timer: 2000,
            timerProgressBar: true,
          });
          return response.data;
        }
        throw new Error(response.data?.message || "Failed to update password");
      } catch (error) {
        console.error("Full error object:", error);
        console.error("Error response:", error.response);

        commit("SET_ERROR", error);

        const errorMessage = error.response?.data?.message || error.message;
        const errorDetails = error.response?.data?.error || "";

        let displayMessage = "Failed to update password";
        if (errorMessage.includes("Invalid old password")) {
          displayMessage = "Current password is wrong";
        } else if (errorMessage.includes("Access not allowed")) {
          displayMessage = "You don't have permission to change this password";
        } else if (errorDetails.includes("Error comparing passwords")) {
          displayMessage = "Current password is wrong";
        }

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: displayMessage,
          confirmButtonColor: "#c41e3a",
        });
        throw error;
      } finally {
        commit("SET_UPDATING", false);
      }
    },

    // User Management actions
    async fetchUsers({ commit, dispatch }) {
      console.log("🔍 Starting fetchUsers");
      commit("SET_LOADING", true);

      try {
        const response = await api.get("/user/list-user", "?");
        console.log("📥 Raw API Response:", response.data);

        if (response?.data?.status === 200) {
          const activeUsers = (response.data.data || []).filter(
            (user) => !user.deleted_by
          );

          // First set the users so UI can start rendering
          commit("SET_USERS", activeUsers);

          // Then fetch all location names in parallel
          await Promise.all(
            activeUsers.map((user) => dispatch("fetchUserLocationNames", user))
          );

          return activeUsers;
        }
        throw new Error(response.data?.message || "Failed to fetch users");
      } catch (error) {
        console.error("❌ Error fetching users:", error);
        commit("SET_ERROR", error);
        toast.error(error.message || "Failed to fetch users");
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async createUser({ commit }, userData) {
      console.log("📝 Creating new user:", userData);
      commit("SET_LOADING", true);

      try {
        const response = await api.post("/user/new-user", userData);
        console.log("📥 Create User API Response:", response.data);

        if (response?.data?.status === 200) {
          const newUser = {
            _id: response.data.data.result.insertedId,
            ...userData,
            created_dt: new Date().toISOString(),
          };
          commit("ADD_USER", newUser);
          toast.success("User created successfully");
          return true;
        } else {
          throw new Error(response.data?.message || "Failed to create user");
        }
      } catch (error) {
        console.error("❌ Error creating user:", error);
        commit("SET_ERROR", error);
        toast.error(error.message || "Failed to create user");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateUser({ commit }, { userId, userData }) {
      console.log("📝 Updating user:", { userId, userData });
      commit("SET_UPDATING", true);

      try {
        const dataToSend = {
          id: userId,
          username: userData.username,
          role: userData.role,
          is_active: userData.is_active,
          assignments: userData.assignments,
        };

        const response = await api.put("/user/edit-user", userId, dataToSend);
        console.log("📥 Update User API Response:", response);

        if (response?.data?.status === 200) {
          const updatedUser = {
            _id: userId,
            ...userData,
            is_active: userData.is_active,
          };
          commit("UPDATE_USER", updatedUser);
          toast.success("User updated successfully");
          return true;
        } else {
          throw new Error(response.data?.message || "Failed to update user");
        }
      } catch (error) {
        console.error("❌ Error updating user:", error);
        commit("SET_ERROR", error);
        toast.error(error.message || "Failed to update user");
        return false;
      } finally {
        commit("SET_UPDATING", false);
      }
    },

    async deleteUser({ commit, dispatch }, userId) {
      console.log("🗑️ Deleting user:", userId);
      commit("SET_LOADING", true);

      try {
        const dataToSend = {
          id: userId,
        };

        const response = await api.put("/user/delete-user", userId, dataToSend);
        console.log("📥 Delete User API Response:", response.data);

        if (response?.data?.status === 200) {
          commit("DELETE_USER", userId);
          toast.success("User deleted successfully");

          // Fetch users again after deletion
          await dispatch("fetchUsers");
          return true;
        } else {
          throw new Error(response.data?.message || "Failed to delete user");
        }
      } catch (error) {
        console.error("❌ Error deleting user:", error);
        toast.error(error.message || "Failed to delete user");
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Select a user for editing/viewing
    selectUser({ commit }, user) {
      commit("SET_SELECTED_USER", user);
    },

    // Clear users state
    clearState({ commit }) {
      commit("CLEAR_STATE");
    },
  },

  getters: {
    // Profile getters
    getProfile: (state) => state.profile,
    getLocationNames: (state) => {
      console.log("📍 Current location names:", state.locationNames);
      return state.locationNames;
    },
    getProfileImageUrl: (state) => {
      console.log("Getting profile image URL. Current profile:", state.profile);
      if (!state.profile?.path) {
        return null;
      }

      const baseUrl = process.env.VUE_APP_API_URL.replace(/\/+$/, "");
      // Remove leading ./ and any extra slashes
      const cleanPath = state.profile.path
        .replace(/^\.?\/?/, "") // Remove leading ./ or /
        .replace(/^uploads\//, "") // Remove leading 'uploads/'
        .replace(/\\/g, "/"); // Replace backslashes with forward slashes

      const imageUrl = `${baseUrl}/uploads/${cleanPath}`;
      return imageUrl;
    },

    // User management getters
    allUsers: (state) => state.users,
    selectedUser: (state) => state.selectedUser,

    // Location name getters
    getLocationName: (state) => (type, id) => {
      console.log(`🔍 Getting ${type} name for ID:`, id);
      return state.locationCache[type]?.[id] || "-";
    },

    // Common getters
    isLoading: (state) => state.loading,
    isUpdating: (state) => state.updating,
    hasError: (state) => !!state.error,
    getError: (state) => state.error,
  },
};
