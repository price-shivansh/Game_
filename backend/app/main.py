from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine, SessionLocal, Base
from .routers import auth, teams, tournaments, matches, payments
from .models import models
from .core.auth import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Ignite Hoops API",
    description="Backend API for Ignite Hoops street basketball platform",
    version="1.0.0"
)

# CORS Policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(teams.router)
app.include_router(tournaments.router)
app.include_router(matches.router)
app.include_router(payments.router)

# Seed Initial Mock Data if DB is empty
def seed_initial_data():
    db = SessionLocal()
    try:
        if db.query(models.User).count() == 0:
            # Seed Users
            admin_user = models.User(
                id="user-admin",
                name="Ignite Admin",
                email="admin@ignitehoops.com",
                phone="+91 9876543210",
                hashed_password=get_password_hash("admin123"),
                profile_picture="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
                role="admin"
            )
            player_user1 = models.User(
                id="user-1",
                name="Virat Sharma",
                email="virat@example.com",
                phone="+91 9999888877",
                hashed_password=get_password_hash("player123"),
                profile_picture="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
                role="player"
            )
            player_user2 = models.User(
                id="user-2",
                name="Rohit Iyer",
                email="rohit@example.com",
                phone="+91 9888777666",
                hashed_password=get_password_hash("player123"),
                profile_picture="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
                role="player"
            )
            db.add_all([admin_user, player_user1, player_user2])
            db.commit()

            # Seed Teams
            team1 = models.Team(
                id="team-1",
                team_name="Cyber Strikers",
                logo="🏀",
                captain_id="user-1",
                wins=4,
                losses=1,
                points=12
            )
            team2 = models.Team(
                id="team-2",
                team_name="Neon Warriors",
                logo="🔥",
                captain_id="user-2",
                wins=2,
                losses=3,
                points=6
            )
            db.add_all([team1, team2])
            db.commit()

            # Seed TeamMembers
            db.add_all([
                models.TeamMember(id="m1", user_id="user-1", team_id="team-1"),
                models.TeamMember(id="m2", user_id="user-2", team_id="team-2"),
            ])
            db.commit()

            # Seed Tournaments
            tour1 = models.Tournament(
                id="tour-1",
                title="Ignite Street Classic (5v5)",
                sport="Basketball",
                format="5v5",
                entry_fee=500.0,
                prize_pool=10000.0,
                start_date="2026-07-10",
                status="upcoming",
                max_teams=8,
                rules=[
                    "Standard 5v5 full-court basketball rules apply.",
                    "Four quarters of 8 minutes each.",
                    "Teams must check in with screenshot receipts.",
                    "Decision of the umpire/referee is final."
                ],
                registered_teams=["team-1"]
            )
            tour2 = models.Tournament(
                id="tour-2",
                title="Ignite Summer Blast (3v3)",
                sport="Basketball",
                format="3v3",
                entry_fee=300.0,
                prize_pool=5000.0,
                start_date="2026-06-28",
                status="active",
                max_teams=4,
                rules=[
                    "FIBA 3v3 half-court streetball rules apply.",
                    "Matches played to 21 points or 10 minutes limit.",
                    "Checking the ball required at the top of the key."
                ],
                registered_teams=["team-1", "team-2"]
            )
            db.add_all([tour1, tour2])
            db.commit()

            # Seed Matches
            match1 = models.Match(
                id="match-tour2-final",
                tournament_id="tour-2",
                team1_id="team-1",
                team2_id="team-2",
                score_team1=0,
                score_team2=0,
                winner_id=None,
                status="scheduled",
                round="Final",
                match_number=1,
                next_match_id=None
            )
            db.add(match1)
            db.commit()

    finally:
        db.close()

seed_initial_data()

@app.get("/")
def read_root():
    return {"message": "Welcome to Ignite Hoops API Server"}
