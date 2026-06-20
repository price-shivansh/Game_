import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { TeamManagement } from './pages/TeamManagement';
import { TournamentList } from './pages/TournamentList';
import { TournamentDetail } from './pages/TournamentDetail';
import { Leaderboards } from './pages/Leaderboards';
import { AdminPanel } from './pages/AdminPanel';

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine if sidebar should be shown in dashboard views
  const showSidebarPaths = ['/dashboard', '/teams', '/admin'];
  const shouldShowSidebar = showSidebarPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg text-gray-200">
      {/* Global Navigation Header */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Screen Layout Container */}
      <div className="flex flex-1 relative">
        {shouldShowSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        {/* Main Content Pane */}
        <main className="flex-1 flex flex-col min-w-0">
          {children}
          
          {/* Footer banner */}
          <footer className="mt-auto py-8 text-center text-xs text-gray-600 border-t border-white/5 bg-black/10">
            <div>© 2026 ArenaHub Sports Network. All rights reserved.</div>
            <div className="mt-1 text-gray-700">Powered by React, TypeScript, and Tailwind CSS.</div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/teams" element={<TeamManagement />} />
            <Route path="/tournaments" element={<TournamentList />} />
            <Route path="/tournament/:id" element={<TournamentDetail />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </LayoutWrapper>
      </Router>
    </AuthProvider>
  );
}
