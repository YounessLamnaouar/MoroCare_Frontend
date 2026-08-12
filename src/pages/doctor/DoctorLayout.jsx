import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function DoctorLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-[#F7FAFA] p-6">
        <Outlet />
      </div>
    </div>
  );
}
