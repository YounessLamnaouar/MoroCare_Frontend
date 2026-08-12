import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Success() {
  const navigate = useNavigate();
  const [counter, setCounter] = useState(5);

  useEffect(() => {
    if (counter === 0) {
      navigate("/services/profile"); 
    }
    const timer = setTimeout(() => setCounter((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [counter, navigate]);

  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-[#F0F4F5] px-4 text-center">
      <div className="bg-white p-10 rounded-xl shadow-lg max-w-md">
        <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-[#155B5F] mb-4">Booking Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for trusting MoroCare.<br />
          You will be redirected to your dashboard in <span className="text-[#155B5F] font-semibold">{counter}</span> seconds.
        </p>

        <Button
          className="bg-[#155B5F] hover:bg-[#0F4A4D] w-full text-white"
          onClick={() => navigate("/services/profile")}
        >
          Go to My Dashboard Now
        </Button>
      </div>
    </section>
  );
}
