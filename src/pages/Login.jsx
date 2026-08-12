import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { login } from "@/api";
import background from '@/assets/contact.webp';
import axios from "axios";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        await fetch('http://localhost:8000/sanctum/csrf-cookie', {
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error getting CSRF token:', error);
      }
    };
    getCsrfToken();
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await login(data);
      
      if (response.token) {
        localStorage.setItem("token", response.token);
        if (response.user.role === 'doctor') {
          try {
            const doctorResponse = await axios.get(`http://localhost:8000/api/doctors/search?email=${response.user.email}`);
            if (doctorResponse.data && doctorResponse.data.length > 0) {
              const doctor = doctorResponse.data[0];
              localStorage.setItem("user", JSON.stringify({
                ...response.user,
                doctor_id: doctor.id
              }));
            }
          } catch (error) {
            console.error("Error fetching doctor details:", error);
          }
        } else {
          localStorage.setItem("user", JSON.stringify(response.user));
        }
        
        console.log("User data stored:", JSON.parse(localStorage.getItem("user")));
        
        switch(response.user.role){
          case 'user':
            window.location.href = "/services/profile"
            return
          case 'admin':
            window.location.href = "/admin"
            return
          case 'doctor':
            window.location.href = "/doctor"
            return
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Email or password incorrect !");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center bg-cover bg-top justify-center bg-[#96C1B9]" style={{ backgroundImage: `url(${background})` }}>
      <Card className="w-full max-w-md shadow-lg border-[#96C1B9]">
        <CardHeader>
          <CardTitle className="text-center text-3xl text-[#155B5F]">Welcome Back</CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-[#155B5F]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className="mt-1"
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-[#155B5F]">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className="mt-1"
                disabled={isLoading}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="cursor-pointer w-full bg-[#155B5F] hover:bg-[#0F4A4D] text-white"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-sm text-gray-600 text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#155B5F] hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
