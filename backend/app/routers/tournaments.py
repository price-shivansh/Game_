from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from ..core.database import get_db
from ..core import auth
from ..models import models
from ..schemas import schemas

router = APIRouter(prefix="/api/tournaments", tags=["tournaments"])

@router.get("", response_model=List[schemas.TournamentResponse])
def list_tournaments(db: Session = Depends(get_db)):
    return db.query(models.Tournament).all()

@router.get("/{tour_id}")
def get_tournament_details(tour_id: str, db: Session = Depends(get_db)):
    tournament = db.query(models.Tournament).filter(models.Tournament.id == tour_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
        
    matches = db.query(models.Match).filter(models.Match.tournament_id == tour_id).all()
    
    # Retrieve registered teams
    teams = db.query(models.Team).filter(models.Team.id.in_(tournament.registered_teams)).all()
    
    # Convert team members to IDs list for schemas structure
    serialized_teams = []
    for team in teams:
        members = db.query(models.TeamMember.user_id).filter(models.TeamMember.team_id == team.id).all()
        member_ids = [m[0] for m in members]
        serialized_teams.append({
            "id": team.id,
            "team_name": team.team_name,
            "logo": team.logo,
            "captain_id": team.captain_id,
            "wins": team.wins,
            "losses": team.losses,
            "points": team.points,
            "members": member_ids
        })
        
    return {
        "tournament": tournament,
        "matches": matches,
        "teams": serialized_teams
    }

@router.post("", response_model=schemas.TournamentResponse)
def create_tournament(
    tour_in: schemas.TournamentCreate,
    current_admin: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(get_db)
):
    new_tour = models.Tournament(
        id=f"tour-{uuid.uuid4().hex[:8]}",
        title=tour_in.title,
        sport=tour_in.sport,
        format=tour_in.format,
        entry_fee=tour_in.entry_fee,
        prize_pool=tour_in.prize_pool,
        start_date=tour_in.start_date,
        max_teams=tour_in.max_teams,
        rules=tour_in.rules,
        status="upcoming",
        registered_teams=[]
    )
    db.add(new_tour)
    db.commit()
    db.refresh(new_tour)
    return new_tour

@router.post("/{tour_id}/bracket", response_model=List[schemas.MatchResponse])
def generate_bracket(
    tour_id: str,
    current_admin: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(get_db)
):
    tournament = db.query(models.Tournament).filter(models.Tournament.id == tour_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
        
    team_ids = tournament.registered_teams
    if len(team_ids) < 2:
        raise HTTPException(status_code=400, detail="Tournament needs at least 2 registered teams to generate a bracket.")
        
    # Single-elimination sizing
    bracket_size = 2
    if len(team_ids) > 4:
        bracket_size = 8
    elif len(team_ids) > 2:
        bracket_size = 4
        
    # Delete existing matches for tournament
    db.query(models.Match).filter(models.Match.tournament_id == tour_id).delete()
    
    tour_matches = []
    
    if bracket_size == 4:
        final_id = f"match-{tour_id}-final"
        semi1_id = f"match-{tour_id}-semi1"
        semi2_id = f"match-{tour_id}-semi2"
        
        tour_matches.append(models.Match(
            id=semi1_id, tournament_id=tour_id, team1_id=team_ids[0], team2_id=team_ids[1],
            score_team1=0, score_team2=0, winner_id=None, status="scheduled",
            round="Semifinals", match_number=1, next_match_id=final_id
        ))
        
        t3 = team_ids[2] if len(team_ids) > 2 else None
        t4 = team_ids[3] if len(team_ids) > 3 else None
        
        tour_matches.append(models.Match(
            id=semi2_id, tournament_id=tour_id, team1_id=t3, team2_id=t4,
            score_team1=0, score_team2=0, winner_id=None, status="scheduled",
            round="Semifinals", match_number=2, next_match_id=final_id
        ))
        
        tour_matches.append(models.Match(
            id=final_id, tournament_id=tour_id, team1_id=None, team2_id=None,
            score_team1=0, score_team2=0, winner_id=None, status="scheduled",
            round="Final", match_number=3, next_match_id=None
        ))
    elif bracket_size == 8:
        final_id = f"match-{tour_id}-final"
        semi1_id = f"match-{tour_id}-semi1"
        semi2_id = f"match-{tour_id}-semi2"
        
        q1_id = f"match-{tour_id}-q1"
        q2_id = f"match-{tour_id}-q2"
        q3_id = f"match-{tour_id}-q3"
        q4_id = f"match-{tour_id}-q4"
        
        # Quarterfinals
        tour_matches.append(models.Match(id=q1_id, tournament_id=tour_id, team1_id=team_ids[0], team2_id=team_ids[1], score_team1=0, score_team2=0, winner_id=None, status="scheduled", round="Quarterfinals", match_number=1, next_match_id=semi1_id))
        tour_matches.append(models.Match(id=q2_id, tournament_id=tour_id, team1_id=team_ids[2] if len(team_ids)>2 else None, team2_id=team_ids[3] if len(team_ids)>3 else None, score_team1=0, score_team2=0, winner_id=None, status="scheduled", round="Quarterfinals", match_number=2, next_match_id=semi1_id))
        tour_matches.append(models.Match(id=q3_id, tournament_id=tour_id, team1_id=team_ids[4] if len(team_ids)>4 else None, team2_id=team_ids[5] if len(team_ids)>5 else None, score_team1=0, score_team2=0, winner_id=None, status="scheduled", round="Quarterfinals", match_number=3, next_match_id=semi2_id))
        tour_matches.append(models.Match(id=q4_id, tournament_id=tour_id, team1_id=team_ids[6] if len(team_ids)>6 else None, team2_id=team_ids[7] if len(team_ids)>7 else None, score_team1=0, score_team2=0, winner_id=None, status="scheduled", round="Quarterfinals", match_number=4, next_match_id=semi2_id))
        
        # Semifinals
        tour_matches.append(models.Match(id=semi1_id, tournament_id=tour_id, team1_id=None, team2_id=None, score_team1=0, score_team2=0, winner_id=None, status="scheduled", round="Semifinals", match_number=5, next_match_id=final_id))
        tour_matches.append(models.Match(id=semi2_id, tournament_id=tour_id, team1_id=None, team2_id=None, score_team1=0, score_team2=0, winner_id=None, status="scheduled", round="Semifinals", match_number=6, next_match_id=final_id))
        
        # Final
        tour_matches.append(models.Match(id=final_id, tournament_id=tour_id, team1_id=None, team2_id=None, score_team1=0, score_team2=0, winner_id=None, status="scheduled", round="Final", match_number=7, next_match_id=None))
    else:
        final_id = f"match-{tour_id}-final"
        tour_matches.append(models.Match(
            id=final_id, tournament_id=tour_id, team1_id=team_ids[0], team2_id=team_ids[1],
            score_team1=0, score_team2=0, winner_id=None, status="scheduled",
            round="Final", match_number=1, next_match_id=None
        ))
        
    for m in tour_matches:
        db.add(m)
        
    tournament.status = "active"
    db.commit()
    
    return db.query(models.Match).filter(models.Match.tournament_id == tour_id).all()
