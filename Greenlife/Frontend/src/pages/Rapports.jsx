import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Download,
  Mail,
  X,
  Loader2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  // Récupération du token depuis le localStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const token = userInfo?.token || "";

  // ================= 1. CHARGEMENT DES RAPPORTS =================
  useEffect(() => {
    const fetchReports = async () => {
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

        // Debug: décommentez la ligne suivante pour voir la structure de vos données dans la console
        // console.log("Données reçues:", res.data);

        setReports(Array.isArray(res.data?.reports) ? res.data.reports : []);
      } catch (err) {
        console.error("Erreur Fetch:", err);
        setError(err.response?.data?.message || "Impossible de charger les rapports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token]);

  // ================= 2. TÉLÉCHARGEMENT DU PDF =================
  const downloadPDF = async (id) => {
    if (!id) {
      alert("Erreur : ID du rapport introuvable.");
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
      a.download = `rapport-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur Téléchargement:", err);
      alert("Le fichier PDF n'a pas pu être généré.");
    }
  };

  // ================= 3. ENVOI PAR EMAIL =================
  const handleOpenEmail = (id) => {
    if (!id) return alert("ID invalide");
    setSelectedReportId(id);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setEmail("");
    setSelectedReportId(null);
  };

  const sendEmail = async () => {
    if (!email.trim()) return alert("Veuillez entrer une adresse email.");
    if (!selectedReportId) return alert("Aucun rapport sélectionné.");

    try {
      setSending(true);
      await axios.post(
        "http://localhost:5000/api/reports/send-email",
        { email, reportId: selectedReportId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Rapport envoyé avec succès ! ✅");
      handleCloseModal();
    } catch (err) {
      console.error("Erreur Email:", err);
      alert(err.response?.data?.message || "Erreur lors de l'envoi de l'email.");
    } finally {
      setSending(false);
    }
  };

  // ================= RENDU UI =================

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-slate-500 font-medium">Analyse de vos données en cours...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 relative overflow-x-hidden">
      
      {/* Ornements visuels en arrière-plan */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] left-[-5%] w-[300px] h-[300px] bg-blue-100/30 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-12">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-8 bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest">Espace Client</span>
            </div>
            <h1 className="text-4xl font-black text-slate-800">
              Mes <span className="text-emerald-600">Rapports</span>
            </h1>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-white shadow-sm p-4 rounded-3xl flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Disponibles</p>
              <p className="text-lg font-black text-slate-700">{reports.length}</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 text-center font-medium">
            {error}
          </div>
        )}

        {/* Grille de Rapports */}
        {reports.length === 0 && !error ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
            <FileText className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-medium">Vous n'avez pas encore de rapport généré.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((r) => {
              // Sécurité pour l'ID (certaines API utilisent id, d'autres _id)
              const reportId = r._id || r.id;

              return (
                <div
                  key={reportId}
                  className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                      <FileText className="text-slate-400 group-hover:text-emerald-500" size={24} />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Score Éco</span>
                      <p className="text-xl font-black text-emerald-500">{r.score || 0}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-2 truncate">
                    {r.title || "Rapport sans titre"}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-8">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>Analyse certifiée GreenLife</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => downloadPDF(reportId)}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all active:scale-95"
                    >
                      <Download size={16} />
                      PDF
                    </button>
                    <button
                      onClick={() => handleOpenEmail(reportId)}
                      className="w-12 flex items-center justify-center bg-slate-50 text-slate-600 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95"
                    >
                      <Mail size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal d'envoi Email */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={handleCloseModal} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors">
              <X size={24} />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Partager le rapport</h2>
              <p className="text-slate-400 text-sm mt-1">Saisissez l'adresse de destination.</p>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@mail.com"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none p-4 rounded-2xl font-medium transition-all"
              />
              <button
                disabled={sending}
                onClick={sendEmail}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? <Loader2 className="animate-spin" size={20} /> : <>Envoyer maintenant <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}