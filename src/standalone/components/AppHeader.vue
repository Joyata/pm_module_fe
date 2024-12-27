<template>
  <CHeader position="sticky" class="mb-4">
    <CContainer fluid>
      <CHeaderToggler class="ps-1" @click="handleSidebarToggle">
        <CIcon icon="cil-menu" size="lg" style="color: #eb0a1e" />
      </CHeaderToggler>
      <CHeaderBrand class="mx-auto d-lg-none d-md-none header-label-mobile">
        <h3 id="headerLabel1" class="mb-0">{{ headerLabel }}</h3>
      </CHeaderBrand>
      <CHeaderNav class="d-none d-md-flex me-auto header-label-desktop">
        <h3 id="headerLabel2" class="mb-0">{{ headerLabel }}</h3>
      </CHeaderNav>
      <CHeaderNav>
        <AppHeaderDropdownAccnt />
      </CHeaderNav>
    </CContainer>
    <CHeaderDivider />
    <CContainer fluid class="breadcrumb-container">
      <AppBreadcrumb />
    </CContainer>
  </CHeader>
</template>

<script>
import AppBreadcrumb from "./AppBreadcrumb";
import AppHeaderDropdownAccnt from "./AppHeaderDropdownAccnt";
import { logo } from "@/standalone/assets/brand/logo";
import { useStore } from "vuex";
export default {
  name: "AppHeader",
  components: {
    AppBreadcrumb,
    AppHeaderDropdownAccnt,
  },
  data() {
    return {
      headerLabel: process.env.VUE_APP_HEADER_LABEL,
    };
  },
  setup() {
    const store = useStore();

    const handleSidebarToggle = () => {
      store.commit("toggleSidebar");
      // Force update sidebar classes for iPad view
      const sidebar = document.querySelector(".sidebar");
      const isIpadView = window.innerWidth >= 768 && window.innerWidth <= 1024;
      if (sidebar && isIpadView) {
        if (store.state.sidebarVisible) {
          sidebar.classList.add("show");
          document.body.classList.add("sidebar-show");
        } else {
          sidebar.classList.remove("show");
          document.body.classList.remove("sidebar-show");
        }
      }
    };

    return {
      logo,
      handleSidebarToggle,
    };
  },
};
</script>
