import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tournament, api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Trophy, Calendar, Search } from 'lucide-react';

export const TournamentList: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await api.getTournaments();
        setTournaments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const filteredTournaments = tournaments.filter((tour) => {
    const matchesSearch = tour.title.toLowerCase().includes(search.toLowerCase());
    const matchesSport = sportFilter === 'All' || tour.sport === sportFilter;
    const matchesStatus = statusFilter === 'All' || tour.status === statusFilter;
    return matchesSearch && matchesSport && matchesStatus;
  });

  const sports = ['All', 'Cricket', 'Football', 'Badminton', 'Volleyball', 'Basketball'];
  const statuses = ['All', 'upcoming', 'active', 'completed'];

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-display text-4xl sm:text-6xl font-black italic text-white uppercase tracking-tight leading-none">
          TOURNAMENTS CATALOG
        </h1>
        <p className="text-gray-400 text-sm mt-2 max-w-md font-semibold">
          Check out upcoming street events, live bracket tournaments, or explore past champion stats.
        </p>
      </div>

      {/* Filter Controllers */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search matchups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm font-semibold"
          />
        </div>

        {/* Sport Select */}
        <div className="relative">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm font-bold uppercase text-gray-300"
          >
            {sports.map((s) => (
              <option key={s} value={s} className="bg-dark-bg text-white font-bold">
                {s === 'All' ? 'All Sports' : s.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Status Select */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm font-bold uppercase text-gray-300"
          >
            {statuses.map((st) => (
              <option key={st} value={st} className="bg-dark-bg text-white font-bold">
                {st === 'All' ? 'All Statuses' : st.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded bg-white/5 animate-pulse border border-white/5"></div>
          ))}
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="text-center py-16 text-gray-500 font-semibold text-base border-2 border-dashed border-white/10 rounded-xl bg-dark-card">
          No tournaments found matching the filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTournaments.map((tour) => (
            <div key={tour.id} className="court-panel rounded-xl overflow-hidden flex flex-col h-full bg-dark-card">
              {/* Header Banner */}
              <div className="h-32 bg-gradient-to-br from-primary/30 to-black p-5 flex flex-col justify-between border-b-2 border-white/5">
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

              {/* Details Section */}
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
    </div>
  );
};
