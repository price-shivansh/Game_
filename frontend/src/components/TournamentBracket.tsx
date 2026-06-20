import React from 'react';
import { Match, Team } from '../services/api';
import { Trophy, Star } from 'lucide-react';

interface TournamentBracketProps {
  matches: Match[];
  teams: Team[];
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ matches, teams }) => {
  const findTeamName = (teamId: string | null) => {
    if (!teamId) return 'TBD';
    const team = teams.find((t) => t.id === teamId);
    return team ? `${team.logo} ${team.team_name}` : 'TBD';
  };

  const roundsOrder = ['Quarterfinals', 'Semifinals', 'Final'];
  const existingRounds = roundsOrder.filter(r => matches.some(m => m.round === r));

  if (matches.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-white/10 bg-dark-card rounded-xl">
        <Trophy className="w-12 h-12 text-primary mx-auto mb-4 animate-bounce" />
        <h4 className="font-display text-2xl font-bold text-white mb-2 uppercase tracking-wider">Playoff Brackets Pending</h4>
        <p className="text-sm text-gray-500 font-semibold max-w-sm mx-auto">
          Tournament fixtures and match schedules will be generated here once registrations are closed and finalized.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto py-8">
      <div className="min-w-[800px] flex items-center justify-around gap-8 px-4">
        {existingRounds.map((roundName) => {
          const roundMatches = matches
            .filter((m) => m.round === roundName)
            .sort((a, b) => a.match_number - b.match_number);

          return (
            <div key={roundName} className="flex-1 flex flex-col justify-around min-h-[420px] gap-8">
              {/* Round Title Header */}
              <div className="text-center font-display text-xl font-black italic tracking-widest text-primary border-b-2 border-primary/20 pb-2 mb-4 uppercase">
                {roundName}
              </div>
              
              <div className="flex flex-col justify-around flex-grow gap-6">
                {roundMatches.map((match) => {
                  const isWinner1 = match.status === 'completed' && match.winner_id === match.team1_id && match.team1_id !== null;
                  const isWinner2 = match.status === 'completed' && match.winner_id === match.team2_id && match.team2_id !== null;
                  const isLive = match.status === 'live';

                  return (
                    <div
                      key={match.id}
                      className={`relative flex flex-col p-4 rounded-lg border-2 transition-all duration-300 bg-black ${
                        isLive
                          ? 'border-primary shadow-[0_0_15px_rgba(255,85,0,0.3)] animate-pulse'
                          : 'border-white/10 hover:border-primary/50'
                      }`}
                    >
                      {/* Match Number Tag */}
                      <div className="absolute -top-3 left-4 px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-widest bg-dark-bg border border-primary/30 text-primary text-glow-orange">
                        {isLive ? '● LIVE STREAM' : `MATCH #${match.match_number}`}
                      </div>

                      {/* Team 1 Rows */}
                      <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span
                          className={`font-display text-base font-bold uppercase tracking-wider ${
                            isWinner1 ? 'text-primary text-glow-orange' : 'text-gray-300'
                          }`}
                        >
                          {findTeamName(match.team1_id)}
                          {isWinner1 && <Star className="w-3.5 h-3.5 inline ml-1 text-primary fill-current" />}
                        </span>
                        <span
                          className={`font-mono text-xl font-bold px-2.5 py-0.5 rounded bg-dark-card border border-white/5 ${
                            isWinner1 ? 'text-primary text-glow-orange' : 'text-gray-500'
                          }`}
                        >
                          {match.status === 'scheduled' ? '-' : match.score_team1}
                        </span>
                      </div>

                      {/* Team 2 Rows */}
                      <div className="flex items-center justify-between py-2">
                        <span
                          className={`font-display text-base font-bold uppercase tracking-wider ${
                            isWinner2 ? 'text-primary text-glow-orange' : 'text-gray-300'
                          }`}
                        >
                          {findTeamName(match.team2_id)}
                          {isWinner2 && <Star className="w-3.5 h-3.5 inline ml-1 text-primary fill-current" />}
                        </span>
                        <span
                          className={`font-mono text-xl font-bold px-2.5 py-0.5 rounded bg-dark-card border border-white/5 ${
                            isWinner2 ? 'text-primary text-glow-orange' : 'text-gray-500'
                          }`}
                        >
                          {match.status === 'scheduled' ? '-' : match.score_team2}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
