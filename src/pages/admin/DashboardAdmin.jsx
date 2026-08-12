import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Users, Calendar, Video, ShoppingCart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";;
import { useEffect, useState } from "react";
import { getUser } from "../../api";
import { getDoctors } from "../../api/doctor";
import { getAppointments } from "../../api/appointment";
import { getTeleconsultations } from "../../api/teleconsultation";

export default function DashboardAdmin() {
  const [chartData, setChartData] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [teleconsultationsCount, setTeleconsultationsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [userData, doctorsData, appointmentsData, teleconsultationsData] = await Promise.all([
          getUser(),
          getDoctors(),
          getAppointments(),
          getTeleconsultations()
        ]);
        setUser(userData);
        setDoctorsCount(doctorsData.data.length);
        setAppointmentsCount(appointmentsData.data.length);
        setTeleconsultationsCount(teleconsultationsData.data.length);

        const appointments = appointmentsData.data;
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyData = daysOfWeek.map(day => ({
          name: day,
          appointments: appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate.toLocaleDateString('en-US', { weekday: 'short' }) === day;
          }).length
        }));
        setChartData(weeklyData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#155B5F]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#155B5F] text-white rounded hover:bg-[#0F4A4D]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No user data found.</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="px-4 py-2 bg-[#155B5F] text-white rounded hover:bg-[#0F4A4D]"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-[#155B5F] mb-6">👋 Welcome back, Admin {user.name}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-[#96C1B9] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Doctors</CardTitle>
            <Users className="text-[#155B5F]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#155B5F]">{doctorsCount}</p>
          </CardContent>
        </Card>

        <Card className="border-[#96C1B9] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Appointments</CardTitle>
            <Calendar className="text-[#155B5F]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#155B5F]">{appointmentsCount}</p>
          </CardContent>
        </Card>

        <Card className="border-[#96C1B9] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Teleconsultations</CardTitle>
            <Video className="text-[#155B5F]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#155B5F]">{teleconsultationsCount}</p>
          </CardContent>
        </Card>

        <Card className="border-[#96C1B9] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Orders</CardTitle>
            <ShoppingCart className="text-[#155B5F]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#155B5F]">0</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-[#96C1B9] shadow-sm">
        <CardHeader>
          <CardTitle>Weekly Appointment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="appointments" stroke="#155B5F" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
    </section>
  );
}
