import axios from "axios";

const isDocker = import.meta.env.VITE_DOCKER === 'true';
// Ride service API (port 5001)
const rideApi = axios.create({
  baseURL: isDocker 
  ? "http://localhost:5003/api" 
  : "http://localhost:5003/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

// Auth service API (port 5002)
const authApi = axios.create({
  baseURL: isDocker 
    ? "http://localhost:5001/api" 
    : "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});
const marketplaceApi = axios.create({
  baseURL: isDocker 
    ? "http://localhost:5000/api" 
    : "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

// Attach auth token for both services
const attachToken = (config) => {
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
};

rideApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));
authApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));
marketplaceApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));

// Global response handler for 401
const handle401 = (err) => {
  try {
    if (err?.response?.status === 401) {
      console.log("401 error received:", err.config?.url, err.response?.data);
      
      // Don't redirect if we're already on the auth page
      if (window.location.pathname === "/auth") {
        return Promise.reject(err);
      }
      
      try {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      } catch (e) {}
      
      try {
        if (!window.__authRedirecting) {
          window.__authRedirecting = true;
          console.log("Redirecting to auth page in 1 second...");
          window.setTimeout(() => {
            try {
              window.location.href = "/auth";
            } catch (e) {}
          }, 1000); // Increased delay so user can see error message
        }
      } catch (e) {
        console.error("Auth redirect guard error", e);
      }
    }
  } catch (e) {}
  return Promise.reject(err);
};

rideApi.interceptors.response.use((res) => res, handle401);
authApi.interceptors.response.use((res) => res, handle401);
marketplaceApi.interceptors.response.use((res) => res, handle401);

// Default export for ride service (backward compatibility)
export default rideApi;

// Named exports for specific services
export { rideApi, authApi, marketplaceApi };