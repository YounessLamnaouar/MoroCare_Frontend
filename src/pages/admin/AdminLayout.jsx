import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Calendar,
  Video,
  ShoppingCart,
  Users,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/api";

export default function AdminLayout() {
  const location = useLocation();
  const handleLogout = async () => {
    await logout();
  };
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Doctors", icon: UserPlus, path: "/admin/doctors" },
    { name: "Appointments", icon: Calendar, path: "/admin/appointments" },
    { name: "Teleconsultations", icon: Video, path: "/admin/teleconsultations" },
    { name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    // { name: "Patients", icon: Users, path: "/admin/patients" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F0F4F5]">
      <aside className="w-64 bg-white shadow-lg flex flex-col justify-between">
        <div>
          <div className="px-6 py-6 text-center text-2xl font-bold text-[#155B5F]">
            MoroCare Admin
          </div>

          <nav className="flex flex-col gap-2 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  to={item.path}
                  key={item.name}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md transition ${
                    isActive
                      ? "bg-[#96C1B9] text-white"
                      : "text-[#155B5F] hover:bg-[#96C1B9]/30"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          <div className="px-6 py-4">
            <Button onClick={handleLogout} variant="destructive" className="w-full flex gap-2 cursor-pointer">
              <LogOut size={18} />
              Logout
            </Button>
          </div>
          </nav>
        </div>

      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
