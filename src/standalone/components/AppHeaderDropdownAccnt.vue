<template>
  <CDropdown variant="nav-item">
    <CDropdownToggle
      placement="bottom-end"
      class="py-0"
      href="javascript:void(0);"
    >
      <span class="username-text">{{ userName }}</span>
      &ensp;
      <img
        v-if="profilePicture"
        :src="profilePicture"
        class="rounded-circle profile-image"
        style="width: 36px; height: 36px; object-fit: cover"
        alt="Profile"
      />
      <CAvatar v-else color="danger" class="user-avatar" style="color: white">{{
        userInitials
      }}</CAvatar>
    </CDropdownToggle>
    <CDropdownMenu class="pt-0">
      <CDropdownHeader
        component="h6"
        class="fw-semibold py-2"
        style="border-top-left-radius: 5px; border-top-right-radius: 5px"
      >
        Account
      </CDropdownHeader>
      <CDropdownItem href="/#/pm/profile">
        <CIcon icon="cil-user" /> Profile
      </CDropdownItem>
      <CDropdownDivider />
      <CDropdownItem href="#" @click="handleLogout">
        <CIcon icon="cilAccountLogout" /> Logout
      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { toast } from "vue-sonner";

export default {
  name: "AppHeaderDropdownAccnt",

  computed: {
    ...mapState("auth", ["user"]),

    userName() {
      return this.user?.username || "User";
    },

    userInitials() {
      const username = this.user?.username || "";
      return username.slice(0, 2).toUpperCase();
    },

    profilePicture() {
      if (!this.user?.path) {
        return null;
      }

      // Clean up the path
      const cleanPath = this.user.path
        .replace(/^\.\//, "") // Remove leading ./
        .replace(/^\/+/, "") // Remove leading slashes
        .replace(/\\/g, "/"); // Replace backslashes with forward slashes

      const baseUrl = process.env.VUE_APP_API_URL.replace(/\/+$/, "");
      const imageUrl = `${baseUrl}/${cleanPath}`;

      return imageUrl;
    },
  },

  methods: {
    ...mapActions("auth", ["logout"]),

    async handleLogout() {
      try {
        await this.logout();
        toast.success("Logged out successfully");
      } catch (error) {
        console.error("Logout error:", error);
        toast.error("Error during logout");
      }
    },
  },

  watch: {
    profilePicture: {
      immediate: true,
      handler(newUrl) {
        if (newUrl) {
          const img = new Image();
          img.onload = () => {
            this.imageLoaded = true;
          };
          img.onerror = () => {
            this.imageLoaded = false;
          };
          img.src = newUrl;
        } else {
          this.imageLoaded = false;
        }
      },
    },
  },
};
</script>

<style scoped>
.username-text {
  font-size: 14px;
  font-weight: 500;
}

.user-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-image {
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.profile-image:hover {
  transform: scale(1.05);
}
</style>
