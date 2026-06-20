import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, ShieldAlert } from 'lucide-react';

const BasketballIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M6.2 6.2c2.4 2.4 2.4 9.2 0 11.6" />
    <path d="M17.8 6.2c-2.4 2.4 -2.4 9.2 0 11.6" />
    <path d="M2 12h20" />
    <path d="M12 2v20" />
  </svg>
);

export const Signup: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'player' | 'admin'>('player');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, phone, role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-dark-bg to-dark-bg">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md">
        <div className="court-panel p-8 rounded-xl bg-dark-card border-2">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded bg-primary flex items-center justify-center mb-3 shadow-[0_0_10px_rgba(255,85,0,0.4)]">
              <BasketballIcon className="w-7 h-7 text-white" />
            </div>
            <h2 className="font-display text-3xl font-black italic text-white uppercase tracking-tight">
              JOIN THE LEAGUE
            </h2>
            <p className="text-gray-500 text-xs font-bold uppercase mt-1">Register your Ignite Hoops player tag</p>
          </div>

          {error && (
            <div className="p-3.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-semibold text-xs text-gray-400">
            <div>
              <label className="block uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="Virat Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded text-sm font-semibold"
                />
              </div>
            </div>

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
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="tel"
                  required
                  placeholder="+91 9999888877"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider mb-2">
                Platform Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('player')}
                  className={`py-2 px-3 rounded border transition-all text-xs font-black uppercase ${
                    role === 'player'
                      ? 'border-primary bg-primary/10 text-primary text-glow-orange bg-black'
                      : 'border-white/5 bg-black/45 text-gray-500'
                  }`}
                >
                  🏀 PLAYER
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-3 rounded border transition-all text-xs font-black uppercase ${
                    role === 'admin'
                      ? 'border-secondary bg-secondary/15 text-white shadow-[0_0_10px_rgba(0,102,255,0.15)] bg-black'
                      : 'border-white/5 bg-black/45 text-gray-500'
                  }`}
                >
                  🛡️ ADMIN
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded btn-athletic-orange mt-4"
            >
              {loading ? 'ENLISTING...' : 'ENLIST ROSTER'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-500 border-t border-white/5 pt-6 font-semibold">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
