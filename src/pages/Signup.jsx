import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { register } from "@/api";
import { DatePicker } from "@/components/ui/date-picker";
import background from '@/assets/contact.webp';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  password_confirmation: z.string(),
  birthday: z.date().optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

export default function Signup() {
  // const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [birthday, setBirthday] = useState(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError("");
      const formData = {
        ...data,
        birthday: birthday ? birthday.toISOString().split('T')[0] : undefined,
      };
      const response = await register(formData);
      
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        window.location.href = "/services/profile"
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center bg-cover bg-top justify-center bg-[#96C1B9]" style={{ backgroundImage: `url(${background})` }}>
      <Card className="w-full max-w-md shadow-lg border-[#96C1B9]">
        <CardHeader>
          <CardTitle className="text-center text-3xl text-[#155B5F]">Create Account</CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div>
              <Label htmlFor="name" className="text-[#155B5F]">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                {...registerField("name")}
                className="mt-1"
                disabled={isLoading}
                autoComplete="name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-[#155B5F]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...registerField("email")}
                className="mt-1"
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-[#155B5F]">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                {...registerField("phone")}
                className="mt-1"
                disabled={isLoading}
                autoComplete="tel"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="birthday" className="text-[#155B5F]">Date of Birth</Label>
              <DatePicker
                date={birthday}
                setDate={(date) => {
                  setBirthday(date);
                  setValue("birthday", date);
                }}
                className="mt-1"
              />
              {errors.birthday && (
                <p className="text-red-500 text-xs mt-1">{errors.birthday.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-[#155B5F]">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...registerField("password")}
                className="mt-1"
                disabled={isLoading}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password_confirmation" className="text-[#155B5F]">Confirm Password</Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="Confirm your password"
                {...registerField("password_confirmation")}
                className="mt-1"
                disabled={isLoading}
                autoComplete="new-password"
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="cursor-pointer w-full bg-[#155B5F] hover:bg-[#0F4A4D] text-white"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-sm text-gray-600 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-[#155B5F] hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

