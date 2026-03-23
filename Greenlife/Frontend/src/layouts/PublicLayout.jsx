import PublicNavbar from "../components/PublicNavbar";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <>
      <PublicNavbar />
      <Outlet />
    </>
  );
}