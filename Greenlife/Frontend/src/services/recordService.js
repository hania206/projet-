import API from "./api"; // ✅ correspond au default export

export const getStats = async () => {
  try {
    const res = await API.get("/stats");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors du chargement des statistiques" };
  }
};