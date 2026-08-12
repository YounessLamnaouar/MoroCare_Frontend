import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDoctors,
} from "@/api/doctor";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import defaultProfileImage from "@/assets/default-profile.svg";

export default function Directory() {
  const [allDoctors, setAllDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 6;

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDoctors();
      console.log("Directory - All doctors data:", response.data);
      setAllDoctors(response.data);
      setFilteredDoctors(response.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to load doctors:", err);
      setError("Failed to load doctors. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    try {
      setLoading(true);
      setError(null);
      
      const query = searchQuery.toLowerCase().trim();
      const filtered = allDoctors.filter(doctor => 
        doctor.name?.toLowerCase().includes(query) ||
        doctor.speciality?.toLowerCase().includes(query) ||
        doctor.location?.toLowerCase().includes(query)
      );
      
      setFilteredDoctors(filtered);
      setCurrentPage(1);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDoctors(allDoctors);
      setCurrentPage(1);
    }
  }, [searchQuery, allDoctors]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilteredDoctors(allDoctors);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Pagination
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (loading && allDoctors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#155B5F]"></div>
      </div>
    );
  }

  if (error && allDoctors.length === 0) {
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
    <section className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#155B5F]">Professional Directory</h1>
        <p className="text-gray-600 mt-2">Find nearby doctors, clinics, and specialists.</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              id="search"
              placeholder="Search by name, specialty, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 border-[#96C1B9] focus:ring-2 focus:ring-[#155B5F]"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-[#155B5F] text-white hover:bg-[#0F4A4D] px-6"
          >
            Search
          </Button>
          {searchQuery && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-[#155B5F] text-[#155B5F] hover:bg-[#155B5F] hover:text-white"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {loading && allDoctors.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#155B5F]"></div>
        </div>
      )}

      {!loading && filteredDoctors.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">No doctors found matching your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDoctors.map((doctor) => (
              <Card key={doctor.id} className="shadow-md border-[#96C1B9] hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="p-4">
                  <div className="h-32 w-full overflow-hidden rounded-md bg-gray-50 flex items-center justify-center">
                    <img
                      src={doctor.image || defaultProfileImage}
                      alt={doctor.name}
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  <CardTitle className="text-[#155B5F] text-lg mb-2">{doctor.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{doctor.speciality}</p>
                  <Button
                    onClick={() => {
                      console.log("Directory - Doctor object:", doctor);
                      if (doctor.id) {
                        navigate(`/services/appointment?doctor=${encodeURIComponent(doctor.id)}`);
                      } else {
                        console.error("Doctor ID is missing for doctor:", doctor);
                      }
                    }}
                    className="w-full bg-[#155B5F] text-white hover:bg-[#0F4A4D] transition-colors duration-200 mt-4"
                  >
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

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
        </>
      )}
    </section>
  );
}
