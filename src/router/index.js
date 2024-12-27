import { createRouter, createWebHashHistory, Route } from "vue-router";
import DefaultLayout from "@/layouts/DefaultLayout";
import DefaultLayoutStandAlone from "@/standalone/layouts/DefaultLayoutStandAlone";
import store from "@/store";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register", "/404", "/500"];

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/pages/Login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/pages/Register.vue"),
  },
  {
    path: "/",
    name: "Home",
    component:
      process.env.VUE_APP_STANDALONE_SINGLE_SPA === "true"
        ? DefaultLayoutStandAlone
        : DefaultLayout,
    redirect: "/login",
    children: [
      {
        path: "/app/dashboard",
        name: "Dashboard",
        component: () => import("@/views/Dashboard.vue"),
        meta: { requiresAuth: true, roles: ["admin"] },
      },
      {
        path: "/pm/profile",
        name: "Profile",
        component: () => import("@/views/pages/Profile.vue"),
        meta: {
          requiresAuth: true,
          roles: ["admin", "team_leader", "team_member"],
        },
      },
      {
        path: "/pm/calendar",
        name: "PMCalendar",
        component: () => import("@/views/pm/Calendar.vue"),
        meta: { requiresAuth: true, roles: ["admin", "team_leader"] },
      },
      {
        path: "/pm/master-machine",
        name: "PMMasterMachine",
        component: () => import("@/views/pm/MasterMachine.vue"),
        meta: { requiresAuth: true, roles: ["admin", "team_leader"] },
      },
      {
        path: "/pm/master-machine/:part_id",
        name: "PMMasterItemCheck",
        component: () => import("@/views/pm/MasterItemCheck.vue"),
        meta: { requiresAuth: true, roles: ["admin", "team_leader"] },
      },
      {
        path: "/pm/master-sparepart",
        name: "PMMasterSparepart",
        component: () => import("@/views/pm/MasterSparepart.vue"),
        meta: { requiresAuth: true, roles: ["admin", "team_leader"] },
      },
      {
        path: "/pm/master-tools",
        name: "PMMasterTools",
        component: () => import("@/views/pm/MasterTools.vue"),
        meta: { requiresAuth: true, roles: ["admin", "team_leader"] },
      },
      {
        path: "/pm/achievement",
        name: "Achievement",
        component: () => import("@/views/pm/Achievement.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/pm/history",
        name: "PMHistory",
        component: () => import("@/views/pm/PMHistory.vue"),
        meta: { requiresAuth: true, roles: ["admin", "team_leader"] },
      },
      {
        path: "/pm/dashboard",
        name: "PMDashboard",
        component: () => import("@/views/pm/Dashboard.vue"),
        meta: {
          requiresAuth: true,
          roles: ["admin", "team_leader", "team_member"],
        },
      },
      {
        path: "/pm/activity-tm",
        name: "PMActivityTM",
        component: () => import("@/views/pm/Activity-TM.vue"),
        meta: { requiresAuth: true, roles: ["admin", "team_member"] },
      },
      {
        path: "/pm/activity-tm2",
        name: "PMActivityTM2",
        component: () => import("@/views/pm/Activity-TM(2).vue"),
        meta: { requiresAuth: true, roles: ["admin", "team_member"] },
      },
      {
        path: "/pm/activity-tl",
        name: "PMActivityTL",
        component: () => import("@/views/pm/Activity-TL.vue"),
        meta: { requiresAuth: true, roles: ["admin", "team_leader"] },
      },
      {
        path: "/pm/activity-tl2",
        name: "PMActivityTL2",
        component: () => import("@/views/pm/Activity-TL(2).vue"),
        meta: { requiresAuth: true, roles: ["admin", "team_leader"] },
      },
      {
        path: "/pm/bira",
        name: "BIRAProblem",
        component: () => import("@/views/pm/BIRAProblem.vue"),
        meta: { requiresAuth: true, roles: ["admin", "team_leader"] },
      },
      {
        path: "/pm/machine",
        name: "RTMMAS",
        component: () => import("@/views/pm/RTMMAS.vue"),
        meta: {
          requiresAuth: true,
          roles: ["admin", "team_leader", "team_member"],
        },
      },
      {
        path: "/pm/machine/:id",
        name: "MachineMonitor",
        component: () => import("@/views/pm/MachineMonitor.vue"),
        meta: {
          requiresAuth: true,
          roles: ["admin", "team_leader", "team_member"],
        },
        props: true,
      },
      {
        path: "/pm/user-management",
        name: "UserManagement",
        component: () => import("@/views/pm/UserManagement.vue"),
        meta: { requiresAuth: true, roles: ["admin"] },
      },
      {
        path: "/pm/change-log",
        name: "ChangeLog",
        component: () => import("@/views/pm/ChangeLog.vue"),
        meta: { requiresAuth: true, roles: ["admin"] },
      },

      /*define other in here*/
    ],
  },
  {
    path: "/404",
    name: "Page404",
    component: () => import("@/views/pages/Page404"),
  },
  {
    path: "/500",
    name: "Page500",
    component: () => import("@/views/pages/Page500"),
  },
  // Catch all route for undefined paths
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 };
  },
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Show loading indicator if needed
  store.commit("auth/SET_LOADING", true);

  try {
    // Check if route requires authentication
    const authRequired = !PUBLIC_ROUTES.includes(to.path);

    // Special handling for login page
    if (to.path === "/login") {
      const isAuthenticated = store.getters["auth/isAuthenticated"];
      if (isAuthenticated) {
        const isValid = await store.dispatch("auth/verifyToken");
        if (isValid) {
          const userRole = store.getters["auth/userRole"];
          return next(getRedirectPath(userRole));
        }
      }
      return next();
    }

    // Handle protected routes
    if (authRequired) {
      const isAuthenticated = store.getters["auth/isAuthenticated"];

      if (!isAuthenticated) {
        return next("/login");
      }

      // Verify token for protected routes
      const isValid = await store.dispatch("auth/verifyToken");
      if (!isValid) {
        return next("/login");
      }

      // Check role-based access
      const userRole = store.getters["auth/userRole"];
      const requiresRole = to.meta.roles;

      if (requiresRole && !requiresRole.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        return next(getRedirectPath(userRole));
      }
    }

    // Allow navigation
    next();
  } catch (error) {
    console.error("Navigation error:", error);
    next("/500");
  } finally {
    // Hide loading indicator
    store.commit("auth/SET_LOADING", false);
  }
});

// Helper function to get redirect path based on role
function getRedirectPath(role) {
  switch (role) {
    case "team_leader":
      return "/pm/activity-tl2";
    case "team_member":
      return "/pm/activity-tm2";
    case "admin":
      return "/app/dashboard";
    default:
      return "/app/dashboard";
  }
}

export default router;
