<template>
  <div>
    <CCard class="mb-3">
      <CCardHeader>
        <h4>My Profile</h4>
      </CCardHeader>
      <CCardBody>
        <div v-if="isLoading" class="text-center p-3">
          <CSpinner></CSpinner>
          <span class="ms-2">Loading profile...</span>
        </div>

        <CForm v-else>
          <!-- Profile Picture Section -->
          <CRow class="mb-4">
            <CCol :md="6" class="text-center">
              <div class="position-relative d-inline-block">
                <!-- Profile Picture -->
                <div
                  class="profile-picture-container"
                  style="
                    width: 150px;
                    height: 150px;
                    overflow: hidden;
                    border-radius: 50%;
                    margin: 0 auto;
                    border: 2px solid #ccc;
                  "
                >
                  <template v-if="getProfileImageUrl">
                    <img
                      :src="getProfileImageUrl"
                      alt="Profile Picture"
                      class="w-100 h-100"
                      style="object-fit: cover"
                      @error="handleImageError"
                      @load="handleImageLoad"
                    />
                    <div
                      v-show="!imageLoaded"
                      class="d-flex align-items-center justify-content-center w-100 h-100 bg-light"
                    >
                      <CIcon
                        icon="cil-user"
                        size="xl"
                        class="text-secondary"
                      ></CIcon>
                    </div>
                  </template>
                  <div
                    v-else
                    class="d-flex align-items-center justify-content-center w-100 h-100 bg-light"
                  >
                    <CIcon
                      icon="cil-user"
                      size="xl"
                      class="text-secondary"
                    ></CIcon>
                  </div>
                </div>

                <!-- Upload Button -->
                <div class="mt-2">
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    @click="triggerFileInput"
                  >
                    <CIcon icon="cil-camera" class="me-2"></CIcon>Change
                    Picture</CButton
                  >
                  <input
                    type="file"
                    ref="fileInput"
                    accept="image/*"
                    class="d-none"
                    @change="handleImageUpload"
                  />
                </div>
              </div>
            </CCol>

            <CCol :md="6" class="mt-3">
              <!-- Basic Information Section -->
              <CRow>
                <CCol :md="12">
                  <h5 class="mb-4">Basic Information</h5>
                </CCol>
                <CCol>
                  <CFormInput
                    label="Username"
                    :value="profile?.username"
                    disabled
                    class="mb-3"
                  ></CFormInput>

                  <CFormInput
                    label="Role"
                    :value="formatRole(profile?.role)"
                    disabled
                    class="mb-3"
                  ></CFormInput>
                </CCol>
              </CRow>
            </CCol>
          </CRow>

          <!-- Work Information -->
          <CRow class="mt-4">
            <CCol :md="12">
              <h5 class="mb-4">Work Information</h5>
            </CCol>

            <CCol :md="3">
              <CFormInput
                label="Plant"
                :value="locationNames.plant"
                disabled
                class="mb-3"
              ></CFormInput>
            </CCol>

            <CCol :md="3">
              <CFormInput
                label="Shop"
                :value="locationNames.shop"
                disabled
                class="mb-3"
              ></CFormInput>
            </CCol>

            <CCol :md="3">
              <CFormInput
                label="Line"
                :value="locationNames.line"
                disabled
                class="mb-3"
              ></CFormInput>
            </CCol>

            <CCol :md="3">
              <CFormInput
                label="Station"
                :value="locationNames.station"
                disabled
                class="mb-3"
              ></CFormInput>
            </CCol>
          </CRow>

          <!-- Change Password -->
          <CRow class="mt-4">
            <CCol :md="12">
              <h5 class="mb-4">Change Password</h5>
            </CCol>

            <CCol :md="6">
              <CInputGroup class="mb-3">
                <CInputGroupText style="width: 120px; justify-content: center"
                  >Current Password</CInputGroupText
                >
                <CFormInput
                  :type="currentPasswordFieldType"
                  v-model="passwordForm.currentPassword"
                />
                <CInputGroupText
                  @click="toggleCurrentPasswordVisibility"
                  style="cursor: pointer"
                >
                  <font-awesome-icon :icon="currentPasswordVisibilityIcon" />
                </CInputGroupText>
              </CInputGroup>
            </CCol>

            <CCol :md="6">
              <CInputGroup class="mb-3">
                <CInputGroupText style="width: 120px; justify-content: center"
                  >New Password</CInputGroupText
                >
                <CFormInput
                  :type="newPasswordFieldType"
                  v-model="passwordForm.newPassword"
                />
                <CInputGroupText
                  @click="toggleNewPasswordVisibility"
                  style="cursor: pointer"
                >
                  <font-awesome-icon :icon="newPasswordVisibilityIcon" />
                </CInputGroupText>
              </CInputGroup>
            </CCol>

            <!-- Change Password Button -->
            <CCol :md="12" class="text-end mt-3">
              <CButton color="primary" @click="handlePasswordChange">
                {{ isUpdating ? "Changing Password..." : "Change Password" }}
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default {
  name: "Profile",
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      passwordForm: {
        currentPassword: "",
        newPassword: "",
      },
      showCurrentPassword: false,
      showNewPassword: false,
      imageLoaded: false,
    };
  },

  computed: {
    ...mapState("auth", ["user"]),
    ...mapState("user", ["profile", "locationNames"]),
    ...mapGetters("user", [
      "getProfileImageUrl",
      "isLoading",
      "isUpdating",
      "getError",
    ]),

    currentPasswordFieldType() {
      return this.showCurrentPassword ? "text" : "password";
    },
    newPasswordFieldType() {
      return this.showNewPassword ? "text" : "password";
    },
    currentPasswordVisibilityIcon() {
      return this.showCurrentPassword ? faEye : faEyeSlash;
    },
    newPasswordVisibilityIcon() {
      return this.showNewPassword ? faEye : faEyeSlash;
    },
  },

  async created() {
    await this.initializeProfile();
  },

  methods: {
    ...mapActions("user", [
      "fetchProfile",
      "fetchLocationNames",
      "updateProfilePicture",
      "updatePassword",
    ]),

    async initializeProfile() {
      try {
        if (!this.user?._id) {
          const storedUser = JSON.parse(localStorage.getItem("user"));
          if (!storedUser?._id) {
            throw new Error("User ID not found");
          }
          this.$store.commit("auth/UPDATE_USER", storedUser);
        }

        await this.fetchProfile(this.user._id);
        await this.fetchLocationNames();
      } catch (error) {
        console.error("Error initializing profile:", error);
      }
    },

    formatRole(role) {
      return role
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      try {
        // Validation
        if (!validTypes.includes(file.type)) {
          throw new Error(
            "Please select a valid image file (JPEG, PNG, or GIF)"
          );
        }

        if (file.size > maxSize) {
          throw new Error("Image must be smaller than 5MB");
        }

        // Reset states
        this.imageLoaded = false;

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);

        // Update profile picture
        await this.updateProfilePicture(file);

        // Cleanup
        URL.revokeObjectURL(previewUrl);
        this.$refs.fileInput.value = "";

        // Refresh profile
        await this.fetchProfile(this.user._id);
      } catch (error) {
        console.error("Image upload error:", error);
        await Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: error.message,
          confirmButtonColor: "#c41e3a",
        });
        this.$refs.fileInput.value = "";
      }
    },

    async handlePasswordChange() {
      try {
        if (
          !this.passwordForm.currentPassword ||
          !this.passwordForm.newPassword
        ) {
          await Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: "Both current password and new password are required",
            confirmButtonColor: "#c41e3a",
          });
          return;
        }

        if (this.passwordForm.newPassword.length < 8) {
          await Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: "New password must be at least 8 characters long",
            confirmButtonColor: "#c41e3a",
          });
          return;
        }

        this.$store.commit("user/SET_UPDATING", true);

        await this.updatePassword({
          id: this.user._id,
          old_password: this.passwordForm.currentPassword,
          password: this.passwordForm.newPassword,
        });

        // Clear the form after successful password change
        this.passwordForm.currentPassword = "";
        this.passwordForm.newPassword = "";

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password changed successfully!",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
      } catch (error) {
        console.error("Password change error:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to change password",
          confirmButtonColor: "#c41e3a",
        });
      } finally {
        this.$store.commit("user/SET_UPDATING", false);
      }
    },

    handleImageError(event) {
      console.error("Image failed to load:", event.target.src);
      this.imageLoaded = false;
      event.target.style.display = "none";
    },

    handleImageLoad(event) {
      console.log("Image loaded successfully:", event.target.src);
      this.imageLoaded = true;
      event.target.style.display = "block";
    },

    toggleCurrentPasswordVisibility() {
      this.showCurrentPassword = !this.showCurrentPassword;
    },
    toggleNewPasswordVisibility() {
      this.showNewPassword = !this.showNewPassword;
    },
  },

  // Add this watcher to monitor profile image URL changes
  watch: {
    getProfileImageUrl: {
      immediate: true,
      handler(newUrl) {
        if (!newUrl) {
          this.imageLoaded = false;
        }
        console.log("Profile image URL changed:", newUrl);
      },
    },
  },

  beforeUnmount() {
    // Cleanup any remaining object URLs
    if (this.localImagePreview) {
      URL.revokeObjectURL(this.localImagePreview);
    }
  },
};
</script>

<style scoped>
.profile-picture-container:hover .profile-picture-overlay {
  opacity: 1;
}

.profile-picture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 50%;
}
</style>
