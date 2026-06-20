import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tournament, Match, Team, api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { TournamentBracket } from '../components/TournamentBracket';
import { Trophy, Calendar, Target, Users, Play, Clock, Star } from 'lucide-react';

const BasketballIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M6.2 6.2c2.4 2.4 2.4 9.2 0 11.6" />
    <path d="M17.8 6.2c-2.4 2.4 -2.4 9.2 0 11.6" />
    <path d="M2 12h20" />
    <path d="M12 2v20" />
  </svg>
);

export const Home: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Live countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const toursData = await api.getTournaments();
        setTournaments(toursData);

        const activeTour = toursData.find(t => t.status === 'active');
        if (activeTour) {
          const detail = await api.getTournamentDetails(activeTour.id);
          setMatches(detail.matches.slice(0, 3));
        }

        const teamsData = await api.getTeams();
        setTeams(teamsData.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const formatTime = (t: typeof timeLeft) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)}`;
  };

  return (
    <div className="flex-grow bg-dark-bg">
      {/* 1. Giant Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 text-center border-b-4 border-primary">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/basketball_hero.png')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/85 to-transparent"></div>
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] stadium-beam pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-[350px] h-[300px] stadium-beam-blue pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto z-10 py-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border-2 border-primary text-primary text-sm font-display font-black tracking-widest uppercase mb-6 animate-pulse text-glow-orange">
            <BasketballIcon className="w-4 h-4 text-primary" /> REGISTER TODAY • BATTLE TONIGHT
          </div>

          <h1 className="font-display text-6xl sm:text-8xl md:text-9xl font-black italic tracking-tighter text-white uppercase leading-none select-none">
            RULE THE <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent text-glow-orange">
              COURT
            </span>
          </h1>

          <p className="font-sans text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mt-6 mb-10 leading-relaxed font-semibold">
            The ultimate street basketball tournament platform for local teams. Draft your squad, dominate the brackets, and walk away with the prize pool.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
            <Link to="/tournaments" className="w-full px-8 py-4 rounded btn-athletic-orange">
              Enter Tournaments
            </Link>
            <Link to="/teams" className="w-full px-8 py-4 rounded btn-athletic-blue">
              Form Squad
            </Link>
          </div>
        </div>

        {/* Bottom banner for active game indicators */}
        <div className="absolute bottom-4 left-6 right-6 hidden lg:flex items-center justify-between z-10 p-3.5 rounded-lg bg-black/80 border border-white/10 backdrop-blur-md overflow-hidden">
          <div className="flex items-center gap-3 shrink-0 mr-4">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-display text-sm font-bold uppercase tracking-wider text-glow-orange text-white">LIVE SCOREBOARD</span>
          </div>
          <div className="w-full overflow-hidden relative">
            <div className="animate-marquee whitespace-nowrap flex gap-12 text-xs font-bold text-gray-400">
              <span>🔥 Semifinals: Cyber Strikers 45 - 42 Vortex Giants</span>
              <span>🌪&nbsp; Warm-up: Neon Warriors 48 - 35 Shadow Eleven</span>
              <span>🏆 Upcoming: Monsoon Cricket Cup registration open</span>
              <span>🔥 Semifinals: Cyber Strikers 45 - 42 Vortex Giants</span>
              <span>🌪&nbsp; Warm-up: Neon Warriors 48 - 35 Shadow Eleven</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Scoreboard & Timer Section */}
      <section className="py-12 px-6 max-w-7xl mx-auto -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="scoreboard-panel p-6 rounded-xl flex flex-col justify-between h-44">
            <div>
              <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-extrabold mb-1">
                <span>NEXT SQUAD SEED LOCK</span>
                <Clock className="w-3.5 h-3.5 text-primary" />
              </div>
              <h4 className="font-display text-lg font-bold text-white uppercase">Monsoon Cup Registration</h4>
            </div>
            <div className="font-mono text-4xl sm:text-5xl font-extrabold text-glow-orange text-primary text-center py-2">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="scoreboard-panel p-5 rounded-xl flex flex-col justify-between h-44 text-xs">
            <div className="flex justify-between items-center font-display">
              <span className="text-[10px] text-primary tracking-widest font-black uppercase text-glow-orange">FINAL ROUND • LIVE</span>
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold animate-pulse text-[9px]">1ST HALF</span>
            </div>
            
            <div className="space-y-2.5 my-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white uppercase tracking-wider">⚡ Cyber Strikers</span>
                <span className="scoreboard-digital text-2xl">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">🌪️ Vortex Giants</span>
                <span className="scoreboard-digital text-2xl text-gray-600">18</span>
              </div>
            </div>

            <div className="text-[10px] text-gray-500 text-center uppercase font-bold border-t border-white/5 pt-2">
              Arena Blast 3v3 Bracket Match
            </div>
          </div>

          <div className="scoreboard-panel p-5 rounded-xl flex flex-col justify-between h-44 text-xs">
            <div className="flex justify-between items-center font-display">
              <span className="text-[10px] text-primary tracking-widest font-black uppercase text-glow-orange">COMPLETED FIXTURE</span>
              <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-bold text-[9px]">FINAL SCORE</span>
            </div>
            
            <div className="space-y-2.5 my-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white uppercase tracking-wider">🔥 Neon Warriors</span>
                <span className="scoreboard-digital-green text-2xl">48</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">👤 Shadow Eleven</span>
                <span className="scoreboard-digital text-2xl text-gray-600">35</span>
              </div>
            </div>

            <div className="text-[10px] text-gray-500 text-center uppercase font-bold border-t border-white/5 pt-2">
              Warm-up Scrimmage
            </div>
          </div>
        </div>
      </section>

      {/* 3. Prize Pool Showcase Banner */}
      <section className="py-8 bg-primary overflow-hidden relative border-y-4 border-black select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="inline-flex items-center gap-12 font-display text-4xl sm:text-6xl font-black italic tracking-tighter text-black uppercase">
              <span>WIN CASH PRIZES</span>
              <Star className="w-8 h-8 fill-current" />
              <span>TOTAL VALUE ₹2,50,000+</span>
              <Star className="w-8 h-8 fill-current" />
              <span>SPONSORED BY THE LEAGUE</span>
              <Star className="w-8 h-8 fill-current" />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Upcoming Tournaments */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <h2 className="font-display text-4xl sm:text-6xl font-black italic text-white uppercase tracking-tight leading-none">
              ACTIVE BATTLEGROUNDS
            </h2>
            <p className="text-gray-400 text-sm mt-2 max-w-md font-semibold">
              Select your sport format, draft your top performers, pay entry dues, and register your team.
            </p>
          </div>
          <Link to="/tournaments" className="text-sm font-bold text-primary hover:text-orange-400 transition-colors uppercase tracking-wider flex items-center gap-1">
            Browse All Tournaments <Play className="w-3 h-3 fill-current" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded bg-white/5 animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tournaments.map((tour) => (
              <div key={tour.id} className="court-panel rounded-xl overflow-hidden flex flex-col h-full bg-dark-card">
                <div className="h-32 bg-gradient-to-br from-primary/30 to-black p-5 flex flex-col justify-between border-b-2 border-white/5 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex justify-between items-start">
                    <StatusBadge status={tour.status} />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-primary border border-primary/30 px-2 py-0.5 rounded">
                      {tour.sport} • {tour.format}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-black italic text-white tracking-wide uppercase truncate leading-none mt-4">
                    {tour.title}
                  </h3>
                </div>

                <div className="p-5 flex flex-col justify-between flex-grow gap-5">
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-[9px] uppercase text-gray-500 font-extrabold">STARTS ON</div>
                        <div className="text-gray-300">{tour.start_date}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-secondary" />
                      <div>
                        <div className="text-[9px] uppercase text-gray-500 font-extrabold">PRIZE POOL</div>
                        <div className="text-white text-glow-orange font-bold font-mono">₹{tour.prize_pool}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs py-2.5 px-3 rounded bg-black/40 border border-white/5">
                    <span className="text-gray-500 uppercase font-extrabold">ENTRY DUED FEE</span>
                    <span className="text-primary font-display text-lg font-black italic">₹{tour.entry_fee}</span>
                  </div>

                  <Link
                    to={`/tournament/${tour.id}`}
                    className="w-full text-center py-3 rounded btn-athletic-orange text-sm font-bold tracking-wide"
                  >
                    Inspect Bracket
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Tournament Brackets Preview */}
      <section className="py-16 bg-black/50 border-y-2 border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-primary tracking-widest uppercase mb-3 block text-glow-orange">
              PLAYOFF TREE PREVIEW
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-black italic text-white uppercase">
              Brackets & Match Matchups
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto mt-2 font-semibold">
              Trace rounds from the Quarterfinals, check scores, and view the championship tree progression.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-dark-card/50">
            <TournamentBracket matches={matches} teams={teams} />
          </div>
        </div>
      </section>

      {/* 6. Featured Teams & Leaderboard Standings */}
      <section className="py-16 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-4xl sm:text-5xl font-black italic text-glow-orange text-white uppercase tracking-tight mb-8">
            🏆 FEATURED SQUADS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teams.map((team) => (
              <div key={team.id} className="court-panel p-5 rounded-xl bg-dark-card flex flex-col justify-between h-40">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{team.logo || '🛡️'}</span>
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase text-white tracking-wide">
                      {team.team_name}
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-gray-500">Captain: {team.captain_name}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-white/5 pt-4">
                  <div className="text-xs">
                    <span className="text-gray-500 uppercase font-extrabold text-[9px] block">STANDINGS SCORE</span>
                    <span className="text-primary font-display text-lg font-black italic">{team.points} ELO</span>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-emerald-400 font-bold">{team.wins} W</span>
                    <span className="text-gray-500 mx-1">•</span>
                    <span className="text-rose-500 font-bold">{team.losses} L</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-4xl sm:text-5xl font-black italic text-white uppercase tracking-tight mb-8">
            📊 PLATFORM STANDINGS
          </h2>

          <div className="court-panel rounded-xl bg-dark-card overflow-hidden">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-black/40 border-b-2 border-white/5 text-gray-500 uppercase tracking-widest font-extrabold text-[9px]">
                  <th className="py-4 px-4 text-center">Rank</th>
                  <th className="py-4 px-4">Squad Logo / Name</th>
                  <th className="py-4 px-4 text-center">W</th>
                  <th className="py-4 px-4 text-center">L</th>
                  <th className="py-4 px-4 text-center">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {teams.map((team, idx) => (
                  <tr key={team.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-4 text-center font-display text-base font-bold text-white italic">
                      #{idx + 1}
                    </td>
                    <td className="py-4 px-4 flex items-center gap-2.5 font-bold text-white uppercase text-sm">
                      <span className="text-2xl">{team.logo}</span>
                      <span>{team.team_name}</span>
                    </td>
                    <td className="py-4 px-4 text-center text-emerald-400">{team.wins}</td>
                    <td className="py-4 px-4 text-center text-rose-500">{team.losses}</td>
                    <td className="py-4 px-4 text-center font-display text-sm font-black italic text-primary">
                      {team.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. Sponsors Section */}
      <section className="py-12 bg-black/40 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-6">
            SUPPORTED SPONSORS & AFFILIATES
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-35 hover:opacity-60 transition-opacity duration-300">
            <span className="font-display text-3xl font-black italic text-white tracking-widest">NIKE</span>
            <span className="font-display text-3xl font-black italic text-white tracking-widest">RED BULL</span>
            <span className="font-display text-3xl font-black italic text-white tracking-widest">SPALDING</span>
            <span className="font-display text-3xl font-black italic text-white tracking-widest">AIR JORDAN</span>
          </div>
        </div>
      </section>

      {/* 8. Call to Action to Register */}
      <section className="py-20 px-6 text-center border-t-4 border-primary relative overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-dark-bg to-dark-bg">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="font-display text-5xl sm:text-7xl font-black italic text-white uppercase leading-none tracking-tighter">
            ARE YOU READY TO <br />
            <span className="text-primary text-glow-orange">CLAIM THE TITLE?</span>
          </h2>
          <p className="text-gray-400 font-semibold max-w-md mx-auto mt-4 mb-8 leading-relaxed">
            Form your roster, invite key teammates, pay entry slots, and enter the official street bracket.
          </p>

          <Link to="/signup" className="px-10 py-5 rounded btn-athletic-orange text-lg">
            Register Roster Now
          </Link>
        </div>
      </section>
    </div>
  );
};
