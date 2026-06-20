import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert } from 'lucide-react';

const BasketballIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M6.2 6.2c2.4 2.4 2.4 9.2 0 11.6" />
    <path d="M17.8 6.2c-2.4 2.4 -2.4 9.2 0 11.6" />
    <path d="M2 12h20" />
    <path d="M12 2v20" />
  </svg>
);

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-dark-bg to-dark-bg">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md">
        <div className="court-panel p-8 rounded-xl bg-dark-card border-2 relative">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded bg-primary flex items-center justify-center mb-3 shadow-[0_0_10px_rgba(255,85,0,0.4)]">
              <BasketballIcon className="w-7 h-7 text-white" />
            </div>
            <h2 className="font-display text-3xl font-black italic text-white uppercase tracking-tight">
              IGNITE THE COURT
            </h2>
            <p className="text-gray-500 text-xs font-bold uppercase mt-1">Sign in to manage squad brackets</p>
          </div>

          {error && (
            <div className="p-3.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Preset logins helper */}
          <div className="p-3.5 rounded bg-black/60 border border-white/5 mb-6 text-xs text-gray-500 font-semibold">
            <span className="text-primary font-bold uppercase">Quick Access Accounts:</span>
            <div className="flex flex-col gap-1.5 mt-2">
              <div>👨‍💼 Admin: <code className="text-white">admin@ignitehoops.com</code></div>
              <div>🏀 Player: <code className="text-white">virat@example.com</code></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 font-semibold text-xs text-gray-400">
            <div>
              <label className="block uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded text-sm font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded bg-black/40 border-white/10" />
                <span>Remember me</span>
              </label>
              <a href="#" className="hover:text-primary transition-colors">Forgot Password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded btn-athletic-orange mt-4"
            >
              {loading ? 'ENTERING COURT...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-500 border-t border-white/5 pt-6 font-semibold">
            New player?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Join League
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
