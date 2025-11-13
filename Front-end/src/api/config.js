import axios from "axios";

const api = axios.create({
  // backend default port changed to 5001 to avoid macOS services on 5000
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  // Increase timeout to reduce false 'No response' errors on slow dev machines
  timeout: 15000,
});

// Attach auth token automatically from localStorage for all requests
api.interceptors.request.use(
  (config) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handler: if server returns 401, clear stored credentials and
// prompt a re-login so users get a fresh token. This prevents silent failures
// where the UI cannot perform authenticated actions because the token expired.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    try {
      if (err?.response?.status === 401) {
        // Clear auth and redirect to login page
        try {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
        } catch (e) {}
        // Avoid triggering multiple redirects if many requests fail at once.
        // Use a simple global guard so redirect happens only once per session.
        try {
          if (!window.__authRedirecting) {
            window.__authRedirecting = true;
            // small delay so callers can finish handling if needed
            window.setTimeout(() => {
              try {
                window.location.href = "/auth";
              } catch (e) {}
            }, 300);
          }
        } catch (e) {
          console.error("Auth redirect guard error", e);
        }
      }
    } catch (e) {}
    return Promise.reject(err);
  }
);

export default api;
