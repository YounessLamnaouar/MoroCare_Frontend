import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getTeleconsultations, updateTeleconsultationStatus } from "@/api/teleconsultation";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function DoctorTeleconsultations() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTeleconsultations();
  }, []);

  const fetchTeleconsultations = async () => {
    try {
      setIsLoading(true);
      const response = await getTeleconsultations();
      console.log('All teleconsultations from API:', response.data);
      
      const currentDoctor = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Current doctor from localStorage:', currentDoctor);
      
      if (!currentDoctor.doctor_id) {
        console.error('No doctor ID found in localStorage');
        toast.error('Doctor information not found. Please log in again.');
        return;
      }
      
      const doctorSessions = response.data.filter(
        session => {
          const sessionDoctorId = Number(session.doctor_id);
          const currentDoctorId = Number(currentDoctor.doctor_id);
          
          console.log('Comparing session doctor_id:', sessionDoctorId, 'with current doctor id:', currentDoctorId);
          console.log('Session details:', session);
          
          return sessionDoctorId === currentDoctorId;
        }
      );
      console.log('Filtered teleconsultations for current doctor:', doctorSessions);
      
      setSessions(doctorSessions);
    } catch (error) {
      console.error('Error fetching teleconsultations:', error);
      toast.error('Failed to load teleconsultations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setIsUpdating(true);
      await updateTeleconsultationStatus(id, newStatus);
      
      setSessions((prev) =>
        prev.map((session) =>
          session.id === id ? { ...session, status: newStatus } : session
        )
      );
      
      toast.success(`Teleconsultation ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating teleconsultation:', error);
      toast.error('Failed to update teleconsultation status. Please try again.');
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
      <h1 className="text-2xl font-bold text-[#155B5F]">Teleconsultations</h1>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#155B5F]">Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg shadow-lg">
              <p className="text-gray-600 text-lg">No teleconsultations found</p>
            </div>
          ) : (
            sessions.map((session) => {
              const roomId = `morocare-session-${session.id}`;
              return (
                <div
                  key={session.id}
                  className="flex justify-between items-center p-4 rounded border hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold">{session.patient?.name || 'Unknown Patient'}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(session.date).toLocaleDateString()} at {session.time}
                    </p>
                    {session.notes && (
                      <p className="text-sm text-gray-500 mt-1">{session.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge
                      variant="outline"
                      className={
                        session.status === "Confirmed"
                          ? "text-green-600 border-green-600"
                          : session.status === "Pending"
                          ? "text-yellow-600 border-yellow-600"
                          : session.status === "Completed"
                          ? "text-blue-600 border-blue-600"
                          : "text-red-600 border-red-600"
                      }
                    >
                      {session.status}
                    </Badge>

                    {session.status === "Pending" && (
                      <>
                        <Button
                          variant="outline"
                          className="text-green-700 border-green-600 hover:bg-green-50"
                          onClick={() => handleStatusUpdate(session.id, "Confirmed")}
                          disabled={isUpdating}
                        >
                          Confirm
                        </Button>

                        <Button
                          variant="outline"
                          className="text-red-700 border-red-600 hover:bg-red-50"
                          onClick={() => handleStatusUpdate(session.id, "Canceled")}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {session.status === "Confirmed" && (
                        <Link to={`/services/teleconsultation/room?room=${roomId}`} rel="noopener noreferrer" >
                        <Button className="bg-[#155B5F] hover:bg-[#0F4A4D] text-white">
                          <Video className="mr-2" size={16} />
                          Join Call
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </section>
  );
}
