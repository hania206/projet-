import React from "react";
import DashboardCard from "../components/DashboardCard";

export default function AdminDashboard() {
  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-10">
        Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-8">

        <DashboardCard
          title="Total Utilisateurs"
          value="120"
          color="bg-green-600"
        />

        <DashboardCard
          title="Produits"
          value="45"
          color="bg-blue-600"
        />

        <DashboardCard
          title="Commandes"
          value="78"
          color="bg-purple-600"
        />

      </div>

    </div>
  );
}