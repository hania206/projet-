import React from "react";
import DashboardCard from "../components/DashboardCard";

export default function FournisseurDashboard() {
  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-10">
        Fournisseur Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-8">

        <DashboardCard
          title="Mes Produits"
          value="20"
          color="bg-green-600"
        />

        <DashboardCard
          title="Commandes Reçues"
          value="15"
          color="bg-blue-600"
        />

        <DashboardCard
          title="Revenus"
          value="3200 DT"
          color="bg-purple-600"
        />

      </div>

    </div>
  );
}