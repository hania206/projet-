import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  fr: {
    translation: {
      "settings_title": "Paramètres",
      "tab_profile": "Profil",
      "tab_prefs": "Préférences",
      "logout": "Déconnexion",
      "label_dark_mode": "Mode Sombre",
      "label_language": "Langue",
      "label_notifications": "Notifications",
      "btn_save": "Sauvegarder",
      "label_name": "Nom complet",
      "label_email": "Adresse e-mail",
      "success_message": "Profil mis à jour avec succès !",
      "error_fields": "Veuillez remplir tous les champs.",
      "error_server": "Erreur lors de la connexion au serveur."
    }
  },
  en: {
    translation: {
      "settings_title": "Settings",
      "tab_profile": "Profile",
      "tab_prefs": "Preferences",
      "logout": "Logout",
      "label_dark_mode": "Dark Mode",
      "label_language": "Language",
      "label_notifications": "Notifications",
      "btn_save": "Save Changes",
      "label_name": "Full Name",
      "label_email": "Email Address",
      "success_message": "Profile updated successfully!",
      "error_fields": "Please fill in all fields.",
      "error_server": "Error connecting to server."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "fr",
    interpolation: { escapeValue: false }
  });

export default i18n;