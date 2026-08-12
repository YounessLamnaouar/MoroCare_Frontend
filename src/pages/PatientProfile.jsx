import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, getTeleconsultations } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PatientProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teleconsultations, setTeleconsultations] = useState([]);
  const [loadingTeleconsultations, setLoadingTeleconsultations] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setLoading(false);
          return;
        }

        const userData = await getUser();
        setUser(userData);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchTeleconsultations = async () => {
      try {
        setLoadingTeleconsultations(true);
        const data = await getTeleconsultations();
        setTeleconsultations(data);
      } catch (err) {
        console.error("Error fetching teleconsultations:", err);
      } finally {
        setLoadingTeleconsultations(false);
      }
    };

    fetchUserData();
    fetchTeleconsultations();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Canceled':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#155B5F] mx-auto" />
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-[#155B5F] hover:bg-[#0F4A4D] text-white"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">No user data found.</p>
              <Button
                onClick={() => navigate("/login")}
                className="bg-[#155B5F] hover:bg-[#0F4A4D] text-white"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl text-[#155B5F]">Patient Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-gray-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{user.phone}</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => navigate("/services/appointments")}
                className="bg-[#155B5F] hover:bg-[#0F4A4D] text-white mr-4"
              >
                View Appointments
              </Button>
              <Button
                onClick={() => navigate("/services/teleconsultations")}
                className="bg-[#155B5F] hover:bg-[#0F4A4D] text-white"
              >
                Schedule Teleconsultation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-[#155B5F]">Teleconsultations</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTeleconsultations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#155B5F]" />
            </div>
          ) : teleconsultations.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No teleconsultations found.</p>
          ) : (
            <div className="space-y-4">
              {teleconsultations.map((tc) => (
                <div
                  key={tc.id}
                  className="flex justify-between items-center p-4 rounded-lg border hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold">Dr. {tc.doctor?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(tc.date).toLocaleDateString()} at{' '}
                      {new Date(`2000-01-01T${tc.time}`).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                    <Badge className={getStatusColor(tc.status)}>
                      {tc.status}
                    </Badge>
                  </div>
                  {tc.status === 'Confirmed' && (
                    <Button
                      onClick={() => navigate(`/services/teleconsultation/room?room=morocare-session-${tc.id}`)}
                      className="bg-[#155B5F] hover:bg-[#0F4A4D] text-white"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Call
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 