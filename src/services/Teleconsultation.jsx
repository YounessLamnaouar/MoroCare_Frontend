import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDoctors } from "@/api/doctor";
import { createTeleconsultation, testTeleconsultationAPI } from "@/api/teleconsultation";
import { toast } from "sonner";

const teleconsultationSchema = z.object({
  speciality: z.string().min(1, { message: "Please select a speciality." }),
  doctor: z.string().min(1, { message: "Please select a doctor." }),
  date: z.date({ required_error: "Please select a date." }),
  time: z.string().min(1, { message: "Please select a time." }),
  notes: z.string().optional(),
});

export default function Teleconsultation() {
  const [searchParams] = useSearchParams();
  const prefillDoctorId = searchParams.get("doctor");
  const [calendarDate, setCalendarDate] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teleconsultationSchema),
    defaultValues: {
      doctor: prefillDoctorId || "",
    }
  });

  const selectedSpeciality = watch("speciality");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getDoctors();
        setAllDoctors(response.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast.error('Failed to fetch doctors');
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedSpeciality) {
      const filtered = allDoctors.filter(
        doctor => doctor.speciality === selectedSpeciality
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  }, [selectedSpeciality, allDoctors]);

  useEffect(() => {
    const testConnection = async () => {
      const isConnected = await testTeleconsultationAPI();
      if (!isConnected) {
        toast.error('Cannot connect to teleconsultation service. Please try again later.');
      }
    };
    testConnection();
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      const formattedDate = calendarDate ? format(calendarDate, 'yyyy-MM-dd') : null;
      
      const formattedTime = data.time ? format(new Date(`2000-01-01T${data.time}`), 'HH:mm') : null;
      
      const teleconsultationData = {
        patient_id: currentUser.id,
        doctor_id: data.doctor,
        date: formattedDate,
        time: formattedTime,
        status: 'Pending',
        notes: data.notes || null,
      };
      
      console.log('Submitting teleconsultation data:', JSON.stringify(teleconsultationData, null, 2));
      
      const response = await createTeleconsultation(teleconsultationData);
      console.log('Teleconsultation creation response:', response);
      
      toast.success('Teleconsultation booked successfully!');
      navigate('/services/success');
    } catch (error) {
      console.error('Error booking teleconsultation:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        Object.entries(validationErrors).forEach(([field, messages]) => {
          toast.error(`${field}: ${messages.join(', ')}`);
        });
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to book teleconsultation. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#F0F4F5] py-12 flex justify-center items-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-[#155B5F]">Book a Teleconsultation</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Schedule a video consultation with our doctors from the comfort of your home.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="speciality" className="text-[#155B5F]">Speciality</Label>
              <Select
                value={selectedSpeciality}
                onValueChange={(value) => {
                  setValue("speciality", value, { shouldValidate: true });
                  setValue("doctor", "");
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a speciality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Dentist">Dentist</SelectItem>
                  <SelectItem value="Dermatology">Dermatology</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="General">General Practitioner</SelectItem>
                </SelectContent>
              </Select>
              {errors.speciality && <p className="text-red-500 text-xs">{errors.speciality.message}</p>}
            </div>

            <div>
              <Label htmlFor="doctor" className="text-[#155B5F]">Doctor</Label>
              <select
                id="doctor"
                className="w-full p-2 border rounded-md mt-1"
                {...register("doctor")}
                disabled={!selectedSpeciality || isLoading}
              >
                <option value="">{selectedSpeciality ? "Select a doctor" : "Select speciality first"}</option>
                {filteredDoctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.speciality}
                  </option>
                ))}
              </select>
              {errors.doctor && <p className="text-red-500 text-xs">{errors.doctor.message}</p>}
            </div>

            <div>
              <Label htmlFor="date" className="text-[#155B5F]">Preferred Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {calendarDate ? format(calendarDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={calendarDate}
                    onSelect={(date) => {
                      setCalendarDate(date);
                      setValue("date", date);
                    }}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
            </div>

            <div>
              <Label htmlFor="time" className="text-[#155B5F]">Preferred Time</Label>
              <Input
                id="time"
                type="time"
                {...register("time")}
                className="mt-1"
              />
              {errors.time && <p className="text-red-500 text-xs">{errors.time.message}</p>}
            </div>

            <div>
              <Label htmlFor="notes" className="text-[#155B5F]">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any specific notes or concerns you'd like to discuss..."
                {...register("notes")}
                className="mt-1"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full cursor-pointer bg-[#155B5F] hover:bg-[#0F4A4D] text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Booking...' : 'Book Teleconsultation'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}