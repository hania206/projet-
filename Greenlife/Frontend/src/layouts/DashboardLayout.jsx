import DashboardNavbar from "../components/DashboardNavbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <main className="px-12 py-10">
        <Outlet />
      </main>
    </div>
  );
}