import Swal from "sweetalert2";
import api from "@/apis/CommonAPI";
import router from "@/router";

// Constants
const TOKEN_VERIFY_CACHE_TIME = 30000; // 30 seconds
const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

// Cache verification timestamp
let lastVerifiedTime = 0;

const initializeAuthState = () => {
  try {
    return {
      token: localStorage.getItem("id_token"),
      user: JSON.parse(localStorage.getItem("user")),
      tokenExpiresAt: localStorage.getItem("token_expires_at"),
      loading: false,
      verifying: false,
      logoutTimer: null,
    };
  } catch (e) {
    console.error("Error initializing auth state:", e);
    // Clear potentially corrupted data
    localStorage.removeItem("id_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expires_at");
    return {
      token: null,
      user: null,
      tokenExpiresAt: null,
      loading: false,
      verifying: false,
      logoutTimer: null,
    };
  }
};

export default {
  namespaced: true,
  state: initializeAuthState(),

  mutations: {
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    SET_VERIFYING(state, isVerifying) {
      state.verifying = isVerifying;
    },
    SET_AUTH_DATA(state, { token, user, expiresAt }) {
      state.token = token;
      state.user = user;
      state.tokenExpiresAt = expiresAt;

      // Update localStorage
      localStorage.setItem("id_token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token_expires_at", expiresAt.toString());
    },
    SET_LOGOUT_TIMER(state, timer) {
      if (state.logoutTimer) {
        clearTimeout(state.logoutTimer);
      }
      state.logoutTimer = timer;
    },
    CLEAR_AUTH_DATA(state) {
      state.token = null;
      state.user = null;
      state.tokenExpiresAt = null;

      if (state.logoutTimer) {
        clearTimeout(state.logoutTimer);
        state.logoutTimer = null;
      }

      localStorage.removeItem("id_token");
      localStorage.removeItem("user");
      localStorage.removeItem("token_expires_at");
    },
    UPDATE_USER(state, user) {
      state.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
    // Add a mutation to handle hot reload
    REHYDRATE_AUTH(state) {
      const newState = initializeAuthState();
      Object.assign(state, newState);
    },
  },
  actions: {
    async login({ commit, dispatch }, credentials) {
      commit("SET_LOADING", true);
      try {
        const response = await api.post("/login/login", credentials);
        console.log("Login response:", response);

        if (response.data?.status === 200) {
          const { token, user } = response.data.data;
          const expiresAt = new Date().getTime() + TOKEN_EXPIRY_TIME;

          // Make sure user object includes assignments fields
          const userData = {
            ...user,
            assignments: user.assignments || [],
          };

          commit("SET_AUTH_DATA", { token, user: userData, expiresAt });

          // Setup auto logout
          const logoutTimer = setTimeout(() => {
            dispatch("logout");
            Swal.fire({
              icon: "warning",
              title: "Session Expired",
              text: "Your session has expired. Please login again.",
              confirmButtonColor: "#c41e3a",
            });
          }, TOKEN_EXPIRY_TIME);

          // Store timer ID to clear on manual logout
          commit("SET_LOGOUT_TIMER", logoutTimer);

          // Reset verification cache
          lastVerifiedTime = new Date().getTime();

          // Determine redirect path based on role
          return {
            success: true,
            redirectPath: getRedirectPath(userData.role),
          };
        } else {
          throw new Error(response.data?.message || "Login failed");
        }
      } catch (error) {
        console.error("Login error:", error);
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: error.response?.data?.message || "Invalid username or password",
          confirmButtonColor: "#c41e3a",
        });
        return { success: false };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async verifyToken({ commit, state }) {
      if (!state.token) return false;

      // Check cache first
      const now = new Date().getTime();
      if (now - lastVerifiedTime < TOKEN_VERIFY_CACHE_TIME) return true;

      commit("SET_VERIFYING", true);
      try {
        const response = await api.post("/login/verify");

        if (response.data?.status === 200) {
          lastVerifiedTime = now;
          if (response.data.data?.user) {
            commit("UPDATE_USER", response.data.data.user);
          }
          return true;
        }

        return false;
      } catch (error) {
        console.error("Token verification error:", error);
        if (error.response?.status === 401) {
          commit("CLEAR_AUTH_DATA");
        }
        return false;
      } finally {
        commit("SET_VERIFYING", false);
      }
    },

    async refreshToken({ commit }) {
      try {
        const response = await api.post("/login/refresh");
        if (response.data?.status === 200) {
          const { token, user } = response.data.data;
          const expiresAt = new Date().getTime() + TOKEN_EXPIRY_TIME;

          commit("SET_AUTH_DATA", {
            token,
            user,
            expiresAt,
          });
          lastVerifiedTime = new Date().getTime(); // Reset verification cache
          return true;
        }
        return false;
      } catch (error) {
        console.error("Token refresh failed:", error);
        return false;
      }
    },

    async logout({ commit }) {
      try {
        await api.post("/login/logout");
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        commit("CLEAR_AUTH_DATA");
        router.push("/login");
      }
    },

    rehydrateAuth({ commit }) {
      commit("REHYDRATE_AUTH");
    },
  },
  getters: {
    isAuthenticated: (state) => {
      return !!state.token && !isTokenExpired(state.tokenExpiresAt);
    },
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role,
    isLoading: (state) => state.loading,
    isVerifying: (state) => state.verifying,
    userAssignments: (state) => state.user?.assignments || {},
    authToken: (state) => state.token,
  },
};

// Helper functions
function isTokenExpired(expiresAt) {
  if (!expiresAt) return true;
  return new Date().getTime() > parseInt(expiresAt);
}

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
