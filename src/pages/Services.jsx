import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Link } from "react-router-dom";

// Images for each service (put correct paths)
import appointmentImage from "../assets/services/appointement.png";
import teleconsultationImage from "../assets/services/teleconsulation.png";
import directoryImage from "../assets/services/directory.png";
import medicationImage from "../assets/services//medication.png";
import historyImage from "../assets/services/healthHistory.png";
import profileImage from "../assets/services/patienProfile.png";
import aiAssist from "../assets/services/AiAssistant.png";
import { Button } from "../components/ui/button";

export default function Services() {
  const services = [
    {
      title: "Appointment Booking",
      description: "Easily schedule appointments with doctors, clinics, or hospitals.",
      link: "/services/appointment",
      image: appointmentImage,
    },
    {
      title: "Teleconsultation",
      description: "Consult healthcare professionals securely via video or chat.",
      link: "/services/teleconsultation",
      image: teleconsultationImage,
    },
    {
      title: "MoroCare AI Assistant",
      description: "Use artificial intelligence to recognize your disease.",
      link: "/services/morocareAssistant",
      image: aiAssist,
    },
    {
      title: "Professional Directory",
      description: "Find healthcare providers near you easily and quickly.",
      link: "/services/directory",
      image: directoryImage,
    },
    {
      title: "Patient Profile",
      description: "Manage your health profile, allergies, and preferences securely.",
      link: "/services/profile",
      image: profileImage,
    },
    {
      title: "Medication Orders",
      description: "Order your medications online and receive them at your doorstep. (Coming Soon)",
      link: "/services",
      image: medicationImage,
    },
    {
      title: "Health History & Records",
      description: "Access your consultation history and medical records anytime. (Coming Soon)",
      link: "/services",
      image: historyImage,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 bg-[#96C1B9] py-10">
      <h1 className="text-4xl font-bold text-center mb-10 text-[#155B5F]">
        Our Healthcare Services
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <Link to={service.link} key={index}>
            <Card className="hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer h-full">
              <CardContent className="p-0">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-40 object-cover rounded-t-md"
                />
                <div className="p-4">
                  <CardTitle className="text-lg text-teal-800">{service.title}</CardTitle>
                  <CardDescription className="mt-2">{service.description}</CardDescription>
                  <div className="mt-4 text-sm text-blue-600 font-semibold">
                    <Button className="cursor-pointer bg-teal-800 hover:bg-teal-950">Explore →</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
