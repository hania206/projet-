import React from "react";
import DashboardCard from "../components/DashboardCard";

export default function ClientDashboard() {
  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-10">
        Client Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-8">

        <DashboardCard
          title="Mes Commandes"
          value="5"
          color="bg-green-600"
        />

        <DashboardCard
          title="Produits Favoris"
          value="12"
          color="bg-yellow-500"
        />

        <DashboardCard
          title="Points Green"
          value="250"
          color="bg-blue-600"
        />

      </div>

    </div>
  );
}