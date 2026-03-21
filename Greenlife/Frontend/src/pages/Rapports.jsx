import React, { useState, useEffect } from "react";
import { FileText, Download, Plus, User, FileSpreadsheet } from "lucide-react";
import axios from "axios";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [exportOptions, setExportOptions] = useState({
    energie: true,
    eau: true,
    dechets: true,
  });

  // ✅ API CALL
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/reports");
        setReports(res.data);
      } catch (err) {
        console.log(err);

        // fallback
        setReports([
          { id: 1, title: "Rapport Février", date: "15 fév 2024", size: "2.4 MB", type: "pdf" },
          { id: 2, title: "Rapport Janvier", date: "15 jan 2024", size: "2.1 MB", type: "pdf" },
          { id: 3, title: "Export 2023", date: "31 déc 2023", size: "1.8 MB", type: "csv" },
        ]);
      } finally {
        setLoading(false); // ✅ مهم
      }
    };

    fetchReports();
  }, []);

  // ✅ toggle checkbox
  const handleExportToggle = (option) => {
    setExportOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  // ✅ download file
  const handleDownload = (report) => {
    alert(`Téléchargement: ${report.title}`);
    // هنا تنجم تربطها بالbackend:
    // window.open(`http://localhost:5000/api/download/${report.id}`);
  };

  // ✅ generate report
  const handleGenerate = async () => {
    try {
      alert("Génération du rapport...");
      // await axios.post("http://localhost:5000/api/generate-report");
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ export CSV
  const handleExport = async () => {
    try {
      alert("Export CSV...");
      // await axios.post("http://localhost:5000/api/export", exportOptions);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAV */}
      <nav className="bg-white px-12 py-4 flex justify-between border-b">
        <h1 className="text-2xl font-bold text-emerald-600">GreenLife</h1>

        <div className="flex gap-8 text-gray-500">
          <a>Dashboard</a>
          <a>Relevés</a>
          <a className="text-emerald-600 border-b-2 border-emerald-600">
            Rapports
          </a>
        </div>

        <button className="bg-emerald-600 text-white px-5 py-2 rounded-full flex gap-2">
          <User size={18} /> Mon compte
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-8">

        {/* HEADER */}
        <div className="flex justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold">Rapports</h2>
            <p className="text-gray-500">Téléchargez vos données</p>
          </div>

          <button
            onClick={handleGenerate}
            className="bg-emerald-600 text-white px-5 py-3 rounded-xl flex gap-2"
          >
            <Plus size={18} /> Générer
          </button>
        </div>

        {/* LIST */}
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          {loading ? (
            <p className="text-center">Chargement...</p>
          ) : (
            reports.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-center p-4 border rounded-xl mb-3"
              >
                <div className="flex gap-4 items-center">
                  <div className="p-2 bg-gray-100 rounded">
                    {r.type === "pdf" ? <FileText /> : <FileSpreadsheet />}
                  </div>

                  <div>
                    <h4 className="font-bold">{r.title}</h4>
                    <p className="text-xs text-gray-400">
                      {r.date} • {r.size}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(r)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex gap-2"
                >
                  <Download size={16} /> Télécharger
                </button>
              </div>
            ))
          )}
        </div>

        {/* EXPORT */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* PDF */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4">Rapport mensuel</h3>

            <button
              onClick={handleGenerate}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg"
            >
              Générer PDF
            </button>
          </div>

          {/* CSV */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4">Export CSV</h3>

            <div className="space-y-2 mb-4">
              <Checkbox label="Énergie" checked={exportOptions.energie} onChange={() => handleExportToggle("energie")} />
              <Checkbox label="Eau" checked={exportOptions.eau} onChange={() => handleExportToggle("eau")} />
              <Checkbox label="Déchets" checked={exportOptions.dechets} onChange={() => handleExportToggle("dechets")} />
            </div>

            <button
              onClick={handleExport}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg"
            >
              Export CSV
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

// ✅ Checkbox FIXED
const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span>{label}</span>
  </label>
);