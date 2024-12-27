<template>
  <div class="breadcrumb-wrapper">
    <CBreadcrumb class="d-none d-md-flex mb-0" id="AppBreadcrumb">
      <CBreadcrumbItem
        v-for="item in breadcrumbsJsonValue"
        :key="item"
        :href="item.active ? '' : item.path"
        :active="item.active"
        v-on:click="onClickBreadcrumb"
      >
        {{ item.name }}
      </CBreadcrumbItem>
      <CButton
        @click="breadcrumbsStrJsonValueChange()"
        id="breadcrumbsChangeValue"
        :style="{ visibility: 'hidden' }"
        >BreadcrumbsHelper</CButton
      >
    </CBreadcrumb>
    <div class="datetime-display">
      {{ currentDateTime }}
    </div>
  </div>
</template>

<script>
import moment from "moment-timezone";
import { useRouter } from "vue-router";

export default {
  el: "#AppBreadcrumb",
  name: "AppBreadcrumb",
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      breadcrumbsJsonValue: [
        { active: false, name: "Home", path: "#/app/dashboard" },
      ],
      currentDateTime: "",
    };
  },
  mounted() {
    this.updateDateTime();
    setInterval(this.updateDateTime, 1000);
  },
  methods: {
    updateDateTime() {
      const now = new Date();
      this.currentDateTime = moment(now)
        .tz("Asia/Jakarta")
        .format("ddd, DD/MM/YYYY - HH:mm:ss");
    },
    breadcrumbsStrJsonValueChange() {
      // console.log('mf-header '+localStorage.breadcrumbs);
      // console.log('mf-header '+JSON.parse(localStorage.breadcrumbs))
      this.breadcrumbsJsonValue = JSON.parse(localStorage.breadcrumbs);
    },
    async onClickBreadcrumb(e) {
      // If clicking Home, handle role-based redirection
      if (e.target.textContent.trim() === "Home") {
        e.preventDefault(); // Prevent default anchor behavior

        const user = JSON.parse(localStorage.getItem("user"));
        const role = user?.role;

        let redirectPath;
        switch (role) {
          case "team_leader":
            redirectPath = "/pm/activity-tl2";
            break;
          case "team_member":
            redirectPath = "/pm/activity-tm2";
            break;
          case "admin":
            redirectPath = "/app/dashboard";
            break;
          default:
            redirectPath = "/app/dashboard";
        }

        // Update breadcrumbs
        let nextBreadCrumbLiElement = e.target.parentNode.nextElementSibling;
        while (nextBreadCrumbLiElement) {
          if (nextBreadCrumbLiElement.tagName === "LI") {
            nextBreadCrumbLiElement.remove();
            nextBreadCrumbLiElement = e.target.parentNode.nextElementSibling;
          } else {
            nextBreadCrumbLiElement = undefined;
          }
        }

        // Update localStorage breadcrumbs
        const newBreadcrumbs = [
          { active: false, name: "Home", path: `#${redirectPath}` },
        ];
        localStorage.breadcrumbs = JSON.stringify(newBreadcrumbs);
        this.breadcrumbsJsonValue = newBreadcrumbs;

        try {
          await this.router.push(redirectPath);
        } catch (error) {
          console.error("Navigation error:", error);
        }
      } else {
        // Original behavior for other breadcrumb items
        let nextBreadCrumbLiElement = e.target.parentNode.nextElementSibling;
        while (nextBreadCrumbLiElement) {
          if (nextBreadCrumbLiElement.tagName === "LI") {
            nextBreadCrumbLiElement.remove();
            nextBreadCrumbLiElement = e.target.parentNode.nextElementSibling;
          } else {
            nextBreadCrumbLiElement = undefined;
          }
        }
      }
    },
  },
};
</script>
