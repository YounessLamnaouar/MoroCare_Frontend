import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, User, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '@/api'
import logo from '@/assets/logo-MoroCare-removebg-preview.png'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

export default function Navbar({ userAuth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="MoroCare Logo" className="h-14 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link to="/" className={`text-teal-800 p-2 hover:text-teal-800 ${location.pathname === '/' ? 'border-b-2 border-teal-800' : 'border-b-2 border-transparent'}`}>Home</Link>
          <Link to="/services" className={`text-teal-800 p-2 hover:text-teal-800 ${location.pathname === '/services' ? 'border-b-2 border-teal-800' : 'border-b-2 border-transparent'}`}>Services</Link>
          <Link to="/services/directory" className={`text-teal-800 p-2 hover:text-teal-800 ${location.pathname === '/services/directory' ? 'border-b-2 border-teal-800' : 'border-b-2 border-transparent'}`}>Directory</Link>
          <Link to="/about" className={`text-teal-800 p-2 hover:text-teal-800 ${location.pathname === '/about' ? 'border-b-2 border-teal-800' : 'border-b-2 border-transparent'}`}>About Us</Link>
          <Link to="/contact" className={`text-teal-800 p-2 hover:text-teal-800 ${location.pathname === '/contact'? 'border-b-2 border-teal-800' : 'border-b-2 border-transparent'}`}>Contact</Link>

          {userAuth ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-teal-800 flex items-center gap-2">
                  <User size={18} />
                  My Account ▼
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link className='text-teal-800' to="/services/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link className='text-teal-800' to="/services/appointment">Appointments</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className='text-teal-800 cursor-pointer'>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login" className={`text-teal-800 p-2 hover:text-teal-800 ${location.pathname === '/login' ? 'border-b-2 border-teal-800' : 'border-b-2 border-transparent'}`}>Login</Link>
              <Link to="/register" className={`text-teal-800 p-2 hover:text-teal-800 ${location.pathname === '/register' ? 'border-b-2 border-teal-800' : 'border-b-2 border-transparent'}`}>Sign Up</Link>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-teal-800 flex items-center gap-1">
                <Globe size={16} />
                Language ▼
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='text-teal-800' align="end">
              <DropdownMenuItem>🇬🇧 English</DropdownMenuItem>
              <DropdownMenuItem>🇫🇷 French(soon)</DropdownMenuItem>
              <DropdownMenuItem>🇲🇦 Arabic(soon)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-3 shadow-lg">
          <Link to="/" className="block text-teal-800 hover:text-teal-950" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/services" className="block text-teal-800 hover:text-teal-950" onClick={() => setMobileMenuOpen(false)}>Services</Link>
          <Link to="/services/directory" className="block text-teal-800 hover:text-teal-950" onClick={() => setMobileMenuOpen(false)}>Directory</Link>
          <Link to="/about" className="block text-teal-800 hover:text-teal-950" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
          <Link to="/contact" className="block text-teal-800 hover:text-teal-950" onClick={() => setMobileMenuOpen(false)}>Contact</Link>

          {!userAuth ? (
            <>
              <Link to="/login" className="block text-teal-800 hover:text-teal-950" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="block text-teal-800 hover:text-teal-950" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/services/profile" className="block text-teal-800 hover:text-teal-950" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              <Link to="/services/directory" className="block text-teal-800 hover:text-teal-950" onClick={() => setMobileMenuOpen(false)}>Appointments</Link>
              <button onClick={handleLogout} className="block w-full text-left text-teal-800 hover:text-teal-950">Logout</button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
