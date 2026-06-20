from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
import datetime
from ..core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    profile_picture = Column(String, nullable=True)
    role = Column(String, default="player") # "player" or "admin"

    # Relationships
    captain_teams = relationship("Team", back_populates="captain")

class Team(Base):
    __tablename__ = "teams"

    id = Column(String, primary_key=True, index=True)
    team_name = Column(String, unique=True, index=True, nullable=False)
    logo = Column(String, default="🛡️")
    captain_id = Column(String, ForeignKey("users.id"))
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    points = Column(Integer, default=0)

    # Relationships
    captain = relationship("User", back_populates="captain_teams")

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    sport = Column(String, nullable=False) # Cricket, Football, Badminton etc
    format = Column(String, nullable=False) # 3v3, 5v5, Singles
    entry_fee = Column(Float, default=0.0)
    prize_pool = Column(Float, default=0.0)
    start_date = Column(String, nullable=False)
    status = Column(String, default="upcoming") # upcoming, active, completed
    max_teams = Column(Integer, default=8)
    rules = Column(JSON, default=[]) # List of rules strings
    registered_teams = Column(JSON, default=[]) # List of team IDs

class Match(Base):
    __tablename__ = "matches"

    id = Column(String, primary_key=True, index=True)
    tournament_id = Column(String, ForeignKey("tournaments.id"), nullable=False)
    team1_id = Column(String, ForeignKey("teams.id"), nullable=True)
    team2_id = Column(String, ForeignKey("teams.id"), nullable=True)
    score_team1 = Column(Integer, default=0)
    score_team2 = Column(Integer, default=0)
    winner_id = Column(String, ForeignKey("teams.id"), nullable=True)
    status = Column(String, default="scheduled") # scheduled, live, completed
    round = Column(String, nullable=False) # Quarterfinals, Semifinals, Final
    match_number = Column(Integer, nullable=False)
    next_match_id = Column(String, ForeignKey("matches.id"), nullable=True)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    tournament_id = Column(String, ForeignKey("tournaments.id"), nullable=False)
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    amount = Column(Float, nullable=False)
    screenshot = Column(String, nullable=False) # Base64 or image URL
    status = Column(String, default="pending") # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
