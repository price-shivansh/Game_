import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Team, api } from '../services/api';
import { Users, Plus, ShieldAlert, Check, Trash, UserPlus, Trophy, Award } from 'lucide-react';

export const TeamManagement: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

  // Form States
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState('🛡️');
  const [inviteEmail, setInviteEmail] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const logos = ['🏀', '🛡️', '⚔️', '⚡', '🔥', '🦁', '🦅', '🌪️', '💀', '🎯'];

  useEffect(() => {
    fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    if (!user) return;
    try {
      const data = await api.getMyTeams(user.id);
      setTeams(data);
      if (data.length > 0 && !activeTeamId) {
        setActiveTeamId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!user) return;

    try {
      const created = await api.createTeam(newTeamName, newTeamLogo, user.id);
      setSuccess(`Squad "${created.team_name}" formed successfully!`);
      setNewTeamName('');
      await fetchTeams();
      setActiveTeamId(created.id);
    } catch (err: any) {
      setError(err.message || 'Failed to form squad.');
    }
  };

  const handleInvitePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!activeTeamId) return;

    try {
      await api.invitePlayer(activeTeamId, inviteEmail);
      setSuccess(`Player added to roster successfully!`);
      setInviteEmail('');
      await fetchTeams();
    } catch (err: any) {
      setError(err.message || 'Roster update failed.');
    }
  };

  const handleRemovePlayer = async (userId: string) => {
    setError('');
    setSuccess('');
    if (!activeTeamId) return;

    try {
      await api.removePlayer(activeTeamId, userId);
      setSuccess('Player removed from roster.');
      await fetchTeams();
    } catch (err: any) {
      setError(err.message || 'Failed to remove player.');
    }
  };

  const activeTeam = teams.find((t) => t.id === activeTeamId);

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center p-8 text-gray-500 font-bold uppercase">
        Please log in to manage your teams.
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Column 1: Create Team & Squad List */}
      <div className="space-y-6">
        <div className="court-panel p-6 rounded-xl bg-dark-card border-2">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
            <Plus className="w-5 h-5 text-primary" />
            <h3 className="font-display text-2xl font-black italic text-white uppercase tracking-wider">
              Form Squad
            </h3>
          </div>

          <form onSubmit={handleCreateTeam} className="space-y-4 font-bold text-xs text-gray-500">
            <div>
              <label className="block uppercase tracking-wider mb-2">Team Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Street Kings"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full px-3 py-2.5 rounded text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider mb-2">Squad Emblem Logo</label>
              <div className="grid grid-cols-5 gap-2">
                {logos.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => setNewTeamLogo(logo)}
                    className={`text-2xl p-2 rounded border transition-all ${
                      newTeamLogo === logo ? 'border-primary bg-primary/10 bg-black' : 'border-white/5 bg-black/45'
                    }`}
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full py-3.5 rounded btn-athletic-orange">
              Form Squad
            </button>
          </form>
        </div>

        {/* Squad Selection Directory */}
        <div className="court-panel p-6 rounded-xl bg-dark-card border-2">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
            <Users className="w-5 h-5 text-secondary" />
            <h3 className="font-display text-2xl font-black italic text-white uppercase tracking-wider">
              Your Squads
            </h3>
          </div>

          {loading ? (
            <div className="text-gray-500 text-xs font-bold uppercase">Loading squads...</div>
          ) : teams.length === 0 ? (
            <div className="text-gray-500 text-xs py-2 font-semibold">No squads formed yet. Use form above to create.</div>
          ) : (
            <div className="space-y-3">
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTeamId(t.id);
                    setError('');
                    setSuccess('');
                  }}
                  className={`w-full p-3.5 rounded border-2 flex items-center gap-3 transition-all ${
                    activeTeamId === t.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-white/5 bg-black/20 hover:bg-black/35'
                  }`}
                >
                  <span className="text-3xl">{t.logo || '🛡️'}</span>
                  <div className="text-left font-semibold">
                    <div className="font-display text-base font-bold text-white uppercase leading-none mb-1">{t.team_name}</div>
                    <span className="text-[10px] text-gray-500 uppercase">
                      {t.members.length} members • {t.captain_id === user.id ? 'Captain' : 'Teammate'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Column 2 & 3: Active Roster & Statistics */}
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="p-4 rounded border-2 border-rose-500/30 bg-rose-500/10 text-red-400 font-bold text-sm flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 rounded border-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold text-sm flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {activeTeam ? (
          <>
            {/* Squad Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-bold text-xs">
              {[
                { label: 'Wins', value: activeTeam.wins, icon: Award, color: 'text-primary' },
                { label: 'Losses', value: activeTeam.losses, icon: ShieldAlert, color: 'text-rose-500' },
                { label: 'Standings Points', value: activeTeam.points, icon: Trophy, color: 'text-secondary' },
              ].map((stat, idx) => (
                <div key={idx} className="court-panel p-5 flex items-center gap-4 rounded-xl bg-dark-card border-2">
                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center border border-white/5">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 uppercase font-black tracking-wider">{stat.label}</div>
                    <div className="text-xl text-white font-mono">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Roster & Invites */}
            <div className="court-panel p-6 rounded-xl bg-dark-card border-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-5">
                <div>
                  <h3 className="font-display text-3xl font-black italic text-white uppercase tracking-wide leading-none">
                    {activeTeam.logo} {activeTeam.team_name} Roster
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold mt-1">Captain: {activeTeam.captain_name}</p>
                </div>

                {activeTeam.captain_id === user.id && (
                  <form onSubmit={handleInvitePlayer} className="flex gap-2 font-bold text-xs">
                    <input
                      type="email"
                      required
                      placeholder="player@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg min-w-[200px] font-semibold"
                    />
                    <button type="submit" className="px-4 py-2 rounded bg-secondary text-white font-display text-sm font-extrabold uppercase hover:bg-blue-600 transition-colors">
                      Invite
                    </button>
                  </form>
                )}
              </div>

              {/* Members List */}
              <div className="space-y-3 font-semibold text-xs text-gray-400">
                {activeTeam.members.map((memberId) => {
                  const isCaptain = activeTeam.captain_id === memberId;
                  const isCurrentUser = memberId === user.id;

                  return (
                    <div
                      key={memberId}
                      className="p-3.5 rounded bg-black/45 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white uppercase">
                          {memberId.slice(0, 4)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white uppercase">
                            Player ({memberId})
                            {isCurrentUser && <span className="text-xs text-primary font-normal normal-case ml-1.5">(You)</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isCaptain ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-primary/10 border border-primary/20 text-primary text-glow-orange bg-black">
                            Captain
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-white/5 border border-white/10 text-gray-500 bg-black">
                            Teammate
                          </span>
                        )}

                        {activeTeam.captain_id === user.id && !isCaptain && (
                          <button
                            onClick={() => handleRemovePlayer(memberId)}
                            className="p-1.5 text-gray-600 hover:text-red-500 transition-colors"
                            title="Remove Teammate"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="court-panel p-8 text-center text-gray-500 font-semibold border-2 bg-dark-card rounded-xl">
            Select a team to manage or form a new one to begin.
          </div>
        )}
      </div>
    </div>
  );
};
