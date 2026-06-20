import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Users, Calendar, Trophy, Bell, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const menuItems = [
    { name: 'My Profile', path: '/dashboard', icon: User },
    { name: 'My Teams', path: '/teams', icon: Users },
    { name: 'Tournaments', path: '/tournaments', icon: Trophy },
  ];

  if (!user) return null;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 glass-panel border-r border-white/5 pt-24 px-4 transition-transform duration-300 md:static md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col items-center mb-8">
        <img
          src={user.profile_picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
          alt={user.name}
          className="w-20 h-20 rounded-full border-2 border-primary/50 object-cover mb-3 shadow-lg"
        />
        <h3 className="font-semibold text-white text-base text-center">{user.name}</h3>
        <span className="text-xs text-primary font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-primary/10 border border-primary/20 mt-1">
          {user.role === 'admin' ? 'Administrator' : 'Player'}
        </span>
      </div>

      <nav className="flex flex-col gap-2">
        <span className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Navigation
        </span>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 border border-primary/30 text-primary shadow-[0_0_15px_rgba(0,242,254,0.1)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          );
        })}

        {user.role === 'admin' && (
          <>
            <span className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
              Management
            </span>
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-secondary/15 border border-secondary/30 text-white shadow-[0_0_15px_rgba(157,78,221,0.15)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              Admin Portal
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};
