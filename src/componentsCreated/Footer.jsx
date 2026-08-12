import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#155B5F] text-white pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">

        <div>
          <h2 className="text-2xl font-bold mb-4">MoroCare</h2>
          <p className="text-gray-300 text-sm">
            Transforming healthcare access across Morocco through technology.
            Book appointments, consult online, and manage your health, all in one place.
          </p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-[#96C1B9]"><Facebook size={22} /></a>
            <a href="#" className="hover:text-[#96C1B9]"><Twitter size={22} /></a>
            <a href="#" className="hover:text-[#96C1B9]"><Instagram size={22} /></a>
            <a href="#" className="hover:text-[#96C1B9]"><Linkedin size={22} /></a>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[#96C1B9]">Navigation</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/about" className="hover:underline">About Us</Link></li>
            <li><Link to="/services" className="hover:underline">Services</Link></li>
            <li><Link to="/services/directory" className="hover:underline">Directory</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[#96C1B9]">Our Services</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/services/appointment" className="hover:underline">Appointment Booking</Link></li>
            <li><Link to="/services/teleconsultation" className="hover:underline">Teleconsultation</Link></li>
            <li><Link to="/services/directory" className="hover:underline">Professional Directory</Link></li>
            <li><Link to="/history" className="hover:underline">Health Records</Link></li>
            <li><Link to="/services/profile" className="hover:underline">Patient Profile</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[#96C1B9]">Contact Info</h3>
          <ul className="space-y-4 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <Mail size={18} /> support@morocare.ma
            </li>
            <li className="flex items-center gap-2">
              <Phone size={18} /> +212 6 12 34 56 78
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={18} /> Rabat, Morocco
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-[#96C1B9] mt-10 pt-6 text-center text-sm text-gray-300">
        © {new Date().getFullYear()} MoroCare. All rights reserved.
      </div>
    </footer>
  );
}
