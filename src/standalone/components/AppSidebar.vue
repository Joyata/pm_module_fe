<template>
  <CSidebar
    position="fixed"
    :unfoldable="sidebarUnfoldable"
    :visible="sidebarVisible"
    @visible-change="handleVisibleChange"
    :class="[
      'sidebar bgSideBar',
      {
        'responsive-sidebar': isResponsiveView,
        show: isResponsiveView && sidebarVisible && isInitialized,
      },
    ]"
    ref="sidebar"
  >
    <CSidebarBrand class="sidebar-brand">
      <img
        src="../assets/brand/Toyota_logo.png"
        class="img-fluid sidebar-brand-full"
        :style="{ width: isResponsiveView ? '150px' : '200px', height: 'auto' }"
      />
      <img
        src="../assets/brand/Toyota_emblem.png"
        class="sidebar-brand-narrow"
        width="44"
        height="28"
      />
    </CSidebarBrand>
    <AppSidebarNav v-bind:nav="nav" @nav-item-click="handleNavItemClick" />
    <CSidebarToggler
      id="SidebarToggler"
      class="d-none d-lg-flex"
      @click="$store.commit('toggleUnfoldable')"
    />
  </CSidebar>

  <!-- Overlay for Responsive view -->
  <Transition name="fade">
    <div
      v-if="isResponsiveView && sidebarVisible && isInitialized"
      class="sidebar-overlay"
      @click="handleOverlayClick"
    ></div>
  </Transition>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { AppSidebarNav } from "./AppSidebarNav";
import { logoNegative } from "@/standalone/assets/brand/logo-negative";
import { sygnet } from "@/standalone/assets/brand/sygnet";
import utils from "@/utils/CommonUtils";
import api from "@/apis/CommonAPI";
import navtemplate from "@/_nav.js";
import { debounce } from "lodash";
import { getNavigationItems } from "../../utils/navigationConfig";

var strAuthorizedNav = "";
var appAuthorized = {};
const generateNav = async (newAuthorizedData, isChild) => {
  strAuthorizedNav += "[";
  let newAuthorizedDataLength = newAuthorizedData.length;
  for (var i = 0; i < newAuthorizedDataLength; i++) {
    let currentNewAuthorizedData = newAuthorizedData[i];
    if (
      currentNewAuthorizedData.children &&
      currentNewAuthorizedData.children.length > 0
    ) {
      strAuthorizedNav += "{";
      strAuthorizedNav += ' "component": "CNavGroup",';
      strAuthorizedNav +=
        ' "name": "' +
        (isChild ? "" : "") +
        currentNewAuthorizedData.displayText +
        '",';
      strAuthorizedNav += ' "to": "' + currentNewAuthorizedData.path + '",';
      strAuthorizedNav += ' "icon": "' + currentNewAuthorizedData.icon + '",';
      strAuthorizedNav +=
        ' "parentId": "' + currentNewAuthorizedData.parentId + '",';
      strAuthorizedNav += ' "items": ';
      generateNav(currentNewAuthorizedData.children, true);
      strAuthorizedNav += "},";
    } else {
      strAuthorizedNav += "{";
      strAuthorizedNav += ' "component": "CNavItem",';
      strAuthorizedNav +=
        ' "name": "' +
        (isChild ? "" : "") +
        currentNewAuthorizedData.displayText +
        '",';
      strAuthorizedNav += ' "to": "' + currentNewAuthorizedData.path + '",';
      strAuthorizedNav += ' "icon": "' + currentNewAuthorizedData.icon + '",';
      strAuthorizedNav +=
        ' "parentId": "' + currentNewAuthorizedData.parentId + '",';
      strAuthorizedNav +=
        ' "applicationId": "' + currentNewAuthorizedData.applicationId + '",';
      strAuthorizedNav +=
        ' "linkProps": { "queryParams": { "applicationId": "' +
        currentNewAuthorizedData.applicationId +
        '", "functionId": "' +
        currentNewAuthorizedData.functionId +
        '" } }';
      strAuthorizedNav += "},";
    }
  }
  strAuthorizedNav += "]";
};

export default {
  name: "AppSidebar",
  components: {
    AppSidebarNav,
  },
  data() {
    return {
      nav: [],
    };
  },
  created() {
    // Load navigation based on user role
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    this.nav = getNavigationItems(user.role);
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const isResponsiveView = ref(false);
    const sidebar = ref(null);
    const isInitialized = ref(false);
    // Computed properties
    const sidebarUnfoldable = computed(() => store.state.sidebarUnfoldable);
    const sidebarVisible = computed(() => store.state.sidebarVisible);

    const checkResponsiveView = debounce(() => {
      const width = window.innerWidth;
      const wasResponsiveView = isResponsiveView.value;
      isResponsiveView.value = width <= 1024;

      if (!isInitialized.value) {
        // On first load, immediately hide sidebar in Responsive view
        if (isResponsiveView.value) {
          store.commit("updateSidebarVisible", false);
        }
        isInitialized.value = true;
      } else if (!wasResponsiveView && isResponsiveView.value) {
        store.commit("updateSidebarVisible", false);
        document.body.classList.add("responsive-view");
      } else if (wasResponsiveView && !isResponsiveView.value) {
        document.body.classList.remove("responsive-view");
        store.commit("updateSidebarVisible", true);
      }
    }, 250);

    const handleVisibleChange = (visible) => {
      if (isResponsiveView.value) {
        document.body.classList.toggle("sidebar-open", visible);
        document
          .querySelector(".wrapper")
          ?.classList.toggle("sidebar-visible", visible);
      }
      store.commit("updateSidebarVisible", visible);
    };
    const handleOverlayClick = () => {
      store.commit("updateSidebarVisible", false);
      document.body.classList.remove("sidebar-open");
    };

    const handleNavItemClick = () => {
      if (isResponsiveView.value) {
        store.commit("updateSidebarVisible", false);
        document.body.classList.remove("sidebar-open");
      }
    };

    const cleanup = () => {
      document.body.classList.remove("responsive-view", "sidebar-open");
      window.removeEventListener("resize", checkResponsiveView);
    };

    isResponsiveView.value = window.innerWidth <= 1024;
    if (isResponsiveView.value) {
      store.commit("updateSidebarVisible", false);
    }

    // Watch for route changes using route.fullPath
    watch(
      () => route.fullPath,
      () => {
        if (isResponsiveView.value) {
          store.commit("updateSidebarVisible", false);
          document.body.classList.remove("sidebar-open");
        }
      }
    );

    onMounted(() => {
      isInitialized.value = true;
      window.addEventListener("resize", checkResponsiveView);
      checkResponsiveView();
    });

    onUnmounted(() => {
      cleanup();
    });

    return {
      isResponsiveView,
      sidebarUnfoldable,
      sidebarVisible,
      handleVisibleChange,
      handleNavItemClick,
      handleOverlayClick,
      sidebar,
      isInitialized,
    };
  },
};
</script>

<style lang="scss">
@import "../../standalone/styles/_variables.scss";
// Global styles for layout adjustment
body {
  &.responsive-view {
    .wrapper {
      margin-left: 0 !important;

      .header {
        left: 0 !important;
        width: 100% !important;
      }

      .container-fluid {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
      }
    }
  }

  &.sidebar-open {
    overflow: hidden;
  }
}

.sidebar {
  transition: transform 0.3s ease-in-out, visibility 0.3s ease-in-out;

  &.responsive-sidebar {
    @include desktop {
      --cui-sidebar-width: 300px !important;
    }

    @include ipad {
      --cui-sidebar-width: 280px !important;
      position: fixed !important;
      left: 0;
    }

    @include mobile {
      --cui-sidebar-width: 250px !important;
    }

    position: fixed !important;
    z-index: 1036;
    transform: translateX(-100%);
    visibility: hidden;
    transition: transform 0.3s ease-in-out, visibility 0s linear 0.3s;

    &.show {
      transform: translateX(0);
      visibility: visible;
      transition: transform 0.3s ease-in-out, visibility 0s linear;
    }

    .nav-link {
      @include mobile {
        padding: 0.8rem 1rem;
        min-height: 44px;
      }

      @include ipad {
        padding: 1rem 1.5rem;
        min-height: 48px;
      }

      display: flex;
      align-items: center;

      i,
      svg {
        margin-right: 1rem;
        font-size: 1.2rem;
      }
    }

    .nav-group-items {
      @include mobile {
        .nav-item a.nav-link {
          padding-left: 2.5rem !important;
        }

        .nav-group .nav-group-items .nav-item .nav-link {
          padding-left: 3rem !important;
        }
      }

      @include ipad {
        .nav-item a.nav-link {
          padding-left: 3rem !important;
        }

        .nav-group .nav-group-items .nav-item .nav-link {
          padding-left: 3.5rem !important;
        }
      }
    }

    .sidebar-brand {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.5rem;

      .sidebar-brand-full {
        margin: 0 auto; // Center the full logo
        max-width: 80%; // Adjust this value as needed
        height: auto; // Maintain aspect ratio
      }

      .sidebar-brand-narrow {
        margin: 0 auto; // Center the narrow logo
        max-width: 44px; // Match your current width
        height: auto; // Maintain aspect ratio
      }
    }
  }
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1035;
  backdrop-filter: blur(2px);
  transition: opacity 0.3s ease;

  // Add this for responsive view
  @include mobile {
    left: 250px;
  }

  @include ipad {
    left: 280px;
  }

  @include desktop {
    left: 300px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
