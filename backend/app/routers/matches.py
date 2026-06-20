from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core import auth
from ..models import models
from ..schemas import schemas

router = APIRouter(prefix="/api/matches", tags=["matches"])

@router.put("/{match_id}/score", response_model=schemas.MatchResponse)
def update_match_score(
    match_id: str,
    match_in: schemas.MatchUpdate,
    current_admin: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(get_db)
):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    match.score_team1 = match_in.score_team1
    match.score_team2 = match_in.score_team2
    match.status = match_in.status
    
    if match_in.status == "completed":
        # Determine winner
        if match_in.score_team1 > match_in.score_team2:
            match.winner_id = match.team1_id
        elif match_in.score_team2 > match_in.score_team1:
            match.winner_id = match.team2_id
        else:
            match.winner_id = match.team1_id # Simple fallback tiebreaker
            
        # Update team wins/losses/points stats
        if match.winner_id:
            winner = db.query(models.Team).filter(models.Team.id == match.winner_id).first()
            if winner:
                winner.wins += 1
                winner.points += 3
                
            loser_id = match.team2_id if match.winner_id == match.team1_id else match.team1_id
            if loser_id:
                loser = db.query(models.Team).filter(models.Team.id == loser_id).first()
                if loser:
                    loser.losses += 1
                    
        # Advance winner to next round match
        if match.next_match_id and match.winner_id:
            next_match = db.query(models.Match).filter(models.Match.id == match.next_match_id).first()
            if next_match:
                if not next_match.team1_id:
                    next_match.team1_id = match.winner_id
                elif not next_match.team2_id and next_match.team1_id != match.winner_id:
                    next_match.team2_id = match.winner_id
                    
        # If Final round is completed, mark tournament as completed
        if match.round == "Final":
            tournament = db.query(models.Tournament).filter(models.Tournament.id == match.tournament_id).first()
            if tournament:
                tournament.status = "completed"
                
    db.commit()
    db.refresh(match)
    return match
