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
import axios from "axios";
import { toast } from "sonner";
import { getTeleconsultations, updateTeleconsultationStatus } from "@/api/teleconsultation";

export default function TeleconsultationsAdmin() {
    const [teleconsultations, setTeleconsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const teleconsultationsPerPage = 5;

    const fetchTeleconsultations = async () => {
        try {
            const response = await getTeleconsultations();
            setTeleconsultations(response.data);
        } catch (error) {
            console.error('Error fetching teleconsultations:', error);
            toast.error('Failed to fetch teleconsultations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeleconsultations();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "Confirmed":
                return "bg-green-200 text-green-800";
            case "Pending":
                return "bg-yellow-200 text-yellow-800";
            case "Canceled":
                return "bg-red-200 text-red-800";
            case "Completed":
                return "bg-blue-200 text-blue-800";
            default:
                return "bg-gray-200 text-gray-800";
        }
    };

    const updateStatus = async (id, newStatus) => {
        setUpdating(true);
        try {
            await updateTeleconsultationStatus(id, newStatus);
            
            setTeleconsultations((prev) =>
                prev.map((tc) =>
                    tc.id === id ? { ...tc, status: newStatus } : tc
                )
            );
            
            toast.success(`Teleconsultation ${newStatus.toLowerCase()} successfully`);
        } catch (error) {
            console.error('Error updating teleconsultation:', error);
            toast.error('Failed to update teleconsultation status');
        } finally {
            setUpdating(false);
        }
    };

    // Pagination
    const indexOfLastTeleconsultation = currentPage * teleconsultationsPerPage;
    const indexOfFirstTeleconsultation = indexOfLastTeleconsultation - teleconsultationsPerPage;
    const currentTeleconsultations = teleconsultations.slice(indexOfFirstTeleconsultation, indexOfLastTeleconsultation);
    const totalPages = Math.ceil(teleconsultations.length / teleconsultationsPerPage);

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
            <h1 className="text-3xl font-bold text-[#155B5F] mb-6">📹 Teleconsultations</h1>

            <Card className="border-[#96C1B9] shadow-sm">
                <CardHeader>
                    <CardTitle>All Teleconsultation Requests</CardTitle>
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
                            {currentTeleconsultations.map((tc) => (
                                <TableRow key={tc.id}>
                                    <TableCell>{tc.id}</TableCell>
                                    <TableCell>{tc.patient?.name || 'N/A'}</TableCell>
                                    <TableCell>{tc.doctor?.name || 'N/A'}</TableCell>
                                    <TableCell>{new Date(tc.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{tc.time ? (() => {
                                        const [hours, minutes] = tc.time.split(':');
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
                                                tc.status
                                            )}`}
                                        >
                                            {tc.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="flex justify-end gap-2">
                                        {tc.status === "Pending" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => updateStatus(tc.id, "Confirmed")}
                                                    disabled={updating}
                                                >
                                                    <CheckCircle2 size={16} className="mr-1" />
                                                    Confirm
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => updateStatus(tc.id, "Canceled")}
                                                    disabled={updating}
                                                >
                                                    <XCircle size={16} className="mr-1" />
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {tc.status === "Confirmed" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    onClick={() => updateStatus(tc.id, "Completed")}
                                                    disabled={updating}
                                                >
                                                    <CheckCircle2 size={16} className="mr-1" />
                                                    Complete
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => updateStatus(tc.id, "Canceled")}
                                                    disabled={updating}
                                                >
                                                    <XCircle size={16} className="mr-1" />
                                                    Cancel
                                                </Button>
                                            </>
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
  