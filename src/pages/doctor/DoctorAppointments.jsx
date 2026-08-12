import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getAppointments } from "@/api/appointment";
import { toast } from "sonner";
import axios from "axios";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await getAppointments();
      console.log('All appointments from API:', response.data);
      
      const currentDoctor = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Current doctor from localStorage:', currentDoctor);
      
      if (!currentDoctor.doctor_id) {
        console.error('No doctor ID found in localStorage');
        toast.error('Doctor information not found. Please log in again.');
        return;
      }
      
      const doctorAppointments = response.data.filter(
        app => {
          const appointmentDoctorId = Number(app.doctor_id);
          const currentDoctorId = Number(currentDoctor.doctor_id);
          
          console.log('Comparing appointment doctor_id:', appointmentDoctorId, 'with current doctor id:', currentDoctorId);
          console.log('Appointment details:', app);
          
          return appointmentDoctorId === currentDoctorId;
        }
      );
      console.log('Filtered appointments for current doctor:', doctorAppointments);
      
      setAppointments(doctorAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id, newStatus) => {
    try {
      setIsUpdating(true);
      await axios.patch(`http://localhost:8000/api/appointments/${id}/status`, {
        status: newStatus
      });
      
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
      
      toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#155B5F]"></div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-[#155B5F]">Appointments</h1>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#155B5F]">Manage Your Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg shadow-lg">
              <p className="text-gray-600 text-lg">No appointments found</p>
            </div>
          ) : (
            appointments.map((app) => (
              <div
                key={app.id}
                className="flex justify-between items-center p-4 rounded border hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold">{app.patient?.name || 'Unknown Patient'}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(app.date).toLocaleDateString()} at {app.time}
                  </p>
                  {app.notes && (
                    <p className="text-sm text-gray-500 mt-1">{app.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={
                      app.status === "Confirmed"
                        ? "text-green-600 border-green-600"
                        : app.status === "Pending"
                        ? "text-yellow-600 border-yellow-600"
                        : "text-red-600 border-red-600"
                    }
                  >
                    {app.status}
                  </Badge>

                  {app.status === "Pending" && (
                    <>
                      <Button
                        variant="outline"
                        className="text-green-700 border-green-600 hover:bg-green-50"
                        onClick={() => handleAction(app.id, "Confirmed")}
                        disabled={isUpdating}
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Confirm
                      </Button>

                      <Button
                        variant="outline"
                        className="text-red-700 border-red-600 hover:bg-red-50"
                        onClick={() => handleAction(app.id, "Canceled")}
                        disabled={isUpdating}
                      >
                        <XCircle size={16} className="mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
