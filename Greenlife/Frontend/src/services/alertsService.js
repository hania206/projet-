import api from "./api";

export const getAlerts = async () => {
  const res = await api.get("/alerts");
  return res.data;
};