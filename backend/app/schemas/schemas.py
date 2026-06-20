from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- AUTH SCHEMAS ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    profile_picture: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "player"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    role: str

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    profile_picture: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

# --- TEAM SCHEMAS ---
class TeamBase(BaseModel):
    team_name: str
    logo: Optional[str] = "🛡️"

class TeamCreate(TeamBase):
    pass

class TeamResponse(TeamBase):
    id: str
    captain_id: str
    wins: int
    losses: int
    points: int
    members: List[str] = []

    class Config:
        from_attributes = True

class TeamInvite(BaseModel):
    email: EmailStr

# --- TOURNAMENT SCHEMAS ---
class TournamentBase(BaseModel):
    title: str
    sport: str
    format: str
    entry_fee: float
    prize_pool: float
    start_date: str
    max_teams: int
    rules: List[str] = []

class TournamentCreate(TournamentBase):
    pass

class TournamentResponse(TournamentBase):
    id: str
    status: str
    registered_teams: List[str] = []

    class Config:
        from_attributes = True

# --- MATCH SCHEMAS ---
class MatchBase(BaseModel):
    score_team1: int
    score_team2: int
    status: str # scheduled, live, completed

class MatchUpdate(MatchBase):
    pass

class MatchResponse(BaseModel):
    id: str
    tournament_id: str
    team1_id: Optional[str] = None
    team2_id: Optional[str] = None
    score_team1: int
    score_team2: int
    winner_id: Optional[str] = None
    status: str
    round: str
    match_number: int
    next_match_id: Optional[str] = None

    class Config:
        from_attributes = True

# --- PAYMENT SCHEMAS ---
class PaymentBase(BaseModel):
    tournament_id: str
    team_id: str
    amount: float
    screenshot: str

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(BaseModel):
    id: str
    user_id: str
    tournament_id: str
    team_id: str
    amount: float
    screenshot: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentVerify(BaseModel):
    action: str # approved or rejected
