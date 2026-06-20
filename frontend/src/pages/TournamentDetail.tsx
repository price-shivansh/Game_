import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tournament, Match, Team, api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { TournamentBracket } from '../components/TournamentBracket';
import { Calendar, Trophy, Users, ShieldAlert, FileText, CheckCircle, Upload } from 'lucide-react';

export const TournamentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // States
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myCaptainTeams, setMyCaptainTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rules' | 'teams' | 'bracket'>('rules');

  // Modal States
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<string>('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id, user]);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const data = await api.getTournamentDetails(id);
      setTournament(data.tournament);
      setMatches(data.matches);
      setTeams(data.teams);

      if (user) {
        const userTeams = await api.getMyTeams(user.id);
        const captTeams = userTeams.filter((t) => t.captain_id === user.id);
        setMyCaptainTeams(captTeams);
        if (captTeams.length > 0) {
          setSelectedTeamId(captTeams[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(URL.createObjectURL(file));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setSubmitting(true);

    if (!id || !selectedTeamId) {
      setRegError('Please select a team.');
      setSubmitting(false);
      return;
    }

    try {
      await api.registerForTournament(
        id,
        selectedTeamId,
        user!.id,
        screenshotFile || 'https://images.unsplash.com/photo-1616077168712-fc6c788bc4ee?auto=format&fit=crop&q=80&w=300'
      );
      setRegSuccess('Proof of payment submitted! Organizer approval pending.');
      setTimeout(() => {
        setShowRegModal(false);
        fetchDetails();
      }, 2500);
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading tournament stats...</div>;
  }

  if (!tournament) {
    return <div className="p-12 text-center text-gray-400 font-bold">Tournament not found.</div>;
  }

  const isAlreadyRegistered = teams.some(t => myCaptainTeams.some(m => m.id === t.id));

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
      {/* Banner */}
      <div className="court-panel p-8 rounded-xl bg-dark-card mb-8 relative overflow-hidden border-2 border-primary/20">
        <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              <StatusBadge status={tournament.status} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/30 px-2 py-0.5 rounded bg-black">
                {tournament.sport} • {tournament.format}
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-black italic text-white uppercase tracking-tight leading-none">
              {tournament.title}
            </h1>
            <p className="text-gray-400 text-sm mt-3 font-semibold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" /> Start Date: {tournament.start_date}
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-left px-5 py-2.5 rounded bg-black/60 border border-white/5">
              <div className="text-[9px] text-gray-500 uppercase font-black tracking-wider">PRIZE MONEY</div>
              <div className="text-xl text-glow-orange text-primary font-display font-black italic">₹{tournament.prize_pool}</div>
            </div>
            <div className="text-left px-5 py-2.5 rounded bg-black/60 border border-white/5">
              <div className="text-[9px] text-gray-500 uppercase font-black tracking-wider">ENTRY SLOTS DUE</div>
              <div className="text-xl text-white font-display font-black italic">₹{tournament.entry_fee}</div>
            </div>

            {tournament.status === 'upcoming' && (
              <>
                {user ? (
                  myCaptainTeams.length > 0 ? (
                    isAlreadyRegistered ? (
                      <button disabled className="px-6 py-3.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-display text-lg font-black uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <CheckCircle className="w-4 h-4" /> Enrolled
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowRegModal(true)}
                        className="px-6 py-3.5 rounded btn-athletic-orange"
                      >
                        Register Squad
                      </button>
                    )
                  ) : (
                    <Link to="/teams" className="px-6 py-3.5 rounded border-2 border-dashed border-primary/40 text-primary hover:bg-primary/5 font-display text-base font-bold uppercase">
                      Create Team to Join
                    </Link>
                  )
                ) : (
                  <Link to="/login" className="px-6 py-3.5 rounded btn-athletic-orange">
                    Log in to Register
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b-2 border-white/5 mb-8">
        {[
          { id: 'rules', label: 'RULES & INFO', icon: FileText },
          { id: 'teams', label: `SQUADS BOARD (${teams.length})`, icon: Users },
          { id: 'bracket', label: 'PLAYOFF BRACKET', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3.5 font-display text-lg font-bold uppercase transition-all border-b-2 -mb-[2px] ${
                activeTab === tab.id
                  ? 'border-primary text-primary text-glow-orange'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'rules' && (
          <div className="court-panel p-6 rounded-xl bg-dark-card space-y-6">
            <div>
              <h3 className="font-display text-2xl font-black italic text-white uppercase mb-4 tracking-wide">
                Tournament Regulations
              </h3>
              <ul className="space-y-3.5">
                {tournament.rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-300 font-semibold leading-relaxed">
                    <span className="text-primary font-display font-black text-lg">{idx + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded bg-black/40 border border-white/5 font-semibold">
              <h4 className="text-white text-xs uppercase font-extrabold mb-1">Roster Guidelines</h4>
              <p className="text-[11px] text-gray-500">
                Matches are configured under standard street basketball rules. All roster adjustments must be approved 24 hours prior to the bracket creation.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="court-panel p-6 rounded-xl bg-dark-card">
            <h3 className="font-display text-2xl font-black italic text-white uppercase mb-6 tracking-wide">
              Registered Teams
            </h3>
            {teams.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-semibold text-sm border border-dashed border-white/10 rounded">
                No teams have confirmed registration for this event yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((t) => (
                  <div key={t.id} className="p-4 rounded bg-black/45 border border-white/5 flex items-center justify-between font-semibold">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{t.logo || '🛡️'}</span>
                      <div>
                        <h4 className="font-display text-lg font-bold text-white uppercase">{t.team_name}</h4>
                        <span className="text-xs text-gray-500">Captain: {t.captain_name}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-primary border border-primary/30 bg-primary/5 px-2.5 py-1 rounded font-black uppercase tracking-widest text-glow-orange bg-black">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bracket' && (
          <div className="court-panel p-6 rounded-xl bg-dark-card">
            <TournamentBracket matches={matches} teams={teams} />
          </div>
        )}
      </div>

      {/* Registration & UPI Payment Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 border-2 border-primary/30 bg-dark-card rounded-xl relative shadow-[0_0_30px_rgba(255,85,0,0.2)]">
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-extrabold text-sm"
            >
              ✕
            </button>

            <h3 className="font-display text-3xl font-black italic text-glow-orange text-primary mb-6 uppercase tracking-wider text-center">
              SUBMIT SQUAD CHECK-IN
            </h3>

            {regError && (
              <div className="p-3.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5 text-xs font-semibold">
              <div>
                <label className="block text-gray-500 uppercase font-black tracking-widest mb-2">
                  Select Team to Enroll
                </label>
                <select
                  required
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded text-sm font-bold uppercase text-gray-300"
                >
                  {myCaptainTeams.map((t) => (
                    <option key={t.id} value={t.id} className="bg-dark-bg">
                      {t.logo} {t.team_name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* UPI QR Mock Box */}
              <div className="p-4 rounded bg-black/60 border border-white/5 text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 font-black">
                  Scan and Pay Entry Slot Fee (₹{tournament.entry_fee})
                </div>
                
                <div className="w-36 h-36 bg-white p-2 mx-auto rounded mb-3 flex items-center justify-center border-2 border-primary">
                  <div className="w-full h-full border-4 border-black bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-slate-900 flex items-center justify-center font-display text-xs text-white font-extrabold uppercase">
                    ARENA QR
                  </div>
                </div>

                <div className="text-xs text-gray-300 font-bold uppercase">
                  UPI ID: <strong className="text-primary text-glow-orange">pay@arenahub</strong>
                </div>
              </div>

              <div>
                <label className="block text-gray-500 uppercase font-black tracking-widest mb-2">
                  Upload Payment Screenshot Proof
                </label>
                <div className="relative border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-primary/40 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                  <Upload className="w-6 h-6 text-gray-500" />
                  <span className="text-[10px] text-gray-500 uppercase font-black">Click to upload screenshot jpeg/png</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {screenshotFile && (
                  <div className="mt-2 text-center text-xs text-emerald-400 font-bold uppercase">
                    ✓ Proof image loaded successfully
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4.5 rounded btn-athletic-orange"
              >
                {submitting ? 'PROCESSING CHECK-IN...' : 'SUBMIT CHECK-IN SLIP'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
