import axios from "axios";

const API_URL = "http://localhost:5000/api/users"; // matches backend

export const registerUser = (data) => {
  // data doit être FormData si image
  return axios.post(`${API_URL}/register`, data);
};

export const loginUser = (data) => {
  return axios.post(`${API_URL}/login`, data);
};
