import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from "@/api/doctor";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const doctorSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters.").optional(),
  speciality: z.string().min(1, "Please select a speciality."),
  phone: z.string().min(10, "Phone number must be at least 10 digits.").optional(),
  address: z.string().min(5, "Address must be at least 5 characters.").optional(),
});

const SPECIALITIES = [
  "Cardiology",
  "Neurology",
  "Dermatology",
  "Pediatrics",
  "General"
];

const truncateText = (text, maxLength = 20) => {
  if (!text) return "-";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export default function DoctorsAdmin() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 5;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(doctorSchema),
    mode: "onChange",
  });

  const selectedSpeciality = watch("speciality");

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDoctors();
      setDoctors(response.data);
    } catch (err) {
      console.error("Failed to load doctors:", err);
      setError("Failed to load doctors. Please try again later.");
      toast.error("Failed to load doctors. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const onEdit = useCallback((doctor) => {
    console.log('Editing doctor:', doctor);
    setEditingDoctor(doctor);
    setValue("name", doctor.name);
    setValue("email", doctor.email);
    setValue("speciality", doctor.speciality);
    setValue("phone", doctor.phone || "");
    setValue("address", doctor.address || "");
    setIsEditDialogOpen(true);
  }, [setValue]);

  const handleUpdate = async (data) => {
    console.log('Update form submitted:', data);
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const updateData = { ...data };
      if (!updateData.password) {
        delete updateData.password;
      }

      console.log('Updating doctor:', { id: editingDoctor.id, data: updateData });
      const response = await updateDoctor(editingDoctor.id, updateData);
      console.log('Update response:', response);

      setDoctors((prev) =>
        prev.map((doc) => (doc.id === editingDoctor.id ? response.data.doctor : doc))
      );
      toast.success(response.data.message || "Doctor updated successfully!");
      setIsEditDialogOpen(false);
      reset();
      setEditingDoctor(null);
    } catch (err) {
      console.error("Failed to update doctor:", err);
      const errorMessage = err.response?.data?.message || "Failed to update doctor. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (data) => {
    console.log('Create form submitted:', data);
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      console.log('Creating doctor:', data);
      const response = await createDoctor(data);
      console.log('Create response:', response);

      setDoctors((prev) => [...prev, response.data]);
      toast.success("Doctor added successfully!");
      setIsAddDialogOpen(false);
      reset();
    } catch (err) {
      console.error("Failed to create doctor:", err);
      const errorMessage = err.response?.data?.message || "Failed to create doctor. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = useCallback(async (id) => {
    if (isDeleting) return; 

    if (window.confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) {
      try {
        setIsDeleting(true);
        await deleteDoctor(id);
        setDoctors((prev) => prev.filter((doc) => doc.id !== id));
        toast.success("Doctor deleted successfully!");
      } catch (err) {
        console.error("Failed to delete doctor:", err);
        const errorMessage = err.response?.data?.message || "Failed to delete doctor. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsDeleting(false);
      }
    }
  }, [isDeleting]);

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(doctors.length / doctorsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (loading && doctors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#155B5F]"></div>
      </div>
    );
  }

  if (error && doctors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchDoctors}
            className="mt-4 px-4 py-2 bg-[#155B5F] text-white rounded hover:bg-[#0F4A4D]"
          >
            Retry
          </button>
        </div>
      </div>
    );     
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-[#155B5F] mb-6">🩺 Manage Doctors</h1>

      <Card className="shadow-md border-[#96C1B9]">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Doctors List</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#155B5F] text-white hover:bg-[#0F4A4D]">➕ Add Doctor</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit(handleCreate)} className="space-y-4 mt-4">
                <div>
                  <Label>Name</Label>
                  <Input {...register("name")} placeholder="Doctor's Name" />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>

                <div>
                  <Label>Email</Label>
                  <Input {...register("email")} type="email" placeholder="doctor@example.com" />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>

                {!editingDoctor && (
                  <div>
                    <Label>Password</Label>
                    <Input {...register("password")} type="password" placeholder="Enter password" />
                    {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                  </div>
                )}

                <div>
                  <Label>Speciality</Label>
                  <Select
                    value={selectedSpeciality}
                    onValueChange={(value) => {
                      setValue("speciality", value, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select speciality" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALITIES.map((speciality) => (
                        <SelectItem key={speciality} value={speciality}>
                          {speciality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.speciality && <p className="text-red-500 text-xs">{errors.speciality.message}</p>}
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input {...register("phone")} placeholder="+212..." />
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                </div>

                <div>
                  <Label>Address</Label>
                  <Input {...register("address")} placeholder="Doctor's Address" />
                  {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#155B5F] text-white hover:bg-[#0F4A4D]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    "Add Doctor"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {loading && doctors.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#155B5F]"></div>
            </div>
          )}

          {error && doctors.length > 0 && (
            <div className="text-red-500 text-center py-4">
              <p>{error}</p>
              <button
                onClick={fetchDoctors}
                className="mt-2 px-4 py-2 bg-[#155B5F] text-white rounded hover:bg-[#0F4A4D]"
              >
                Retry
              </button>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Speciality</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentDoctors.map((doctor, index) => (
                <TableRow key={doctor.id}>
                  <TableCell>{indexOfFirstDoctor + index + 1}</TableCell>
                  <TableCell>{doctor.name}</TableCell>
                  <TableCell>{doctor.email}</TableCell>
                  <TableCell>{doctor.speciality}</TableCell>
                  <TableCell>{doctor.phone || "-"}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="cursor-help">{truncateText(doctor.address)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{doctor.address || "No address provided"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(doctor)}
                      disabled={isSubmitting}
                    >
                      <Pencil size={16} />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(doctor.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        </div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                variant="outline"
                className="border-[#155B5F] text-[#155B5F] hover:bg-[#155B5F] hover:text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                variant="outline"
                className="border-[#155B5F] text-[#155B5F] hover:bg-[#155B5F] hover:text-white disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4 mt-4">
            <div>
              <Label>Name</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div>
              <Label>Email</Label>
              <Input {...register("email")} type="email" />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div>
              <Label>Password</Label>
              <Input {...register("password")} type="password" placeholder="Enter new password" />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <div>
              <Label>Speciality</Label>
              <Select
                value={selectedSpeciality}
                onValueChange={(value) => {
                  setValue("speciality", value, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select speciality" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALITIES.map((speciality) => (
                    <SelectItem key={speciality} value={speciality}>
                      {speciality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.speciality && <p className="text-red-500 text-xs">{errors.speciality.message}</p>}
            </div>

            <div>
              <Label>Phone</Label>
              <Input {...register("phone")} />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>

            <div>
              <Label>Address</Label>
              <Input {...register("address")} />
              {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#155B5F] text-white hover:bg-[#0F4A4D]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                "Update"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

