import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ===============================
// ADD TOKEN AUTOMATICALLY
// ===============================
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ===============================
// HANDLE 401 PROPERLY
// ===============================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      const path = window.location.pathname;

      // éviter boucle login
      if (path !== "/login") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ===============================
// AUTH
// ===============================
export const loginUser = (data) =>
  API.post("/users/login", data);

export const registerUser = (data) =>
  API.post("/users/register", data);

// ===============================
// OTHER API CALLS
// ===============================
export const getAlerts = () => API.get("/alerts");

export const getObjectives = () => API.get("/objectives");

export const getDashboardStats = () =>
  API.get("/consumptions/dashboard-stats");

export default API;