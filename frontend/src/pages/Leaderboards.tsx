import React, { useEffect, useState } from 'react';
import { Team, api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { Trophy, Award, Medal, Star } from 'lucide-react';

export const Leaderboards: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.getTeams();
        const sorted = data.sort((a, b) => {
          if (b.points !== a.points) {
            return b.points - a.points;
          }
          return b.wins - a.wins;
        });
        setTeams(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading standings board...</div>;
  }

  const topThree = teams.slice(0, 3);

  const getRankBadge = (idx: number) => {
    switch (idx) {
      case 0: return 'border-amber-400 bg-amber-400/10 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.25)]';
      case 1: return 'border-slate-300 bg-slate-300/10 text-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.25)]';
      case 2: return 'border-amber-600 bg-amber-600/10 text-amber-600 shadow-[0_0_15px_rgba(180,83,9,0.25)]';
      default: return 'border-white/10 bg-white/5 text-gray-400';
    }
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="font-display text-4xl sm:text-6xl font-black italic text-white uppercase tracking-tight leading-none">
          LEAGUE STANDINGS
        </h1>
        <p className="text-gray-400 text-sm mt-2 max-w-md font-semibold">
          ELOs, wins, and standings points adjusted instantly after official match sheets are finalized.
        </p>
      </div>

      {/* Podium Block */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {topThree.map((team, idx) => {
            const places = ['CHAMPION', 'RUNNER UP', '3RD PLACE'];
            const icons = [Trophy, Award, Medal];
            const PlaceIcon = icons[idx];

            return (
              <div
                key={team.id}
                className={`p-6 rounded-xl border-2 flex flex-col items-center text-center relative overflow-hidden bg-dark-card ${getRankBadge(idx)}`}
              >
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
                <PlaceIcon className="w-14 h-14 mb-4 animate-bounce" />
                <span className="text-[10px] font-black tracking-widest text-glow-orange mb-1.5">
                  {places[idx]}
                </span>
                <h3 className="font-display text-3xl font-black italic text-white mb-2 uppercase tracking-wide">
                  {team.logo} {team.team_name}
                </h3>
                <p className="text-xs text-gray-500 font-semibold">Capt: {team.captain_name}</p>

                <div className="grid grid-cols-3 gap-4 w-full mt-6 border-t border-white/5 pt-4 text-xs font-bold">
                  <div>
                    <div className="text-gray-500 uppercase font-black text-[9px]">Wins</div>
                    <div className="text-white text-base mt-0.5">{team.wins}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase font-black text-[9px]">Losses</div>
                    <div className="text-white text-base mt-0.5">{team.losses}</div>
                  </div>
                  <div>
                    <div className="text-primary uppercase font-black text-[9px] text-glow-orange">Points</div>
                    <div className="text-white text-base mt-0.5">{team.points}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard Table List */}
      <div className="court-panel rounded-xl overflow-hidden bg-dark-card">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-display text-2xl font-black italic text-white uppercase tracking-wider">
            ALL SQUADS
          </h3>
          <span className="text-xs text-primary font-bold text-glow-orange uppercase">Active League Ranks</span>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No squads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-black/40 border-b border-white/5 text-gray-500 uppercase tracking-widest font-extrabold text-[9px]">
                  <th className="py-4 px-6 text-center">Rank</th>
                  <th className="py-4 px-4">Squad Name</th>
                  <th className="py-4 px-4">Captain</th>
                  <th className="py-4 px-4 text-center">Wins</th>
                  <th className="py-4 px-4 text-center">Losses</th>
                  <th className="py-4 px-6 text-center">ELO Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {teams.map((team, idx) => (
                  <tr key={team.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-6 text-center font-display text-lg font-black text-white italic">
                      #{idx + 1}
                    </td>
                    <td className="py-4 px-4 flex items-center gap-3 font-bold text-white uppercase text-sm">
                      <span className="text-2xl">{team.logo}</span>
                      <span>{team.team_name}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 text-sm font-bold">{team.captain_name}</td>
                    <td className="py-4 px-4 text-center text-emerald-400 text-sm font-bold">{team.wins}</td>
                    <td className="py-4 px-4 text-center text-rose-500 text-sm font-bold">{team.losses}</td>
                    <td className="py-4 px-6 text-center font-display text-lg font-black italic text-primary text-glow-orange">
                      {team.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
