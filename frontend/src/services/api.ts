// Front-end Service and Local Database engine for Ignite Hoops

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile_picture?: string;
  role: 'player' | 'admin';
}

export interface Team {
  id: string;
  team_name: string;
  logo: string;
  captain_id: string;
  captain_name: string;
  members: string[]; // User IDs
  wins: number;
  losses: number;
  points: number;
}

export interface Tournament {
  id: string;
  title: string;
  sport: 'Basketball' | 'Football' | 'Badminton' | 'Volleyball';
  format: '3v3' | '5v5' | 'Singles' | 'Doubles' | 'Standard';
  entry_fee: number;
  prize_pool: number;
  start_date: string;
  status: 'upcoming' | 'active' | 'completed';
  rules: string[];
  max_teams: number;
  registered_teams: string[]; // Team IDs
}

export interface Match {
  id: string;
  tournament_id: string;
  team1_id: string | null;
  team2_id: string | null;
  score_team1: number;
  score_team2: number;
  winner_id: string | null;
  status: 'scheduled' | 'live' | 'completed';
  round: string; // 'Quarterfinals' | 'Semifinals' | 'Final' etc
  match_number: number;
  next_match_id: string | null;
}

export interface Payment {
  id: string;
  user_id: string;
  user_name: string;
  tournament_id: string;
  tournament_title: string;
  team_id: string;
  team_name: string;
  amount: number;
  screenshot: string; // Base64 or mock URL
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Default Initial Data
const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Ignite Admin',
    email: 'admin@ignitehoops.com',
    phone: '+91 9876543210',
    profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    role: 'admin',
  },
  {
    id: 'user-1',
    name: 'Virat Sharma',
    email: 'virat@example.com',
    phone: '+91 9999888877',
    profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    role: 'player',
  },
  {
    id: 'user-2',
    name: 'Rohit Iyer',
    email: 'rohit@example.com',
    phone: '+91 9888777666',
    profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    role: 'player',
  },
  {
    id: 'user-3',
    name: 'Hardik Gill',
    email: 'hardik@example.com',
    phone: '+91 9777666555',
    profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    role: 'player',
  },
  {
    id: 'user-4',
    name: 'Jasprit Rahul',
    email: 'jasprit@example.com',
    phone: '+91 9666555444',
    profile_picture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    role: 'player',
  },
];

const DEFAULT_TEAMS: Team[] = [
  {
    id: 'team-1',
    team_name: 'Cyber Strikers',
    logo: '🏀',
    captain_id: 'user-1',
    captain_name: 'Virat Sharma',
    members: ['user-1', 'user-2', 'user-3'],
    wins: 8,
    losses: 2,
    points: 24,
  },
  {
    id: 'team-2',
    team_name: 'Neon Warriors',
    logo: '🔥',
    captain_id: 'user-4',
    captain_name: 'Jasprit Rahul',
    members: ['user-4'],
    wins: 6,
    losses: 4,
    points: 18,
  },
  {
    id: 'team-3',
    team_name: 'Shadow Eleven',
    logo: '⚡',
    captain_id: 'user-2',
    captain_name: 'Rohit Iyer',
    members: ['user-2', 'user-3'],
    wins: 5,
    losses: 5,
    points: 15,
  },
  {
    id: 'team-4',
    team_name: 'Vortex Giants',
    logo: '🌪️',
    captain_id: 'user-3',
    captain_name: 'Hardik Gill',
    members: ['user-3', 'user-1'],
    wins: 4,
    losses: 6,
    points: 12,
  },
];

const DEFAULT_TOURNAMENTS: Tournament[] = [
  {
    id: 'tour-1',
    title: 'Ignite Street Classic (5v5)',
    sport: 'Basketball',
    format: '5v5',
    entry_fee: 500,
    prize_pool: 10000,
    start_date: '2026-07-10',
    status: 'upcoming',
    max_teams: 8,
    registered_teams: ['team-1', 'team-2'],
    rules: [
      'Standard 5v5 full-court basketball rules apply.',
      'Four quarters of 8 minutes each.',
      'Teams must check in with screenshot receipts of their slot fee payment.',
      'Umpire/referee calls are final and binding.',
      'Active team jerseys or consistent uniform colors are mandatory.',
    ],
  },
  {
    id: 'tour-2',
    title: 'Ignite Summer Blast (3v3)',
    sport: 'Basketball',
    format: '3v3',
    entry_fee: 300,
    prize_pool: 5000,
    start_date: '2026-06-28',
    status: 'active',
    max_teams: 4,
    registered_teams: ['team-1', 'team-2', 'team-3', 'team-4'],
    rules: [
      'FIBA 3v3 half-court streetball rules apply.',
      'Matches played to 21 points or 10 minutes timer limit.',
      '1 point inside the arc, 2 points from downtown.',
      'Checking the ball is required at the top of the key on all turnovers/dead balls.',
      'No physical fighting allowed. Auto-ejection on technical fouls.',
    ],
  },
  {
    id: 'tour-3',
    title: 'Ignite Autumn 1v1 Showdown',
    sport: 'Basketball',
    format: 'Singles',
    entry_fee: 200,
    prize_pool: 4000,
    start_date: '2026-08-01',
    status: 'upcoming',
    max_teams: 16,
    registered_teams: [],
    rules: [
      '1v1 single elimination showdown.',
      'First to 11 points (clear the ball past the arc on changes of possession).',
      'Matches are self-refereed (gentlemen agreements on foul calls).',
      'Winners advance instantly to the next bracket round.',
    ],
  },
];

const DEFAULT_MATCHES: Match[] = [
  {
    id: 'match-1',
    tournament_id: 'tour-2',
    team1_id: 'team-1',
    team2_id: 'team-3',
    score_team1: 21,
    score_team2: 19,
    winner_id: 'team-1',
    status: 'completed',
    round: 'Semifinals',
    match_number: 1,
    next_match_id: 'match-3',
  },
  {
    id: 'match-2',
    tournament_id: 'tour-2',
    team1_id: 'team-2',
    team2_id: 'team-4',
    score_team1: 15,
    score_team2: 21,
    winner_id: 'team-4',
    status: 'completed',
    round: 'Semifinals',
    match_number: 2,
    next_match_id: 'match-3',
  },
  {
    id: 'match-3',
    tournament_id: 'tour-2',
    team1_id: 'team-1',
    team2_id: 'team-4',
    score_team1: 0,
    score_team2: 0,
    winner_id: null,
    status: 'scheduled',
    round: 'Final',
    match_number: 3,
    next_match_id: null,
  },
];

const DEFAULT_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    user_id: 'user-1',
    user_name: 'Virat Sharma',
    tournament_id: 'tour-1',
    tournament_title: 'Ignite Street Classic (5v5)',
    team_id: 'team-1',
    team_name: 'Cyber Strikers',
    amount: 500,
    screenshot: 'https://images.unsplash.com/photo-1616077168712-fc6c788bc4ee?auto=format&fit=crop&q=80&w=300',
    status: 'approved',
    created_at: '2026-06-18T10:00:00Z',
  },
  {
    id: 'pay-2',
    user_id: 'user-4',
    user_name: 'Jasprit Rahul',
    tournament_id: 'tour-1',
    tournament_title: 'Ignite Street Classic (5v5)',
    team_id: 'team-2',
    team_name: 'Neon Warriors',
    amount: 500,
    screenshot: 'https://images.unsplash.com/photo-1616077168712-fc6c788bc4ee?auto=format&fit=crop&q=80&w=300',
    status: 'pending',
    created_at: '2026-06-20T12:00:00Z',
  },
];

// Initialize Storage with Ignite Hoops keys
const initLocalStorage = () => {
  if (!localStorage.getItem('ignitehoops_users')) {
    localStorage.setItem('ignitehoops_users', JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem('ignitehoops_teams')) {
    localStorage.setItem('ignitehoops_teams', JSON.stringify(DEFAULT_TEAMS));
  }
  if (!localStorage.getItem('ignitehoops_tournaments')) {
    localStorage.setItem('ignitehoops_tournaments', JSON.stringify(DEFAULT_TOURNAMENTS));
  }
  if (!localStorage.getItem('ignitehoops_matches')) {
    localStorage.setItem('ignitehoops_matches', JSON.stringify(DEFAULT_MATCHES));
  }
  if (!localStorage.getItem('ignitehoops_payments')) {
    localStorage.setItem('ignitehoops_payments', JSON.stringify(DEFAULT_PAYMENTS));
  }
};

initLocalStorage();

const getStorageItem = <T>(key: string): T[] => {
  return JSON.parse(localStorage.getItem(key) || '[]');
};

const setStorageItem = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const api = {
  // --- AUTH SERVICES ---
  login: async (email: string, password_unused: string): Promise<{ token: string; user: User }> => {
    await delay();
    const users = getStorageItem<User>('ignitehoops_users');
    const user = users.find((u) => u.email === email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    const token = `dummy-jwt-token-for-${user.id}`;
    return { token, user };
  },

  register: async (name: string, email: string, phone: string, role: 'player' | 'admin' = 'player'): Promise<{ token: string; user: User }> => {
    await delay();
    const users = getStorageItem<User>('ignitehoops_users');
    if (users.some((u) => u.email === email)) {
      throw new Error('Email is already registered.');
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      profile_picture: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      role,
    };
    users.push(newUser);
    setStorageItem('ignitehoops_users', users);
    const token = `dummy-jwt-token-for-${newUser.id}`;
    return { token, user: newUser };
  },

  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    await delay();
    const users = getStorageItem<User>('ignitehoops_users');
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...data };
    setStorageItem('ignitehoops_users', users);
    return users[index];
  },

  // --- TEAM SERVICES ---
  getTeams: async (): Promise<Team[]> => {
    await delay();
    return getStorageItem<Team>('ignitehoops_teams');
  },

  getMyTeams: async (userId: string): Promise<Team[]> => {
    await delay();
    const teams = getStorageItem<Team>('ignitehoops_teams');
    return teams.filter((t) => t.captain_id === userId || t.members.includes(userId));
  },

  createTeam: async (name: string, logoSymbol: string, captainId: string): Promise<Team> => {
    await delay();
    const teams = getStorageItem<Team>('ignitehoops_teams');
    const users = getStorageItem<User>('ignitehoops_users');
    const captain = users.find((u) => u.id === captainId);
    
    if (teams.some((t) => t.team_name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Team name already exists.');
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      team_name: name,
      logo: logoSymbol || '🏀',
      captain_id: captainId,
      captain_name: captain ? captain.name : 'Unknown',
      members: [captainId],
      wins: 0,
      losses: 0,
      points: 0,
    };
    teams.push(newTeam);
    setStorageItem('ignitehoops_teams', teams);
    return newTeam;
  },

  invitePlayer: async (teamId: string, email: string): Promise<Team> => {
    await delay();
    const teams = getStorageItem<Team>('ignitehoops_teams');
    const users = getStorageItem<User>('ignitehoops_users');
    
    const userToInvite = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!userToInvite) {
      throw new Error('Player not found with this email.');
    }

    const teamIndex = teams.findIndex((t) => t.id === teamId);
    if (teamIndex === -1) throw new Error('Team not found');

    const team = teams[teamIndex];
    if (team.members.includes(userToInvite.id)) {
      throw new Error('Player is already a member of this team.');
    }

    team.members.push(userToInvite.id);
    teams[teamIndex] = team;
    setStorageItem('ignitehoops_teams', teams);
    return team;
  },

  removePlayer: async (teamId: string, userId: string): Promise<Team> => {
    await delay();
    const teams = getStorageItem<Team>('ignitehoops_teams');
    const teamIndex = teams.findIndex((t) => t.id === teamId);
    if (teamIndex === -1) throw new Error('Team not found');

    const team = teams[teamIndex];
    if (team.captain_id === userId) {
      throw new Error('Cannot remove the Captain. Reassign captaincy first.');
    }

    team.members = team.members.filter((m) => m !== userId);
    teams[teamIndex] = team;
    setStorageItem('ignitehoops_teams', teams);
    return team;
  },

  // --- TOURNAMENT SERVICES ---
  getTournaments: async (): Promise<Tournament[]> => {
    await delay();
    return getStorageItem<Tournament>('ignitehoops_tournaments');
  },

  getTournamentDetails: async (tourId: string): Promise<{ tournament: Tournament; matches: Match[]; teams: Team[] }> => {
    await delay();
    const tournaments = getStorageItem<Tournament>('ignitehoops_tournaments');
    const matches = getStorageItem<Match>('ignitehoops_matches');
    const teams = getStorageItem<Team>('ignitehoops_teams');

    const tournament = tournaments.find((t) => t.id === tourId);
    if (!tournament) throw new Error('Tournament not found');

    const tourMatches = matches.filter((m) => m.tournament_id === tourId);
    const tourTeams = teams.filter((t) => tournament.registered_teams.includes(t.id));

    return { tournament, matches: tourMatches, teams: tourTeams };
  },

  registerForTournament: async (tourId: string, teamId: string, userId: string, paymentProofUrl: string): Promise<Payment> => {
    await delay();
    const tournaments = getStorageItem<Tournament>('ignitehoops_tournaments');
    const teams = getStorageItem<Team>('ignitehoops_teams');
    const users = getStorageItem<User>('ignitehoops_users');
    const payments = getStorageItem<Payment>('ignitehoops_payments');

    const tourIndex = tournaments.findIndex((t) => t.id === tourId);
    if (tourIndex === -1) throw new Error('Tournament not found');
    const tour = tournaments[tourIndex];

    if (tour.registered_teams.includes(teamId)) {
      throw new Error('Team is already registered or registration is pending.');
    }

    const team = teams.find((t) => t.id === teamId);
    if (!team) throw new Error('Team not found');

    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      user_id: userId,
      user_name: user.name,
      tournament_id: tourId,
      tournament_title: tour.title,
      team_id: teamId,
      team_name: team.team_name,
      amount: tour.entry_fee,
      screenshot: paymentProofUrl || 'https://images.unsplash.com/photo-1616077168712-fc6c788bc4ee?auto=format&fit=crop&q=80&w=300',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    payments.push(newPayment);
    setStorageItem('ignitehoops_payments', payments);

    return newPayment;
  },

  // --- ADMIN SERVICES ---
  adminCreateTournament: async (data: Omit<Tournament, 'id' | 'registered_teams' | 'status'>): Promise<Tournament> => {
    await delay();
    const tournaments = getStorageItem<Tournament>('ignitehoops_tournaments');
    const newTour: Tournament = {
      ...data,
      id: `tour-${Date.now()}`,
      registered_teams: [],
      status: 'upcoming',
    };
    tournaments.push(newTour);
    setStorageItem('ignitehoops_tournaments', tournaments);
    return newTour;
  },

  adminGetPendingPayments: async (): Promise<Payment[]> => {
    await delay();
    const payments = getStorageItem<Payment>('ignitehoops_payments');
    return payments.filter((p) => p.status === 'pending');
  },

  adminGetAllPayments: async (): Promise<Payment[]> => {
    await delay();
    return getStorageItem<Payment>('ignitehoops_payments');
  },

  adminApprovePayment: async (paymentId: string, action: 'approved' | 'rejected'): Promise<Payment> => {
    await delay();
    const payments = getStorageItem<Payment>('ignitehoops_payments');
    const tournaments = getStorageItem<Tournament>('ignitehoops_tournaments');

    const payIndex = payments.findIndex((p) => p.id === paymentId);
    if (payIndex === -1) throw new Error('Payment records not found');

    const payment = payments[payIndex];
    payment.status = action;
    payments[payIndex] = payment;
    setStorageItem('ignitehoops_payments', payments);

    if (action === 'approved') {
      const tourIndex = tournaments.findIndex((t) => t.id === payment.tournament_id);
      if (tourIndex !== -1) {
        const tour = tournaments[tourIndex];
        if (!tour.registered_teams.includes(payment.team_id)) {
          tour.registered_teams.push(payment.team_id);
          tournaments[tourIndex] = tour;
          setStorageItem('ignitehoops_tournaments', tournaments);
        }
      }
    }

    return payment;
  },

  adminGenerateBracket: async (tourId: string): Promise<Match[]> => {
    await delay();
    const tournaments = getStorageItem<Tournament>('ignitehoops_tournaments');
    const matches = getStorageItem<Match>('ignitehoops_matches');

    const tourIndex = tournaments.findIndex((t) => t.id === tourId);
    if (tourIndex === -1) throw new Error('Tournament not found');
    const tour = tournaments[tourIndex];

    const teamIds = tour.registered_teams;
    if (teamIds.length < 2) {
      throw new Error('Tournament needs at least 2 registered teams to generate a bracket.');
    }

    let bracketSize = 2;
    if (teamIds.length > 4) {
      bracketSize = 8;
    } else if (teamIds.length > 2) {
      bracketSize = 4;
    }

    let cleanMatches = matches.filter((m) => m.tournament_id !== tourId);
    const tourMatches: Match[] = [];
    
    if (bracketSize === 4) {
      const finalId = `match-${tourId}-final`;
      const semi1Id = `match-${tourId}-semi1`;
      const semi2Id = `match-${tourId}-semi2`;

      const t1 = teamIds[0] || null;
      const t2 = teamIds[1] || null;
      const t3 = teamIds[2] || null;
      const t4 = teamIds[3] || null;

      tourMatches.push({
        id: semi1Id,
        tournament_id: tourId,
        team1_id: t1,
        team2_id: t2,
        score_team1: 0,
        score_team2: 0,
        winner_id: null,
        status: 'scheduled',
        round: 'Semifinals',
        match_number: 1,
        next_match_id: finalId,
      });

      tourMatches.push({
        id: semi2Id,
        tournament_id: tourId,
        team1_id: t3,
        team2_id: t4,
        score_team1: 0,
        score_team2: 0,
        winner_id: null,
        status: 'scheduled',
        round: 'Semifinals',
        match_number: 2,
        next_match_id: finalId,
      });

      tourMatches.push({
        id: finalId,
        tournament_id: tourId,
        team1_id: null,
        team2_id: null,
        score_team1: 0,
        score_team2: 0,
        winner_id: null,
        status: 'scheduled',
        round: 'Final',
        match_number: 3,
        next_match_id: null,
      });
    } else if (bracketSize === 8) {
      const finalId = `match-${tourId}-final`;
      const semi1Id = `match-${tourId}-semi1`;
      const semi2Id = `match-${tourId}-semi2`;
      
      const q1Id = `match-${tourId}-q1`;
      const q2Id = `match-${tourId}-q2`;
      const q3Id = `match-${tourId}-q3`;
      const q4Id = `match-${tourId}-q4`;

      tourMatches.push({ id: q1Id, tournament_id: tourId, team1_id: teamIds[0] || null, team2_id: teamIds[1] || null, score_team1: 0, score_team2: 0, winner_id: null, status: 'scheduled', round: 'Quarterfinals', match_number: 1, next_match_id: semi1Id });
      tourMatches.push({ id: q2Id, tournament_id: tourId, team1_id: teamIds[2] || null, team2_id: teamIds[3] || null, score_team1: 0, score_team2: 0, winner_id: null, status: 'scheduled', round: 'Quarterfinals', match_number: 2, next_match_id: semi1Id });
      tourMatches.push({ id: q3Id, tournament_id: tourId, team1_id: teamIds[4] || null, team2_id: teamIds[5] || null, score_team1: 0, score_team2: 0, winner_id: null, status: 'scheduled', round: 'Quarterfinals', match_number: 3, next_match_id: semi2Id });
      tourMatches.push({ id: q4Id, tournament_id: tourId, team1_id: teamIds[6] || null, team2_id: teamIds[7] || null, score_team1: 0, score_team2: 0, winner_id: null, status: 'scheduled', round: 'Quarterfinals', match_number: 4, next_match_id: semi2Id });

      tourMatches.push({ id: semi1Id, tournament_id: tourId, team1_id: null, team2_id: null, score_team1: 0, score_team2: 0, winner_id: null, status: 'scheduled', round: 'Semifinals', match_number: 5, next_match_id: finalId });
      tourMatches.push({ id: semi2Id, tournament_id: tourId, team1_id: null, team2_id: null, score_team1: 0, score_team2: 0, winner_id: null, status: 'scheduled', round: 'Semifinals', match_number: 6, next_match_id: finalId });

      tourMatches.push({ id: finalId, tournament_id: tourId, team1_id: null, team2_id: null, score_team1: 0, score_team2: 0, winner_id: null, status: 'scheduled', round: 'Final', match_number: 7, next_match_id: null });
    } else {
      const finalId = `match-${tourId}-final`;
      tourMatches.push({
        id: finalId,
        tournament_id: tourId,
        team1_id: teamIds[0] || null,
        team2_id: teamIds[1] || null,
        score_team1: 0,
        score_team2: 0,
        winner_id: null,
        status: 'scheduled',
        round: 'Final',
        match_number: 1,
        next_match_id: null,
      });
    }

    tour.status = 'active';
    tournaments[tourIndex] = tour;
    setStorageItem('ignitehoops_tournaments', tournaments);

    cleanMatches = [...cleanMatches, ...tourMatches];
    setStorageItem('ignitehoops_matches', cleanMatches);

    return tourMatches;
  },

  adminUpdateMatchScore: async (matchId: string, score1: number, score2: number, status: 'scheduled' | 'live' | 'completed'): Promise<Match> => {
    await delay();
    const matches = getStorageItem<Match>('ignitehoops_matches');
    const teams = getStorageItem<Team>('ignitehoops_teams');

    const matchIndex = matches.findIndex((m) => m.id === matchId);
    if (matchIndex === -1) throw new Error('Match not found');
    const match = matches[matchIndex];

    match.score_team1 = score1;
    match.score_team2 = score2;
    match.status = status;

    if (status === 'completed') {
      if (score1 > score2) {
        match.winner_id = match.team1_id;
      } else if (score2 > score1) {
        match.winner_id = match.team2_id;
      } else {
        match.winner_id = match.team1_id;
      }

      if (match.winner_id) {
        const winnerIndex = teams.findIndex((t) => t.id === match.winner_id);
        const loserId = match.winner_id === match.team1_id ? match.team2_id : match.team1_id;
        const loserIndex = teams.findIndex((t) => t.id === loserId);

        if (winnerIndex !== -1) {
          teams[winnerIndex].wins += 1;
          teams[winnerIndex].points += 3;
        }
        if (loserIndex !== -1) {
          teams[loserIndex].losses += 1;
        }
        setStorageItem('ignitehoops_teams', teams);
      }

      if (match.next_match_id && match.winner_id) {
        const nextIndex = matches.findIndex((m) => m.id === match.next_match_id);
        if (nextIndex !== -1) {
          const nextMatch = matches[nextIndex];
          if (!nextMatch.team1_id) {
            nextMatch.team1_id = match.winner_id;
          } else if (!nextMatch.team2_id && nextMatch.team1_id !== match.winner_id) {
            nextMatch.team2_id = match.winner_id;
          }
          matches[nextIndex] = nextMatch;
        }
      }

      if (match.round === 'Final') {
        const tournaments = getStorageItem<Tournament>('ignitehoops_tournaments');
        const tourIndex = tournaments.findIndex((t) => t.id === match.tournament_id);
        if (tourIndex !== -1) {
          tournaments[tourIndex].status = 'completed';
          setStorageItem('ignitehoops_tournaments', tournaments);
        }
      }
    }

    matches[matchIndex] = match;
    setStorageItem('ignitehoops_matches', matches);
    return match;
  },
};
