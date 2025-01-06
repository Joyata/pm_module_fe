import axios from "axios";
import Swal from "sweetalert2";
import store from "@/store";
import router from "@/router";

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Handle hot reload
if (module.hot) {
  module.hot.accept(() => {
    // Rehydrate auth state when module is hot reloaded
    store.dispatch("auth/rehydrateAuth");
  });
}

// Request interceptor to handle authorization
api.interceptors.request.use(
  (config) => {
    // Always get fresh token from localStorage
    const token = localStorage.getItem("id_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Only attempt refresh if not already on login page and not verifying token
      if (
        !window.location.url.includes("/login") &&
        !originalRequest.url.includes("/verify")
      ) {
        try {
          // Verify token
          const refreshed = await store.dispatch("auth/refreshToken");
          if (refreshed) {
            // Update token in request and retry
            const newToken = localStorage.getItem("id_token");
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }

        // Show session expired message if not on login page
        if (!window.location.pathname.includes("/login")) {
          await Swal.fire({
            icon: "warning",
            title: "Session Expired",
            text: "Your session has expired. Please login again.",
            confirmButtonColor: "#c41e3a",
          });
          await store.dispatch("auth/logout");
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = async (apiCall, callback) => {
  try {
    const response = await apiCall();
    return callback ? callback(response, null) : response;
  } catch (error) {
    // Log error for debugging
    console.error("API error:", error);

    // Handle network errors
    if (!error.response) {
      const networkError = {
        status: 0,
        data: { message: "Network error. Please check your connection." },
      };
      return callback ? callback(networkError, error) : error;
    }

    return callback ? callback(error.response, error) : error;
  }
};

export default {
  async getCommon(url, params, callback) {
    return handleResponse(
      () => api.get(`/api/common${url}${params}`),
      callback
    );
  },

  async get(url, params = "", callback) {
    const detailUrl = params === "?" ? url : `${url}/search${params}`;
    return handleResponse(() => api.get(detailUrl), callback);
  },

  async post(url, params, options = {}) {
    try {
      // Handle FormData
      if (params instanceof FormData) {
        console.log("Sending FormData to:", url);
        // Log FormData entries for debugging
        for (let pair of params.entries()) {
          console.log(pair[0], pair[1] instanceof Blob ? "Blob" : pair[1]);
        }

        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
            // Remove any existing Content-Type header
            ...options.headers,
          },
        };

        // Log the final request config
        console.log("Request config:", config);

        const response = await api.post(url, params, config);
        return handleResponse(() => Promise.resolve(response));
      }

      // Handle regular JSON data
      return handleResponse(() => api.post(url, params));
    } catch (error) {
      console.error("API Post Error:", error);
      console.error("Request details:", {
        url,
        isFormData: params instanceof FormData,
        headers: options.headers,
      });
      throw error;
    }
  },

  async put(url, id, params, callback) {
    const user = JSON.parse(localStorage.getItem("user"));

    // Format params to match backend expectations
    const formattedParams = {
      ...params,
      id: id,
    };

    return handleResponse(
      () => api.put(`${url}?id=${id}`, formattedParams),
      callback
    );
  },

  async delete(url, id, callback) {
    const user = JSON.parse(localStorage.getItem("user"));
    return handleResponse(
      () =>
        api.put(`${url}?id=${id}`, {
          id: id,
        }),
      callback
    );
  },

  async register(url, params, callback) {
    return handleResponse(() => api.post(url, params), callback);
  },
};
