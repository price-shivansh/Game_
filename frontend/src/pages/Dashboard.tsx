import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Team, Tournament, Payment, api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { User, Users, Trophy, Bell, Save, Check } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [registeredTours, setRegisteredTours] = useState<{ tournament: Tournament; payment: Payment }[]>([]);
  
  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePic, setProfilePic] = useState(user?.profile_picture || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Notifications
  const [notifications] = useState([
    { id: '1', msg: 'Welcome to ArenaHub Street League! Team rosters seed selection is open.', date: 'Just now' },
    { id: '2', msg: 'Check-in receipt for team "Cyber Strikers" approved in Monsoon Cricket Cup.', date: '2 hours ago' },
    { id: '3', msg: 'Arena Blast 3v3 playoff tree bracket generated! First matches start tomorrow.', date: '1 day ago' },
  ]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const userTeams = await api.getMyTeams(user.id);
        setTeams(userTeams);

        const allPayments = await api.adminGetAllPayments();
        const userPayments = allPayments.filter((p) => p.user_id === user.id);
        const tours = await api.getTournaments();

        const matchTours = userPayments.map((pay) => {
          const tour = tours.find((t) => t.id === pay.tournament_id);
          return tour ? { tournament: tour, payment: pay } : null;
        }).filter(item => item !== null) as { tournament: Tournament; payment: Payment }[];

        setRegisteredTours(matchTours);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      await updateProfile({ name, phone, profile_picture: profilePic });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus('idle');
    }
  };

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center p-8 text-gray-500 font-bold uppercase">
        Please log in to view your dashboard.
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Profile Card & Notifications */}
      <div className="space-y-6">
        <div className="court-panel p-6 rounded-xl bg-dark-card border-2">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-display text-2xl font-black italic text-white uppercase tracking-wider">
              Profile details
            </h3>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 font-semibold text-xs text-gray-400">
            <div className="flex justify-center mb-4 relative">
              <img
                src={profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                alt={name}
                className="w-24 h-24 rounded-full border-4 border-primary object-cover shadow-lg"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider font-black text-gray-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider font-black text-gray-500 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider font-black text-gray-500 mb-1">
                Avatar URL
              </label>
              <input
                type="text"
                value={profilePic}
                onChange={(e) => setProfilePic(e.target.value)}
                className="w-full px-3 py-2.5 rounded text-sm font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={saveStatus !== 'idle'}
              className="w-full py-3.5 rounded btn-athletic-orange"
            >
              {saveStatus === 'saving' ? (
                <span>Saving...</span>
              ) : saveStatus === 'saved' ? (
                <span className="flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> SAVED</span>
              ) : (
                <span className="flex items-center justify-center gap-1.5"><Save className="w-4 h-4" /> SAVE CHANGES</span>
              )}
            </button>
          </form>
        </div>

        {/* Notifications Panel */}
        <div className="court-panel p-6 rounded-xl bg-dark-card border-2">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
            <Bell className="w-5 h-5 text-secondary animate-pulse" />
            <h3 className="font-display text-2xl font-black italic text-white uppercase tracking-wider">
              System alerts
            </h3>
          </div>

          <div className="space-y-4">
            {notifications.map((n) => (
              <div key={n.id} className="p-3.5 rounded bg-black/60 border border-white/5 font-semibold text-xs">
                <p className="text-gray-300 leading-normal">{n.msg}</p>
                <span className="text-[9px] text-gray-500 block mt-1.5 uppercase font-bold">{n.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Registered Tourneys & Teams */}
      <div className="lg:col-span-2 space-y-6">
        {/* Teams Dashboard */}
        <div className="court-panel p-6 rounded-xl bg-dark-card border-2">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-display text-2xl font-black italic text-white uppercase tracking-wider">
                My squads roster
              </h3>
            </div>
            <span className="text-xs text-primary font-bold text-glow-orange uppercase">{teams.length} Squads</span>
          </div>

          {teams.length === 0 ? (
            <div className="p-8 text-center bg-black/40 rounded border border-dashed border-white/10 text-sm text-gray-500 font-semibold">
              You are not a member of any squad.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((t) => {
                const isCaptain = t.captain_id === user.id;
                return (
                  <div key={t.id} className="p-4 rounded bg-black/45 border border-white/5 flex items-center justify-between font-semibold">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{t.logo || '🛡️'}</span>
                      <div>
                        <h4 className="font-display text-lg font-bold text-white uppercase">{t.team_name}</h4>
                        <span className="text-[10px] text-gray-500 uppercase">
                          {t.members.length} members • Capt: {t.captain_name}
                        </span>
                      </div>
                    </div>
                    {isCaptain ? (
                      <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black bg-primary/10 border border-primary/20 text-primary text-glow-orange bg-black">
                        CAPTAIN
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black bg-white/5 border border-white/10 text-gray-400">
                        MEMBER
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Registered Tournaments */}
        <div className="court-panel p-6 rounded-xl bg-dark-card border-2">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
            <Trophy className="w-5 h-5 text-secondary" />
            <h3 className="font-display text-2xl font-black italic text-white uppercase tracking-wider">
              Squad enrolments
            </h3>
          </div>

          {registeredTours.length === 0 ? (
            <div className="p-8 text-center bg-black/40 rounded border border-dashed border-white/10 text-sm text-gray-500 font-semibold">
              No registered tournament brackets yet. Join one today!
            </div>
          ) : (
            <div className="space-y-4">
              {registeredTours.map(({ tournament, payment }) => (
                <div key={payment.id} className="p-4 rounded bg-black/45 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 font-semibold text-xs">
                  <div>
                    <h4 className="font-display text-lg font-bold text-white uppercase">{tournament.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500 uppercase">
                      <span>Sport: {tournament.sport}</span>
                      <span>•</span>
                      <span>Squad: <strong className="text-gray-300">{payment.team_name}</strong></span>
                      <span>•</span>
                      <span>Fee: ₹{payment.amount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                      <div className="text-[9px] text-gray-500 uppercase font-black">CHECK-IN STATUS</div>
                      <div className="text-xs text-gray-300 font-bold uppercase mt-0.5">Sent {payment.created_at.slice(0,10)}</div>
                    </div>
                    <StatusBadge status={payment.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
