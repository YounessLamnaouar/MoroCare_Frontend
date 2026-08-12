import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Video, User } from "lucide-react";
import { getUser } from "@/api";
import { getAppointments } from "@/api/appointment";
import { getTeleconsultations } from "@/api/teleconsultation";
import { useEffect, useState } from "react";

export default function DoctorDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [teleconsultations, setTeleconsultations] = useState([]);
    const [todayAppointments, setTodayAppointments] = useState(0);
    const [checkedInPatients, setCheckedInPatients] = useState(0);
    const [upcomingTeleconsultations, setUpcomingTeleconsultations] = useState(0);
    const [startingSoonTeleconsultations, setStartingSoonTeleconsultations] = useState(0);
    const [weeklyPatients, setWeeklyPatients] = useState(0);

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const currentDoctor = JSON.parse(localStorage.getItem('user') || '{}');
          if (!currentDoctor.doctor_id) {
            throw new Error('Doctor information not found');
          }

          const [userData, appointmentsData, teleconsultationsData] = await Promise.all([
            getUser(),
            getAppointments(),
            getTeleconsultations()
          ]);

          setUser(userData);

          const doctorAppointments = appointmentsData.data.filter(
            app => Number(app.doctor_id) === Number(currentDoctor.doctor_id)
          );
          setAppointments(doctorAppointments);

          const doctorTeleconsultations = teleconsultationsData.data.filter(
            tc => Number(tc.doctor_id) === Number(currentDoctor.doctor_id)
          );
          setTeleconsultations(doctorTeleconsultations);

          const today = new Date().toLocaleDateString();
          const todayApps = doctorAppointments.filter(app => 
            new Date(app.date).toLocaleDateString() === today
          );
          setTodayAppointments(todayApps.length);
          setCheckedInPatients(todayApps.filter(app => app.status === 'Checked In').length);

          const upcomingTcs = doctorTeleconsultations.filter(tc => 
            new Date(tc.date) >= new Date() && tc.status === 'Confirmed'
          );
          setUpcomingTeleconsultations(upcomingTcs.length);

          const now = new Date();
          const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
          const startingSoon = upcomingTcs.filter(tc => {
            const tcDateTime = new Date(`${tc.date}T${tc.time}`);
            return tcDateTime >= now && tcDateTime <= oneHourFromNow;
          });
          setStartingSoonTeleconsultations(startingSoon.length);

          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const weeklyPatients = new Set(
            doctorAppointments
              .filter(app => new Date(app.date) >= oneWeekAgo)
              .map(app => app.patient_id)
          );
          setWeeklyPatients(weeklyPatients.size);

        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Failed to load dashboard data. Please try again.");
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
      <h1 className="text-3xl font-bold text-[#155B5F]">Welcome back, {user.name}</h1>
      <p className="text-gray-600 text-sm">Here's an overview of your schedule.</p>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-md border-l-4 border-[#155B5F]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Appointments</CardTitle>
            <CalendarDays className="text-[#155B5F]" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#155B5F]">{todayAppointments}</p>
            <p className="text-sm text-muted-foreground">{checkedInPatients} patients checked in</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-[#155B5F]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Teleconsultations</CardTitle>
            <Video className="text-[#155B5F]" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#155B5F]">{upcomingTeleconsultations}</p>
            <p className="text-sm text-muted-foreground">{startingSoonTeleconsultations} starting soon</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-[#155B5F]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Patients</CardTitle>
            <User className="text-[#155B5F]" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#155B5F]">{weeklyPatients}</p>
            <p className="text-sm text-muted-foreground">seen this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card className="mt-8 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#155B5F]">Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointments
            .filter(app => new Date(app.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 2)
            .map((app) => (
              <div key={app.id} className="flex justify-between items-center p-3 rounded-md border hover:bg-gray-50">
                <div>
                  <p className="font-semibold">{app.patient?.name || 'Unknown Patient'}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(app.date).toLocaleDateString()} at {app.time}
                  </p>
                </div>
                <span className={`text-sm font-medium ${
                  app.status === "Confirmed" ? "text-green-600" : 
                  app.status === "Checked In" ? "text-blue-600" :
                  "text-yellow-600"
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
        </CardContent>
      </Card>
    </section>
  );
}
