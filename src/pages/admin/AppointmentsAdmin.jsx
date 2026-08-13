import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getAppointments, updateAppointmentStatus } from "@/api/appointment";

export default function AppointmentsAdmin() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const appointmentsPerPage = 5;

    const fetchAppointments = async () => {
        try {
            const response = await getAppointments();
            console.log('Appointment time format:', response.data.map(appt => appt.time));
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error('Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "Confirmed":
                return "bg-green-200 text-green-800";
            case "Pending":
                return "bg-yellow-200 text-yellow-800";
            case "Canceled":
                return "bg-red-200 text-red-800";
            default:
                return "bg-gray-200 text-gray-800";
        }
    };

    const updateStatus = async (id, newStatus) => {
        setUpdating(true);
        try {
            await updateAppointmentStatus(id, newStatus);
            
            setAppointments((prev) =>
                prev.map((appt) =>
                    appt.id === id ? { ...appt, status: newStatus } : appt
                )
            );
            
            toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
        } catch (error) {
            console.error('Error updating appointment:', error);
            toast.error('Failed to update appointment status');
        } finally {
            setUpdating(false);
        }
    };

    // Pagination
    const indexOfLastAppointment = currentPage * appointmentsPerPage;
    const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
    const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
    const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#155B5F]"></div>
            </div>
        );
    }

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-bold text-[#155B5F] mb-6">📅 Manage Appointments</h1>

            <Card className="border-[#96C1B9] shadow-sm">
                <CardHeader>
                    <CardTitle>All Appointments</CardTitle>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Doctor</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentAppointments.map((appt) => (
                                <TableRow key={appt.id}>
                                    <TableCell>{appt.id}</TableCell>
                                    <TableCell>{appt.patient?.name || 'N/A'}</TableCell>
                                    <TableCell>{appt.doctor?.name || 'N/A'}</TableCell>
                                    <TableCell>{new Date(appt.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{appt.time ? (() => {
                                        const [hours, minutes] = appt.time.split(':');
                                        const date = new Date();
                                        date.setHours(parseInt(hours, 10));
                                        date.setMinutes(parseInt(minutes, 10));
                                        return date.toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        });
                                    })() : 'N/A'}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                appt.status
                                            )}`}
                                        >
                                            {appt.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="flex justify-end gap-2">
                                        {appt.status === "Pending" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateStatus(appt.id, "Confirmed")}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    disabled={updating}
                                                >
                                                    {updating ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                    ) : (
                                                        <CheckCircle2 size={16} className="mr-1" />
                                                    )}
                                                    Confirm
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateStatus(appt.id, "Canceled")}
                                                    variant="destructive"
                                                    disabled={updating}
                                                >
                                                    {updating ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                    ) : (
                                                        <XCircle size={16} className="mr-1" />
                                                    )}
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {appt.status === "Confirmed" && (
                                            <Button
                                                size="sm"
                                                onClick={() => updateStatus(appt.id, "Canceled")}
                                                variant="destructive"
                                                disabled={updating}
                                            >
                                                {updating ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                ) : (
                                                    <XCircle size={16} className="mr-1" />
                                                )}
                                                Cancel
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
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
        </section>
    );
}
  
