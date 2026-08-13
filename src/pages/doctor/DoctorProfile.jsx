import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Label } from "@/components/ui/label";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { useForm } from "react-hook-form";
  import { z } from "zod";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { toast } from "sonner";
  import { useEffect, useState } from "react";
  import api from "@/api";
  
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
  
  export default function DoctorProfile() {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [error, setError] = useState(null);
  
    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm({
      resolver: zodResolver(schema),
    });
  
    useEffect(() => {
      const fetchDoctorProfile = async () => {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          if (!user || !user.doctor_id) {
            throw new Error("Doctor information not found");
          }
  
          const response = await api.get(`/api/doctors/${user.doctor_id}`);
  
          setDoctor(response.data);
        } catch (err) {
          console.error("Error fetching doctor profile:", err);
          setError(err.response?.data?.message || "Failed to load profile");
          toast.error("Failed to load profile");
        } finally {
          setLoading(false);
        }
      };
  
      fetchDoctorProfile();
    }, []);
  
    const onSubmit = async (data) => {
      if (!window.confirm("Are you sure you want to change your password?")) {
        return;
      }

      setUpdatingPassword(true);
      try {
        const response = await api.put(
          "/api/user/password",
          {
            current_password: data.currentPassword,
            password: data.newPassword,
            password_confirmation: data.confirmPassword,
          },
        );
  
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
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#155B5F] text-white rounded hover:bg-[#0F4A4D]"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
  
    if (!doctor) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <p className="text-gray-600 text-lg">No profile data available</p>
          </div>
        </div>
      );
    }
  
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-bold text-[#155B5F]">My Profile</h1>
  
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#155B5F]">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label>Name</Label>
              <Input value={doctor.name} readOnly className="bg-[#F7FAFA]" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={doctor.email} readOnly className="bg-[#F7FAFA]" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={doctor.phone} readOnly className="bg-[#F7FAFA]" />
            </div>
            <div>
              <Label>Specialty</Label>
              <Input value={doctor.speciality} readOnly className="bg-[#F7FAFA]" />
            </div>
          </CardContent>
        </Card>
  
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#155B5F]">Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
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
                <Label htmlFor="newPassword">New Password</Label>
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
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
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
                className="bg-[#155B5F] text-white hover:bg-[#0F4A4D]"
                disabled={updatingPassword}
              >
                {updatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    );
  }
  
