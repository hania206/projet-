import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FileText, Download, Mail, X, Loader2,
  Calendar, Zap, Droplets, Trash2,
  AlertCircle, RefreshCw, Sparkles, TrendingUp,
  CheckCircle, Send, FileBarChart
} from "lucide-react";

export default function Rapports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [openEmail, setOpenEmail] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getToken = useCallback(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      return userInfo?.token || "";
    } catch (err) {
      console.error("getToken error:", err.message);
      return "";
    }
  }, []);

  const token = getToken();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!token) {
        setError("Vous devez être connecté pour voir vos rapports.");
        setLoading(false);
        return;
      }

      const res = await axios.get("http://localhost:5000/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(res.data?.reports || []);
    } catch (err) {
      console.error("fetchReports error:", err.message);
      
      if (err.response?.status === 401) {
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
      } else if (err.response?.status === 403) {
        setError("Accès refusé.");
      } else if (err.request) {
        setError("Serveur injoignable. Vérifiez votre connexion.");
      } else {
        setError(err.response?.data?.message || "Erreur de chargement.");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const downloadPDF = async (id) => {
    if (!id) {
      alert("ID du rapport invalide.");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/reports/download/pdf/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-greenlife-${id.slice(-6)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccess("✅ Rapport téléchargé !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("downloadPDF error:", err.message);
      
      if (err.response?.status === 404) {
        alert("Rapport introuvable.");
      } else if (err.response?.status === 401) {
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
      } else if (err.request) {
        alert("Serveur injoignable.");
      } else {
        alert("Erreur lors du téléchargement.");
      }
    }
  };

  const handleOpenEmail = (id) => {
    if (!id) {
      alert("ID du rapport invalide.");
      return;
    }
    setSelectedReportId(id);
    setOpenEmail(true);
    setEmail("");
  };

  const sendEmail = async () => {
    if (!email.trim()) {
      alert("Veuillez entrer une adresse email.");
      return;
    }
    
    if (!selectedReportId) {
      alert("Aucun rapport sélectionné.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert("Format d'email invalide.");
      return;
    }

    try {
      setSending(true);
      
      await axios.post(
        "http://localhost:5000/api/reports/send-email",
        { email: email.trim(), reportId: selectedReportId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess("✅ Email envoyé !");
      setOpenEmail(false);
      setEmail("");
      setSelectedReportId(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("sendEmail error:", err.message);
      
      if (err.response?.status === 401) {
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
      } else if (err.response?.status === 404) {
        alert("Rapport introuvable.");
        setOpenEmail(false);
      } else if (err.request) {
        alert("Serveur injoignable.");
      } else {
        alert(err.response?.data?.message || "Erreur lors de l'envoi.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleOpenDelete = (id) => {
    if (!id) {
      alert("ID du rapport invalide.");
      return;
    }
    setDeleteId(id);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) {
      setOpenDelete(false);
      return;
    }

    try {
      setDeleting(true);
      
      await axios.delete(`http://localhost:5000/api/reports/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setReports(prev => prev.filter(r => r._id !== deleteId));
      setSuccess("🗑️ Rapport supprimé !");
      setOpenDelete(false);
      setDeleteId(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("confirmDelete error:", err.message);
      
      if (err.response?.status === 404) {
        alert("Rapport déjà supprimé.");
        setReports(prev => prev.filter(r => r._id !== deleteId));
        setOpenDelete(false);
      } else if (err.response?.status === 401) {
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
      } else if (err.request) {
        alert("Serveur injoignable.");
      } else {
        alert(err.response?.data?.message || "Erreur lors de la suppression.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const getIcon = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("energie")) return <Zap size={22} className="text-amber-500" />;
    if (t.includes("eau")) return <Droplets size={22} className="text-blue-500" />;
    return <Trash2 size={22} className="text-red-500" />;
  };

  const getColor = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("energie")) return "from-amber-50 to-amber-100 border-amber-200";
    if (t.includes("eau")) return "from-blue-50 to-blue-100 border-blue-200";
    return "from-red-50 to-red-100 border-red-200";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FileBarChart className="text-emerald-400 mx-auto mb-4 animate-bounce" size={56} />
          <Loader2 className="animate-spin text-emerald-500 mx-auto mb-3" size={36} />
          <p className="text-gray-500 font-bold text-lg">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      
      {/* HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              <FileText size={16} />
              <span>Espace Rapports</span>
            </div>
            <h1 className="text-4xl font-black mb-2">Mes Rapports</h1>
            <p className="text-emerald-100 text-lg">Consultez, téléchargez et partagez vos analyses</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
              <p className="text-4xl font-black">{reports.length}</p>
              <p className="text-xs text-emerald-100 font-medium">Rapports</p>
            </div>
            <button onClick={fetchReports} className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl hover:bg-white/30 transition-all">
              <RefreshCw size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 font-medium">
          <CheckCircle size={20} />
          {success}
          <button onClick={() => setSuccess("")} className="ml-auto text-emerald-400 hover:text-emerald-600"><X size={18} /></button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle size={20} />
            <span className="font-medium text-sm">{error}</span>
          </div>
          <button onClick={fetchReports} className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium">
            <RefreshCw size={14} /> Réessayer
          </button>
        </div>
      )}

      {/* Liste */}
      {reports.length === 0 && !error ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="text-gray-400" size={40} />
          </div>
          <p className="text-gray-500 text-xl font-bold mb-2">Aucun rapport</p>
          <p className="text-gray-400">Ajoutez des relevés pour générer vos premiers rapports</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <div
              key={report._id}
              className={`group relative bg-gradient-to-br ${getColor(report.type)} rounded-2xl p-6 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
            >
              {index === 0 && (
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Sparkles size={12} /> Nouveau
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">{getIcon(report.type)}</div>
                <button
                  onClick={() => handleOpenDelete(report._id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 className="font-bold text-gray-800 mb-3 truncate">{report.title}</h3>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Calendar size={14} />
                <span>{new Date(report.date).toLocaleDateString('fr-FR')}</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-800">{report.valeur}</span>
                  <span className="text-sm text-gray-400">{report.unite}</span>
                </div>
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm">
                  <TrendingUp size={14} className="text-emerald-500" />
                  <span className="text-sm font-bold text-emerald-600">{report.score || 0}</span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-white rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${report.score || 50}%` }} />
              </div>

              <div className="flex gap-2">
                <button onClick={() => downloadPDF(report._id)} className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                  <Download size={16} /> PDF
                </button>
                <button onClick={() => handleOpenEmail(report._id)} className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                  <Send size={16} /> Email
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Email */}
      {openEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpenEmail(false)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <button onClick={() => setOpenEmail(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={22} /></button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Send className="text-white" size={28} />
              </div>
              <h2 className="text-xl font-black text-gray-800">Envoyer par email</h2>
              <p className="text-gray-400 text-sm mt-1">Le rapport sera envoyé en PDF</p>
            </div>
            <div className="space-y-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.com"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-colors" autoFocus />
              <button onClick={sendEmail} disabled={sending}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2">
                {sending ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Envoyer le rapport</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {openDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpenDelete(false)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={32} />
            </div>
            <h2 className="text-xl font-black text-gray-800 mb-2">Supprimer le rapport ?</h2>
            <p className="text-gray-500 text-sm mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setOpenDelete(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">Annuler</button>
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center">
                {deleting ? <Loader2 className="animate-spin" size={20} /> : <><Trash2 size={18} className="mr-1" /> Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}