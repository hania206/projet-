// src/services/objectivesService.js
import API from "./api";

// Fonction pour récupérer les objectifs écologiques
export const getObjectives = async () => {
  try {
    const res = await API.get("/objectives"); // GET /api/objectives
    return res.data; // renvoie les objectifs
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors du chargement des objectifs" };
  }
};