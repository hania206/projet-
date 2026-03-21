import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getAlerts = () => API.get("/alerts");
export const getObjectives = () => API.get("/objectives");

export const loginUser = (data) => API.post("/users/login", data);
export const registerUser = (data) => API.post("/users/register", data);