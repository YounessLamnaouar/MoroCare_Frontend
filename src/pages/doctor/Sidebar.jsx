import { Link, useLocation } from "react-router-dom";
import { Calendar, Video, LayoutDashboard, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/api";

const navItems = [
  { label: "Dashboard", icon: <LayoutDashboard />, path: "/doctor" },
  { label: "Appointments", icon: <Calendar />, path: "/doctor/appointments" },
  { label: "Teleconsultations", icon: <Video />, path: "/doctor/teleconsultations" },
  { label: "Profile", icon: <User />, path: "/doctor/profile" },
];

export default function Sidebar() {
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="w-64 bg-[#155B5F] text-white flex flex-col p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6">👨‍⚕️ Doctor Panel</h2>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-[#0F4A4D] ${
            location.pathname === item.path ? "bg-[#0F4A4D]" : ""
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
       <Button onClick={handleLogout} className="cursor-pointer bg-red-600 hover:bg-red-500 text-white">
        <LogOut size={18} /> Logout
      </Button>
    </aside>
  );
}
