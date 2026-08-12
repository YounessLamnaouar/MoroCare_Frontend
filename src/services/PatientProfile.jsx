import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import defaultProfileImage from "@/assets/default-profile.svg";
import { getUser, updatePassword, deleteAccount, getUserTeleconsultations } from "@/api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";
import { Video } from "lucide-react";
import { Link } from "react-router-dom";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function PatientProfile() {
  const [activeTab, setActiveTab] = useState("personal");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [birthdate, setBirthdate] = useState(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [teleconsultations, setTeleconsultations] = useState([]);
  const [loadingTeleconsultations, setLoadingTeleconsultations] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await getUser();
        setUser(userData);
        if (userData.birthdate) {
          setBirthdate(new Date(userData.birthdate));
        }
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
        const data = await getUserTeleconsultations();
        setTeleconsultations(data);
      } catch (err) {
        console.error("Error fetching teleconsultations:", err);
        toast.error("Failed to load teleconsultations");
      } finally {
        setLoadingTeleconsultations(false);
      }
    };

    fetchUserData();
    fetchTeleconsultations();
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

  const roomId = `morocare-user-${user.id}`;

  const onSubmit = async (data) => {
    if (!window.confirm("Are you sure you want to change your password?")) {
      return;
    }

    setUpdatingPassword(true);
    try {
      await updatePassword({
        current_password: data.currentPassword,
        password: data.newPassword,
        password_confirmation: data.confirmPassword,
      });
      toast.success("Password updated successfully");
      reset();
    } catch (err) {
      console.error("Error updating password:", err);
      const errorMessage = err.response?.data?.message || "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    setDeletingAccount(true);
    try {
      await deleteAccount();
      toast.success("Account deleted successfully");
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (err) {
      console.error("Error deleting account:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete account";
      toast.error(errorMessage);
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <Toaster position="top-center" expand={true} richColors />
      <Card className="mb-10 shadow-lg border-[#96C1B9]">
        <CardHeader className="flex flex-col items-center space-y-4">
          <img
            src={user.image || defaultProfileImage}
            alt="User profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-[#96C1B9]"
          />
          <CardTitle className="text-[#155B5F]">Welcome, {user.name}</CardTitle>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-[#96C1B9] text-white mb-8">
          <TabsTrigger value="personal" className="hover:bg-[#155B5F]">Personal Info</TabsTrigger>
          <TabsTrigger value="medical" className="hover:bg-[#155B5F]">Medical Info</TabsTrigger>
          <TabsTrigger value="settings" className="hover:bg-[#155B5F]">Account Settings</TabsTrigger>
          <TabsTrigger value="teleconsultation" className="hover:bg-[#155B5F]">Teleconsultation</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="shadow-md">
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="name" className="text-[#155B5F]">Full Name</Label>
                <Input id="name" value={user.name} readOnly className="mt-1 bg-[#F7FAFA]" />
              </div>

              <div>
                <Label htmlFor="email" className="text-[#155B5F]">Email</Label>
                <Input id="email" value={user.email} readOnly className="mt-1 bg-[#F7FAFA]" />
              </div>

              <div>
                <Label htmlFor="phone" className="text-[#155B5F]">Phone</Label>
                <Input id="phone" value={user.phone || "Not provided"} readOnly className="mt-1 bg-[#F7FAFA]" />
              </div>

              <div>
                <Label htmlFor="birthdate" className="text-[#155B5F]">Date of Birth</Label>
                <Input id="date" value={user.birthday || "Not provided"} readOnly className="mt-1 bg-[#F7FAFA]" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card className="shadow-md">
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="blood" className="text-[#155B5F]">Blood Type</Label>
                <Input id="blood" value={user.blood_type || "Not provided"} readOnly className="mt-1 bg-[#F7FAFA]" />
              </div>

              <div>
                <Label htmlFor="allergies" className="text-[#155B5F]">Allergies</Label>
                <Input id="allergies" value={user.allergies || "None"} readOnly className="mt-1 bg-[#F7FAFA]" />
              </div>

              <div>
                <Label htmlFor="chronic" className="text-[#155B5F]">Chronic Conditions</Label>
                <Input id="chronic" value={user.chronic_conditions || "None"} readOnly className="mt-1 bg-[#F7FAFA]" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="shadow-md">
            <CardContent className="p-6 space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-[#155B5F]">Current Password</Label>
                  <Input 
                    id="currentPassword"
                    type="password" 
                    {...register("currentPassword")} 
                    disabled={updatingPassword}
                    className={errors.currentPassword ? "border-red-500" : ""}
                  />
                  {errors.currentPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-[#155B5F]">New Password</Label>
                  <Input 
                    id="newPassword"
                    type="password" 
                    {...register("newPassword")} 
                    disabled={updatingPassword}
                    className={errors.newPassword ? "border-red-500" : ""}
                  />
                  {errors.newPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-[#155B5F]">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword"
                    type="password" 
                    {...register("confirmPassword")} 
                    disabled={updatingPassword}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="bg-[#155B5F] hover:bg-[#0F4A4D] w-full text-white cursor-pointer"
                  disabled={updatingPassword}
                >
                  {updatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>

              <Button 
                variant="destructive" 
                className="w-full cursor-pointer"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? "Deleting..." : "Delete Account"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teleconsultation */}
        <TabsContent value="teleconsultation">
          <Card className="shadow-md">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-bold text-[#155B5F]">Upcoming Teleconsultations</h2>
              {loadingTeleconsultations ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#155B5F]"></div>
                </div>
              ) : teleconsultations.length > 0 ? (
                <div className="space-y-4">
                  {teleconsultations.map((teleconsultation) => (
                    <div key={teleconsultation.id} className="border rounded-lg p-4">
                      <p><strong>Date:</strong> {new Date(teleconsultation.date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {teleconsultation.time}</p>
                      <p><strong>Doctor:</strong> {teleconsultation.doctor?.name || "N/A"}</p>
                      <p><strong>Status:</strong> {teleconsultation.status}</p>
                      {teleconsultation.status === "Confirmed" && (
                          <Link to={`/services/teleconsultation/room?room=morocare-user-${user.id}`} rel="noopener noreferrer" >
                          <Button className="bg-[#155B5F] hover:bg-[#0F4A4D] text-white mt-4">
                            <Video className="mr-2" size={16} />
                            Join Call
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No upcoming teleconsultations</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
