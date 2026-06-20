import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogIn, LogOut, User, Shield } from 'lucide-react';

const BasketballIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M6.2 6.2c2.4 2.4 2.4 9.2 0 11.6" />
    <path d="M17.8 6.2c-2.4 2.4 -2.4 9.2 0 11.6" />
    <path d="M2 12h20" />
    <path d="M12 2v20" />
  </svg>
);

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-dark-bg/95 backdrop-blur-md border-b-2 border-primary/20 px-6 py-4 flex items-center justify-between">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(255,85,0,0.4)] group-hover:scale-105 transition-transform duration-300">
          <BasketballIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="leading-none">
            <span className="font-display text-2xl font-black italic tracking-tighter text-glow-orange text-primary">
              IGNITE
            </span>
            <span className="font-display text-2xl font-black italic tracking-tighter text-white">
              HOOPS
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold -mt-0.5">Street League</span>
        </div>
      </Link>

      {/* Desktop Menu links */}
      <div className="hidden md:flex items-center gap-8">
        {[
          { name: 'Home', path: '/' },
          { name: 'Tournaments', path: '/tournaments' },
          { name: 'Standings', path: '/leaderboards' },
        ].map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`font-display text-lg font-bold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 ${
              isActive(link.path) 
                ? 'text-primary text-glow-orange border-b-2 border-primary pb-1' 
                : 'text-gray-400 hover:text-white pb-1'
            }`}
          >
            {link.name}
          </Link>
        ))}

        {user && (
          <>
            <Link
              to="/dashboard"
              className={`font-display text-lg font-bold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 ${
                isActive('/dashboard') 
                  ? 'text-primary text-glow-orange border-b-2 border-primary pb-1' 
                  : 'text-gray-400 hover:text-white pb-1'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/teams"
              className={`font-display text-lg font-bold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 ${
                isActive('/teams') 
                  ? 'text-primary text-glow-orange border-b-2 border-primary pb-1' 
                  : 'text-gray-400 hover:text-white pb-1'
              }`}
            >
              Squads
            </Link>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-secondary text-white font-display text-sm font-extrabold uppercase hover:bg-blue-700 transition-colors shadow-[0_0_10px_rgba(0,102,255,0.3)]"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}
          </>
        )}
      </div>

      {/* Action / Auth Buttons */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src={user.profile_picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                alt={user.name}
                className="w-8 h-8 rounded-full border-2 border-primary/50 object-cover"
              />
              <span className="text-sm font-bold text-gray-300">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-rose-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 font-display text-lg font-bold uppercase text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link to="/signup" className="px-5 py-2.5 rounded btn-athletic-orange text-base">
              Join League
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Toggle Buttons */}
      <div className="flex items-center gap-4 md:hidden">
        {user && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Toggle Sidebar"
          >
            <User className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="absolute top-[73px] left-0 w-full bg-dark-bg/95 border-b border-primary/20 py-4 px-6 flex flex-col gap-4 md:hidden">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-300 hover:text-white py-2 font-display text-lg font-bold uppercase"
          >
            Home
          </Link>
          <Link
            to="/tournaments"
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-300 hover:text-white py-2 font-display text-lg font-bold uppercase"
          >
            Tournaments
          </Link>
          <Link
            to="/leaderboards"
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-300 hover:text-white py-2 font-display text-lg font-bold uppercase"
          >
            Standings
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white py-2 font-display text-lg font-bold uppercase"
              >
                Dashboard
              </Link>
              <Link
                to="/teams"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white py-2 font-display text-lg font-bold uppercase"
              >
                Squads
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-secondary hover:text-white font-display text-lg font-bold uppercase"
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              <div className="h-px bg-white/5 my-2"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-primary/45 object-cover"
                  />
                  <span className="text-sm font-bold text-gray-300">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm font-bold text-rose-500 uppercase"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded border border-white/10 text-gray-300 font-display text-lg font-bold uppercase"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded btn-athletic-orange font-display text-lg font-bold uppercase"
              >
                Join League
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
