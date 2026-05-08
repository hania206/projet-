import React, { useState, useEffect, useCallback } from "react";
import { 
  ArrowLeft, Moon, Globe, User, Mail, LogOut, 
  CheckCircle2, Camera, ChevronRight, Laptop, 
  AlertTriangle, Shield, Save, Trash2, Key, X, 
  Bell, BellOff
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";

// ==================== TRADUCTIONS ====================
const translations = {
  fr: {
    settings: "Paramètres", manageProfile: "Gérez votre profil et vos préférences",
    profile: "Profil", preferences: "Préférences", security: "Sécurité", logout: "Déconnexion",
    myProfile: "Mon Profil", fullName: "Nom complet", email: "Email",
    save: "Enregistrer", saving: "Enregistrement...",
    darkMode: "Mode sombre", darkModeDesc: "Thème sombre pour réduire la fatigue oculaire",
    languageLabel: "Langue", languageDesc: "Choisissez votre langue",
    notifications: "Notifications", notificationsOn: "Activées", notificationsOff: "Désactivées",
    password: "Mot de passe", passwordDesc: "Modifier votre mot de passe",
    modify: "Modifier", cancel: "Annuler",
    currentPassword: "Mot de passe actuel", newPassword: "Nouveau mot de passe (min. 6)",
    confirmPassword: "Confirmer le mot de passe", changePassword: "Changer le mot de passe",
    deleteAccount: "Supprimer le compte", deleteAccountDesc: "Action irréversible",
    delete: "Supprimer", deleteConfirm: "Confirmer la suppression",
    deleteWarning: "⚠️ Toutes vos données seront perdues.",
    deleting: "Suppression...", photoRemove: "Supprimer la photo",
    profileUpdated: "✅ Profil mis à jour !", passwordChanged: "✅ Mot de passe changé !",
    languageChanged: "✅ Langue changée", notificationsActivated: "🔔 Notifications activées",
    notificationsDeactivated: "🔕 Notifications désactivées",
    sessionExpired: "Session expirée. Reconnectez-vous.",
    nameRequired: "Nom requis", emailRequired: "Email requis", emailInvalid: "Email invalide",
    currentPasswordRequired: "Mot de passe actuel requis", newPasswordRequired: "Nouveau mot de passe requis",
    passwordLength: "6 caractères minimum", passwordsDontMatch: "Mots de passe différents",
    imageType: "Image JPG, PNG ou GIF", imageSize: "Max 5MB",
    currentLanguage: "Langue actuelle", admin: "Admin", serverError: "Erreur serveur",
    apiNotFound: "API introuvable. Vérifiez le port 5000."
  },
  en: {
    settings: "Settings", manageProfile: "Manage your profile and preferences",
    profile: "Profile", preferences: "Preferences", security: "Security", logout: "Logout",
    myProfile: "My Profile", fullName: "Full Name", email: "Email",
    save: "Save", saving: "Saving...",
    darkMode: "Dark Mode", darkModeDesc: "Dark theme to reduce eye strain",
    languageLabel: "Language", languageDesc: "Choose your language",
    notifications: "Notifications", notificationsOn: "Enabled", notificationsOff: "Disabled",
    password: "Password", passwordDesc: "Change your password",
    modify: "Modify", cancel: "Cancel",
    currentPassword: "Current password", newPassword: "New password (min. 6)",
    confirmPassword: "Confirm password", changePassword: "Change Password",
    deleteAccount: "Delete Account", deleteAccountDesc: "Irreversible action",
    delete: "Delete", deleteConfirm: "Confirm Deletion",
    deleteWarning: "⚠️ All your data will be lost.",
    deleting: "Deleting...", photoRemove: "Remove photo",
    profileUpdated: "✅ Profile updated!", passwordChanged: "✅ Password changed!",
    languageChanged: "✅ Language changed", notificationsActivated: "🔔 Notifications enabled",
    notificationsDeactivated: "🔕 Notifications disabled",
    sessionExpired: "Session expired. Login again.",
    nameRequired: "Name required", emailRequired: "Email required", emailInvalid: "Invalid email",
    currentPasswordRequired: "Current password required", newPasswordRequired: "New password required",
    passwordLength: "6 characters minimum", passwordsDontMatch: "Passwords don't match",
    imageType: "JPG, PNG or GIF image", imageSize: "Max 5MB",
    currentLanguage: "Current language", admin: "Admin", serverError: "Server error",
    apiNotFound: "API not found. Check port 5000."
  },
  ar: {
    settings: "الإعدادات", manageProfile: "إدارة ملفك الشخصي وتفضيلاتك",
    profile: "الملف الشخصي", preferences: "التفضيلات", security: "الأمان", logout: "تسجيل الخروج",
    myProfile: "ملفي الشخصي", fullName: "الاسم الكامل", email: "البريد الإلكتروني",
    save: "حفظ", saving: "جاري الحفظ...",
    darkMode: "الوضع الداكن", darkModeDesc: "مظهر داكن لتقليل إجهاد العين",
    languageLabel: "اللغة", languageDesc: "اختر لغتك",
    notifications: "الإشعارات", notificationsOn: "مفعلة", notificationsOff: "معطلة",
    password: "كلمة المرور", passwordDesc: "تغيير كلمة المرور",
    modify: "تعديل", cancel: "إلغاء",
    currentPassword: "كلمة المرور الحالية", newPassword: "كلمة مرور جديدة (6 أحرف)",
    confirmPassword: "تأكيد كلمة المرور", changePassword: "تغيير كلمة المرور",
    deleteAccount: "حذف الحساب", deleteAccountDesc: "إجراء لا رجعة فيه",
    delete: "حذف", deleteConfirm: "تأكيد الحذف",
    deleteWarning: "⚠️ ستفقد جميع بياناتك.",
    deleting: "جاري الحذف...", photoRemove: "إزالة الصورة",
    profileUpdated: "✅ تم تحديث الملف!", passwordChanged: "✅ تم تغيير كلمة المرور!",
    languageChanged: "✅ تم تغيير اللغة", notificationsActivated: "🔔 الإشعارات مفعلة",
    notificationsDeactivated: "🔕 الإشعارات معطلة",
    sessionExpired: "انتهت الجلسة. سجل الدخول مرة أخرى.",
    nameRequired: "الاسم مطلوب", emailRequired: "البريد مطلوب", emailInvalid: "بريد غير صالح",
    currentPasswordRequired: "كلمة المرور الحالية مطلوبة", newPasswordRequired: "كلمة مرور جديدة مطلوبة",
    passwordLength: "6 أحرف على الأقل", passwordsDontMatch: "كلمات المرور مختلفة",
    imageType: "صورة JPG, PNG أو GIF", imageSize: "الحد الأقصى 5MB",
    currentLanguage: "اللغة الحالية", admin: "مدير", serverError: "خطأ في الخادم",
    apiNotFound: "API غير موجود. تحقق من المنفذ 5000."
  }
};

// ==================== COMPOSANT ====================
export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem("notificationsEnabled") !== "false"
  );
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "fr");
  const t = translations[language] || translations.fr;

  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true" || window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("userInfo");
      if (saved) {
        const p = JSON.parse(saved);
        const u = p.user || p;
        return {
          _id: u._id || "", nom: u.nom || "", prenom: u.prenom || "",
          name: `${u.nom || ""} ${u.prenom || ""}`.trim(), email: u.email || "",
          avatarUrl: u.avatar ? `${API_URL}/${u.avatar.replace(/\\/g, '/')}` : "",
          role: u.role || "client", token: p.token || localStorage.getItem("token") || ""
        };
      }
    } catch (parseErr) {
      console.error("❌ Erreur parsing userInfo:", parseErr);
    }
    return { name: "", email: "", avatarUrl: "", token: "", role: "client" };
  });

  const getToken = useCallback(() => user.token || localStorage.getItem("token"), [user.token]);

  // ==================== EFFECTS ====================
  useEffect(() => { if (!getToken()) navigate("/login"); }, [navigate, getToken]);
  
  useEffect(() => {
    const r = document.documentElement;
    darkMode ? r.classList.add("dark") : r.classList.remove("dark");
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);
  
  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);
  
  useEffect(() => { localStorage.setItem("notificationsEnabled", String(notificationsEnabled)); }, [notificationsEnabled]);
  
  useEffect(() => { return () => { if (preview) URL.revokeObjectURL(preview); }; }, [preview]);

  // ==================== ACTIONS ====================
  const handleFileChange = useCallback((e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return setMessage({ type: "error", text: t.imageType });
    if (f.size > 5*1024*1024) return setMessage({ type: "error", text: t.imageSize });
    if (preview) URL.revokeObjectURL(preview);
    setFile(f); setPreview(URL.createObjectURL(f)); setMessage({ type: "", text: "" });
  }, [preview, t]);

  const handleRemoveAvatar = useCallback(() => {
    setFile(null); if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
    setUser(p => ({ ...p, avatarUrl: "" }));
  }, [preview]);

  // ✅ updateProfile - catch(err) corrigé
  const updateProfile = useCallback(async () => {
    if (!user.name.trim()) return setMessage({ type: "error", text: t.nameRequired });
    if (!user.email.trim()) return setMessage({ type: "error", text: t.emailRequired });
    if (!/^\S+@\S+\.\S+$/.test(user.email.trim())) return setMessage({ type: "error", text: t.emailInvalid });
    setLoading(true); setMessage({ type: "", text: "" });
    try {
      const token = getToken();
      const parts = user.name.trim().split(" ");
      const nom = parts[0] || "", prenom = parts.slice(1).join(" ") || "";
      let res;
      if (file) {
        const fd = new FormData();
        fd.append("nom", nom); fd.append("prenom", prenom);
        fd.append("email", user.email.trim().toLowerCase()); fd.append("avatar", file);
        res = await axios.put(`${API_URL}/api/users/profile`, fd, { 
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } 
        });
      } else {
        res = await axios.put(`${API_URL}/api/users/profile`, { nom, prenom, email: user.email.trim().toLowerCase() }, { 
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } 
        });
      }
      const u = res.data.user || res.data;
      const saved = JSON.parse(localStorage.getItem("userInfo") || "{}");
      localStorage.setItem("userInfo", JSON.stringify({ ...saved, user: u, token: saved.token || token }));
      localStorage.setItem("user", JSON.stringify(u));
      setUser(p => ({ 
        ...p, nom: u.nom || nom, prenom: u.prenom || prenom, email: u.email || p.email, 
        name: `${u.nom || nom} ${u.prenom || prenom}`.trim(), 
        avatarUrl: u.avatar ? `${API_URL}/${u.avatar.replace(/\\/g, '/')}` : p.avatarUrl 
      }));
      setPreview(null); setFile(null); setMessage({ type: "success", text: t.profileUpdated });
    } catch (err) {
      console.error("❌ updateProfile:", err);
      if (err.response?.status === 401) { 
        setMessage({ type: "error", text: t.sessionExpired }); 
        setTimeout(() => { localStorage.clear(); navigate("/login"); }, 2000); 
      } else if (err.response?.status === 404) {
        setMessage({ type: "error", text: t.apiNotFound });
      } else {
        setMessage({ type: "error", text: err.response?.data?.message || t.serverError });
      }
    } finally { 
      setLoading(false); 
      setTimeout(() => setMessage(p => p.type === "success" ? { type: "", text: "" } : p), 5000); 
    }
  }, [user.name, user.email, file, getToken, navigate, t]);

  // ✅ handlePasswordChange - catch(err) corrigé
  const handlePasswordChange = useCallback(async () => {
    if (!passwordData.currentPassword) return setMessage({ type: "error", text: t.currentPasswordRequired });
    if (!passwordData.newPassword) return setMessage({ type: "error", text: t.newPasswordRequired });
    if (passwordData.newPassword.length < 6) return setMessage({ type: "error", text: t.passwordLength });
    if (passwordData.newPassword !== passwordData.confirmPassword) return setMessage({ type: "error", text: t.passwordsDontMatch });
    setLoading(true); setMessage({ type: "", text: "" });
    try {
      await axios.put(`${API_URL}/api/users/change-password`, { 
        currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword 
      }, { headers: { Authorization: `Bearer ${getToken()}` } });
      setMessage({ type: "success", text: t.passwordChanged }); setShowPasswordForm(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("❌ changePassword:", err);
      setMessage({ type: "error", text: err.response?.data?.message || t.serverError });
    } finally { setLoading(false); }
  }, [passwordData, getToken, t]);

  // ✅ handleDeleteAccount - catch(err) corrigé
  const handleDeleteAccount = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.delete(`${API_URL}/api/users/profile`, { 
        headers: { Authorization: `Bearer ${getToken()}` } 
      });
      alert(data.message || "Compte supprimé"); localStorage.clear(); navigate("/login");
    } catch (err) {
      console.error("❌ deleteAccount:", err);
      if (err.response?.status === 403) {
        setMessage({ type: "error", text: err.response.data?.message || t.deleteAccountDesc });
      } else if (err.response?.status === 401) { 
        setMessage({ type: "error", text: t.sessionExpired }); 
        setTimeout(() => { localStorage.clear(); navigate("/login"); }, 2000); 
      } else if (err.response?.status === 404) {
        setMessage({ type: "error", text: t.apiNotFound });
      } else {
        setMessage({ type: "error", text: err.response?.data?.message || t.serverError });
      }
      setShowDeleteConfirm(false);
    } finally { setLoading(false); }
  }, [getToken, navigate, t]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("userInfo"); localStorage.removeItem("user"); localStorage.removeItem("token"); 
    navigate("/login");
  }, [navigate]);

  const handleLanguageChange = useCallback((e) => {
    const l = e.target.value; setLanguage(l);
    const m = { fr: "✅ Français", en: "✅ English", ar: "✅ العربية" };
    setMessage({ type: "success", text: m[l] || t.languageChanged });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, [t]);

  const handleNotificationsToggle = useCallback((on) => {
    setNotificationsEnabled(on);
    setMessage({ type: "success", text: on ? t.notificationsActivated : t.notificationsDeactivated });
    if (on && "Notification" in window && Notification.permission === "default") Notification.requestPermission();
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, [t]);

  // ==================== RENDU ====================
  const msgIcon = message.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />;
  const msgColor = message.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="p-3 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700 transition"><ArrowLeft size={20} /></button>
            <div><h1 className="text-3xl font-black">{t.settings}</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.manageProfile}</p></div>
          </div>
          {message.text && (
            <div className={`px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg animate-slide-in ${msgColor}`}>
              {msgIcon}{message.text}<button onClick={() => setMessage({ type: "", text: "" })} className="ml-2 hover:opacity-80"><X size={16} /></button>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-2">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <TabButton active={activeTab==="profile"} onClick={()=>setActiveTab("profile")} icon={<User size={18}/>} label={t.profile} />
              <TabButton active={activeTab==="prefs"} onClick={()=>setActiveTab("prefs")} icon={<Laptop size={18}/>} label={t.preferences} />
              <TabButton active={activeTab==="security"} onClick={()=>setActiveTab("security")} icon={<Shield size={18}/>} label={t.security} />
              <div className="border-t border-slate-100 dark:border-slate-800 my-2" />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20"><LogOut size={18} />{t.logout}</button>
            </div>
          </aside>

          <main className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800">
              
              {activeTab==="profile" && (
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2"><User size={22} className="text-emerald-500"/>{t.myProfile}</h2>
                  <div className="flex flex-col items-center sm:flex-row gap-6 mb-6">
                    <div className="relative">
                      <img src={preview||user.avatarUrl||`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name||'User')}&background=10b981&color=fff&size=128`} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg" onError={e=>{e.target.src=`https://ui-avatars.com/api/?name=User&background=10b981&color=fff&size=128`}}/>
                      <label className="absolute bottom-1 right-1 bg-emerald-500 p-2.5 rounded-full cursor-pointer text-white hover:scale-110 transition-transform shadow-lg"><Camera size={16}/><input type="file" hidden onChange={handleFileChange} accept="image/*"/></label>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-bold">{user.name||"Utilisateur"}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
                      {user.role==="admin"&&<span className="inline-block mt-1 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">{t.admin}</span>}
                      {(file||user.avatarUrl)&&<button onClick={handleRemoveAvatar} className="mt-2 text-xs text-red-500 hover:text-red-600 font-medium">{t.photoRemove}</button>}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <InputField label={t.fullName} value={user.name} onChange={v=>setUser({...user,name:v})} icon={<User size={18}/>}/>
                    <InputField label={t.email} value={user.email} onChange={v=>setUser({...user,email:v})} icon={<Mail size={18}/>} type="email"/>
                  </div>
                  <button onClick={updateProfile} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading?<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<Save size={20}/>}{loading?t.saving:t.save}
                  </button>
                </section>
              )}

              {activeTab==="prefs" && (
                <section className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Laptop size={22} className="text-emerald-500"/>{t.preferences}</h2>
                  <ToggleItem icon={<Moon size={20} className="text-indigo-500"/>} label={t.darkMode} description={t.darkModeDesc} checked={darkMode} onChange={setDarkMode}/>
                  <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex gap-4 items-center"><div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm"><Globe size={20} className="text-blue-500"/></div><div><p className="font-bold">{t.languageLabel}</p><p className="text-xs text-slate-400">{t.languageDesc}</p></div></div>
                    <select className="bg-white dark:bg-slate-700 font-bold outline-none border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 text-sm cursor-pointer" value={language} onChange={handleLanguageChange}><option value="fr">🇫🇷 Français</option><option value="en">🇬🇧 English</option><option value="ar">🇹🇳 العربية</option></select>
                  </div>
                  <ToggleItem icon={notificationsEnabled?<Bell size={20} className="text-amber-500"/>:<BellOff size={20} className="text-gray-400"/>} label={t.notifications} description={notificationsEnabled?t.notificationsOn:t.notificationsOff} checked={notificationsEnabled} onChange={handleNotificationsToggle}/>
                </section>
              )}

              {activeTab==="security" && (
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Shield size={22} className="text-emerald-500"/>{t.security}</h2>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3"><Key size={20} className="text-emerald-500"/><div><p className="font-bold">{t.password}</p><p className="text-xs text-slate-400">{t.passwordDesc}</p></div></div>
                      <button onClick={()=>{setShowPasswordForm(!showPasswordForm);if(showPasswordForm)setPasswordData({currentPassword:"",newPassword:"",confirmPassword:""})}} className="text-sm font-bold text-emerald-600 hover:text-emerald-700">{showPasswordForm?t.cancel:t.modify}</button>
                    </div>
                    {showPasswordForm&&(
                      <div className="space-y-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <input type="password" placeholder={t.currentPassword} value={passwordData.currentPassword} onChange={e=>setPasswordData(p=>({...p,currentPassword:e.target.value}))} className="w-full p-3 bg-white dark:bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"/>
                        <input type="password" placeholder={t.newPassword} value={passwordData.newPassword} onChange={e=>setPasswordData(p=>({...p,newPassword:e.target.value}))} className="w-full p-3 bg-white dark:bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"/>
                        <input type="password" placeholder={t.confirmPassword} value={passwordData.confirmPassword} onChange={e=>setPasswordData(p=>({...p,confirmPassword:e.target.value}))} className="w-full p-3 bg-white dark:bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"/>
                        <button onClick={handlePasswordChange} disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500 transition disabled:opacity-50">{loading?"...":t.changePassword}</button>
                      </div>
                    )}
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3"><Trash2 size={20} className="text-red-500"/><div><p className="font-bold text-red-600">{t.deleteAccount}</p><p className="text-xs text-red-400">{t.deleteAccountDesc}</p></div></div>
                      <button onClick={()=>setShowDeleteConfirm(true)} className="text-sm font-bold text-red-600 hover:text-red-700 bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-xl">{t.delete}</button>
                    </div>
                    {showDeleteConfirm&&(
                      <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 mb-3 font-medium">{t.deleteWarning}</p>
                        <div className="flex gap-2">
                          <button onClick={handleDeleteAccount} disabled={loading} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold hover:bg-red-500 transition disabled:opacity-50">{loading?t.deleting:t.deleteConfirm}</button>
                          <button onClick={()=>setShowDeleteConfirm(false)} className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-slate-600 transition">{t.cancel}</button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
              <p className="text-center text-emerald-500 font-bold mt-6 text-sm">🌐 {t.currentLanguage}: {language==='fr'?'Français':language==='en'?'English':'العربية'}</p>
            </div>
          </main>
        </div>
      </div>
      <style>{`@keyframes slide-in{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}.animate-slide-in{animation:slide-in .3s ease-out}`}</style>
    </div>
  );
}

// ==================== SOUS-COMPOSANTS ====================
function TabButton({ active, onClick, icon, label }) {
  return <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all mb-1 ${active?"bg-emerald-500 text-white shadow-lg shadow-emerald-200":"text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}><div className="flex items-center gap-3">{icon}<span>{label}</span></div><ChevronRight size={16} className={active?"opacity-100":"opacity-0"}/></button>;
}

function InputField({ label, value, onChange, icon, type = "text" }) {
  return <div className="space-y-2"><label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label><div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div><input type={type} value={value} onChange={e=>onChange(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-medium transition-all dark:text-white"/></div></div>;
}

function ToggleItem({ icon, label, description, checked, onChange }) {
  return <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50"><div className="flex gap-4 items-center"><div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm">{icon}</div><div><p className="font-bold">{label}</p>{description&&<p className="text-xs text-slate-400 mt-0.5">{description}</p>}</div></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={checked} onChange={()=>onChange(!checked)}/><div className="w-12 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"/></label></div>;
}