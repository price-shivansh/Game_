import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tournament, Match, Team, Payment, api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Shield, Plus, Check, X, Trophy } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // States
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>('');
  const [tourMatches, setTourMatches] = useState<Match[]>([]);
  const [tourTeams, setTourTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [newTourTitle, setNewTourTitle] = useState('');
  const [newTourSport, setNewTourSport] = useState<'Basketball' | 'Football' | 'Badminton' | 'Volleyball'>('Basketball');
  const [newTourFormat, setNewTourFormat] = useState<'3v3' | '5v5' | 'Singles' | 'Doubles' | 'Standard'>('3v3');
  const [newTourFee, setNewTourFee] = useState(300);
  const [newTourPrize, setNewTourPrize] = useState(5000);
  const [newTourDate, setNewTourDate] = useState('2026-07-01');
  const [newTourMaxTeams, setNewTourMaxTeams] = useState(8);
  const [newTourRule, setNewTourRule] = useState('');
  const [rulesList, setRulesList] = useState<string[]>(['Standard street rules apply.']);

  // Score states
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [matchStatus, setMatchStatus] = useState<'scheduled' | 'live' | 'completed'>('scheduled');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const pays = await api.adminGetAllPayments();
      setPayments(pays);

      const tours = await api.getTournaments();
      setTournaments(tours);
      if (tours.length > 0 && !selectedTourId) {
        setSelectedTourId(tours[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTourId) {
      fetchTournamentDetails();
    }
  }, [selectedTourId]);

  const fetchTournamentDetails = async () => {
    try {
      const data = await api.getTournamentDetails(selectedTourId);
      setTourMatches(data.matches);
      setTourTeams(data.teams);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprovePayment = async (payId: string, action: 'approved' | 'rejected') => {
    setError('');
    setSuccess('');
    try {
      await api.adminApprovePayment(payId, action);
      setSuccess(`Roster check-in status updated to ${action.toUpperCase()}`);
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message || 'Action failed.');
    }
  };

  const handleGenerateBracket = async () => {
    setError('');
    setSuccess('');
    try {
      await api.adminGenerateBracket(selectedTourId);
      setSuccess('Bracket generated successfully! Tournament is now ACTIVE.');
      await fetchAdminData();
      await fetchTournamentDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to generate bracket.');
    }
  };

  const handleAddRule = () => {
    if (newTourRule.trim()) {
      setRulesList([...rulesList, newTourRule.trim()]);
      setNewTourRule('');
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.adminCreateTournament({
        title: newTourTitle,
        sport: newTourSport,
        format: newTourFormat,
        entry_fee: Number(newTourFee),
        prize_pool: Number(newTourPrize),
        start_date: newTourDate,
        rules: rulesList,
        max_teams: Number(newTourMaxTeams),
      });

      setSuccess(`Tournament "${newTourTitle}" created successfully!`);
      setNewTourTitle('');
      setRulesList(['Standard street rules apply.']);
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to create tournament.');
    }
  };

  const handleOpenScoreEdit = (match: Match) => {
    setEditingMatchId(match.id);
    setScore1(match.score_team1);
    setScore2(match.score_team2);
    setMatchStatus(match.status);
  };

  const handleUpdateScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!editingMatchId) return;

    try {
      await api.adminUpdateMatchScore(editingMatchId, score1, score2, matchStatus);
      setSuccess('Scorecard updated successfully!');
      setEditingMatchId(null);
      await fetchTournamentDetails();
    } catch (err: any) {
      setError(err.message || 'Score update failed.');
    }
  };

  const selectedTour = tournaments.find((t) => t.id === selectedTourId);

  if (!user || user.role !== 'admin') {
    return <div className="p-8 text-center text-red-500 font-bold">Access Denied. Admins Only.</div>;
  }

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl sm:text-6xl font-black italic text-glow-orange text-white uppercase tracking-tight leading-none flex items-center gap-2">
          <Shield className="w-10 h-10 text-primary" /> ORGANIZER CONTROLS
        </h1>
        <p className="text-gray-400 text-sm mt-2 font-semibold">
          Verify squad check-in receipts, edit live bracket scoreboards, and issue new tournaments.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded border-2 border-rose-500/30 bg-rose-500/10 text-red-400 font-bold text-sm flex items-center gap-2">
          <X className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded border-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold text-sm flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Launch Tournament */}
        <div className="court-panel p-6 rounded-xl bg-dark-card h-fit">
          <div className="flex items-center gap-2 mb-6">
            <Plus className="w-5 h-5 text-primary" />
            <h3 className="font-display text-2xl font-black italic text-white uppercase tracking-wider">
              Launch Tournament
            </h3>
          </div>

          <form onSubmit={handleCreateTournament} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-gray-500 uppercase font-black tracking-wider mb-2">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Winter Cup 3v3"
                value={newTourTitle}
                onChange={(e) => setNewTourTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 uppercase font-black tracking-wider mb-2">Sport</label>
                <select
                  value={newTourSport}
                  onChange={(e: any) => setNewTourSport(e.target.value)}
                  className="w-full px-3 py-2.5 rounded text-sm font-semibold"
                >
                  <option value="Basketball">Basketball</option>
                  <option value="Football">Football</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Volleyball">Volleyball</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 uppercase font-black tracking-wider mb-2">Format</label>
                <select
                  value={newTourFormat}
                  onChange={(e: any) => setNewTourFormat(e.target.value)}
                  className="w-full px-3 py-2.5 rounded text-sm font-semibold"
                >
                  <option value="3v3">3v3</option>
                  <option value="5v5">5v5</option>
                  <option value="Singles">Singles</option>
                  <option value="Doubles">Doubles</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-500 uppercase font-black tracking-wider mb-1">Fee (₹)</label>
                <input
                  type="number"
                  value={newTourFee}
                  onChange={(e) => setNewTourFee(Number(e.target.value))}
                  className="w-full px-2 py-2.5 rounded text-center"
                />
              </div>
              <div>
                <label className="block text-gray-500 uppercase font-black tracking-wider mb-1">Prize (₹)</label>
                <input
                  type="number"
                  value={newTourPrize}
                  onChange={(e) => setNewTourPrize(Number(e.target.value))}
                  className="w-full px-2 py-2.5 rounded text-center"
                />
              </div>
              <div>
                <label className="block text-gray-500 uppercase font-black tracking-wider mb-1">Max Teams</label>
                <input
                  type="number"
                  value={newTourMaxTeams}
                  onChange={(e) => setNewTourMaxTeams(Number(e.target.value))}
                  className="w-full px-2 py-2.5 rounded text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 uppercase font-black tracking-wider mb-2">Start Date</label>
              <input
                type="date"
                value={newTourDate}
                onChange={(e) => setNewTourDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-gray-500 uppercase font-black tracking-wider mb-2">Rules List</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Insert rule..."
                  value={newTourRule}
                  onChange={(e) => setNewTourRule(e.target.value)}
                  className="w-full px-3 py-2.5 rounded text-sm font-semibold"
                />
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="px-4 rounded bg-white/5 border-2 border-white/10 text-white font-display text-base font-bold uppercase hover:bg-white/10"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 text-gray-500 max-h-[80px] overflow-y-auto space-y-1 font-semibold italic text-[11px]">
                {rulesList.map((r, i) => (
                  <div key={i}>• {r}</div>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full py-3.5 rounded btn-athletic-orange mt-2">
              Launch Tournament
            </button>
          </form>
        </div>

        {/* Right Columns: Payments verification & Bracket Managers */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Payment proof verification banner */}
          <div className="court-panel p-6 rounded-xl bg-dark-card">
            <h3 className="font-display text-2xl font-black italic text-white uppercase mb-6 tracking-wide">
              Pending Check-In Receipts
            </h3>

            {payments.filter(p => p.status === 'pending').length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-semibold text-sm border border-dashed border-white/10 rounded">
                No squad check-in receipts to verify at this time.
              </div>
            ) : (
              <div className="space-y-4">
                {payments.filter(p => p.status === 'pending').map((pay) => (
                  <div key={pay.id} className="p-4 rounded bg-black/45 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 font-semibold text-xs">
                    <div className="flex items-center gap-4">
                      <a href={pay.screenshot} target="_blank" rel="noreferrer">
                        <img
                          src={pay.screenshot}
                          alt="Screenshot receipt"
                          className="w-16 h-16 object-cover rounded border-2 border-white/10 hover:border-primary transition-colors cursor-pointer"
                        />
                      </a>
                      <div>
                        <div className="font-display text-base font-bold text-white uppercase">{pay.tournament_title}</div>
                        <div className="text-gray-400 mt-0.5">
                          Squad: <strong className="text-white uppercase">{pay.team_name}</strong> • Captain ID: {pay.user_id}
                        </div>
                        <span className="text-[10px] text-gray-500 block mt-1">Submitted: {pay.created_at.slice(0, 16).replace('T', ' ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprovePayment(pay.id, 'approved')}
                        className="px-3.5 py-2.5 rounded bg-emerald-500 text-white font-display text-sm font-extrabold uppercase hover:bg-emerald-600 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprovePayment(pay.id, 'rejected')}
                        className="px-3.5 py-2.5 rounded border-2 border-rose-500 text-rose-500 hover:bg-rose-500/10 font-display text-sm font-extrabold uppercase transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brackets & Match Score Controls */}
          <div className="court-panel p-6 rounded-xl bg-dark-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="font-display text-2xl font-black italic text-white uppercase tracking-wider">
                  Bracket & Score Controls
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold uppercase mt-0.5">Configure fixtures and update score logs.</p>
              </div>

              {/* Tournament Selector */}
              <select
                value={selectedTourId}
                onChange={(e) => setSelectedTourId(e.target.value)}
                className="px-3 py-2 rounded text-xs font-bold uppercase text-gray-300"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title.toUpperCase()} ({t.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {selectedTour && (
              <div className="space-y-6">
                {/* Generation Banner */}
                {selectedTour.status === 'upcoming' && (
                  <div className="p-4 rounded bg-primary/10 border-2 border-primary/30 flex flex-col md:flex-row md:items-center justify-between gap-4 font-semibold text-xs">
                    <div>
                      <h4 className="font-display text-base font-bold text-white mb-0.5">Squads Enrollment</h4>
                      <p className="text-gray-400">
                        {tourTeams.length} / {selectedTour.max_teams} slots are confirmed.
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateBracket}
                      disabled={tourTeams.length < 2}
                      className="px-5 py-3 rounded btn-athletic-orange text-xs"
                    >
                      Generate Playoff Bracket
                    </button>
                  </div>
                )}

                {/* Score Editing Sub-Form */}
                {editingMatchId && (
                  <div className="p-4 rounded border-2 border-primary/30 bg-primary/5">
                    <form onSubmit={handleUpdateScore} className="space-y-4 font-bold text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-base font-black italic text-white uppercase tracking-wider">
                          ✏️ Update Fixture Card
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingMatchId(null)}
                          className="text-gray-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-500 mb-1">Team 1 Score</label>
                          <input
                            type="number"
                            value={score1}
                            onChange={(e) => setScore1(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded text-center text-sm font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-500 mb-1">Team 2 Score</label>
                          <input
                            type="number"
                            value={score2}
                            onChange={(e) => setScore2(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded text-center text-sm font-bold font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-500 mb-2 uppercase font-black">Match State</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['scheduled', 'live', 'completed'].map((statusOption) => (
                            <button
                              key={statusOption}
                              type="button"
                              onClick={() => setMatchStatus(statusOption as any)}
                              className={`py-2.5 rounded border text-xs font-bold uppercase transition-all ${
                                matchStatus === statusOption
                                  ? 'border-primary bg-primary/10 text-primary text-glow-orange'
                                  : 'border-white/5 bg-black/40 text-gray-500'
                              }`}
                            >
                              {statusOption}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button type="submit" className="w-full py-3.5 rounded btn-athletic-orange">
                        Save Scorecard
                      </button>
                    </form>
                  </div>
                )}

                {/* Fixtures Matches List */}
                <div className="space-y-3 font-semibold text-xs text-gray-400">
                  <h4 className="font-display text-base font-bold text-white uppercase tracking-wider mb-2">FIXTURE LISTINGS</h4>
                  {tourMatches.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 border border-dashed border-white/10 rounded">
                      Playoff fixtures have not been generated yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {tourMatches.map((match) => {
                        const t1Name = tourTeams.find((t) => t.id === match.team1_id)?.team_name || 'TBD';
                        const t2Name = tourTeams.find((t) => t.id === match.team2_id)?.team_name || 'TBD';

                        return (
                          <div key={match.id} className="py-3.5 flex items-center justify-between">
                            <div>
                              <div className="font-display text-base font-bold text-white uppercase">
                                {t1Name} <span className="text-primary italic">VS</span> {t2Name}
                              </div>
                              <span className="text-[10px] text-gray-500 uppercase tracking-widest block mt-0.5">
                                {match.round} • MATCH #{match.match_number}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm font-bold text-white bg-black/60 px-2.5 py-1 rounded border border-white/5">
                                {match.status === 'scheduled' ? '-' : `${match.score_team1} : ${match.score_team2}`}
                              </span>
                              <StatusBadge status={match.status} />
                              <button
                                onClick={() => handleOpenScoreEdit(match)}
                                className="px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:border-primary text-white text-[10px] font-bold uppercase transition-colors"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
