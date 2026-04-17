import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Moon, Globe, Upload, User, 
  Mail, Save, LogOut, CheckCircle2,
  ChevronRight, Laptop, BellRing, AlertTriangle, ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("userInfo") || "null");
      return savedUser ? {
        name: `${savedUser.nom || ""} ${savedUser.prenom || ""}`.trim(),
        email: savedUser.email || "",
        avatar: savedUser.avatar || "",
        token: savedUser.token || "",
      } : { name: "", email: "", avatar: "", token: "" };
    } catch {
      return { name: "", email: "", avatar: "", token: "" };
    }
  });

  const [file, setFile] = useState(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  
  // CORRECTION : language est maintenant utilisé dans le JSX plus bas
  const [language, setLanguage] = useState("fr"); 
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("userInfo")) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const updateProfile = async () => {
    if (!user.name.trim() || !user.email.trim()) {
      setMessage({ type: "error", text: "Le nom et l'email sont requis." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      const names = user.name.trim().split(" ");
      
      formData.append("nom", names[0] || "");
      formData.append("prenom", names.slice(1).join(" ") || "");
      formData.append("email", user.email);
      if (file) formData.append("avatar", file);

      const { data } = await axios.put("http://localhost:5000/api/users/profile", formData, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data" 
        },
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      
      setUser({
        ...user,
        name: `${data.nom} ${data.prenom}`,
        email: data.email,
        avatar: data.avatar,
      });

      setMessage({ type: "success", text: "Profil mis à jour !" });
      setFile(null);
      
    } catch (error) {
      console.error("Erreur:", error);
      let errorText = "Une erreur est survenue.";
      if (error.response) {
        errorText = error.response.data?.message || `Erreur ${error.response.status}`;
      }
      setMessage({ type: "error", text: errorText });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500 pb-12">
      <div className="max-w-5xl mx-auto px-4 pt-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="p-3 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white">Paramètres</h1>
          </div>

          {message.text && (
            <div className={`px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl ${
              message.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            }`}>
              {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              {message.text}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800">
              <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={<User size={18}/>} label="Profil" />
              <TabButton active={activeTab === "prefs"} onClick={() => setActiveTab("prefs")} icon={<Laptop size={18}/>} label="Préférences" />
              <button onClick={logout} className="w-full flex items-center gap-3 p-4 rounded-2xl text-rose-500 font-bold">
                <LogOut size={18} /> Déconnexion
              </button>
            </div>
          </aside>

          <main className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
              
              {activeTab === "profile" && (
                <section className="space-y-6">
                  <div className="flex flex-col items-center sm:flex-row gap-8 mb-6">
                    <div className="relative">
                      <img
                        src={file ? URL.createObjectURL(file) : user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=10b981&color=fff`}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800"
                      />
                      <label className="absolute bottom-1 right-1 bg-emerald-500 p-2.5 rounded-full cursor-pointer text-white">
                        <Upload size={16} /><input type="file" hidden onChange={handleFileChange} />
                      </label>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black dark:text-white">{user.name}</h2>
                      <p className="text-slate-400 font-medium">{user.email}</p>
                    </div>
                  </div>
                  <InputField label="Nom" value={user.name} onChange={(val) => setUser({...user, name: val})} icon={<User size={18}/>} />
                  <InputField label="Email" value={user.email} onChange={(val) => setUser({...user, email: val})} icon={<Mail size={18}/>} />
                  <button onClick={updateProfile} disabled={loading} className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-4 rounded-2xl font-black">
                    {loading ? "Chargement..." : "Sauvegarder"}
                  </button>
                </section>
              )}

              {activeTab === "prefs" && (
                <section className="space-y-6">
                  <ToggleItem icon={<Moon size={20}/>} label="Mode Sombre" checked={darkMode} onChange={setDarkMode} />
                  
                  {/* UTILISATION DE LANGUAGE ICI POUR ÉVITER L'ERREUR */}
                  <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex gap-4 items-center">
                      <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm"><Globe size={20} className="text-blue-500"/></div>
                      <div><p className="font-bold dark:text-white">Langue</p></div>
                    </div>
                    <select 
                      className="bg-white dark:bg-slate-700 border-none rounded-xl p-2 font-bold dark:text-white outline-none" 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <ToggleItem icon={<BellRing size={20}/>} label="Notifications" checked={notifications} onChange={setNotifications} />
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Composants internes
function TabButton({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-2xl font-black transition-all ${active ? "bg-emerald-500 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
      <div className="flex items-center gap-4">{icon} <span>{label}</span></div>
      <ChevronRight size={16} className={active ? "opacity-100" : "opacity-0"} />
    </button>
  );
}

function InputField({ label, value, onChange, icon }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        <input value={value} onChange={(e) => onChange?.(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none dark:text-white font-bold" />
      </div>
    </div>
  );
}

function ToggleItem({ icon, label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50">
      <div className="flex gap-4 items-center">
        <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm">{icon}</div>
        <p className="font-bold dark:text-white">{label}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={() => onChange(!checked)} />
        <div className="w-12 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
      </label>
    </div>
  );
}