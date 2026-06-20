from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from ..core.database import get_db
from ..core import auth
from ..models import models
from ..schemas import schemas

router = APIRouter(prefix="/api/teams", tags=["teams"])

@router.get("", response_model=List[schemas.TeamResponse])
def list_teams(db: Session = Depends(get_db)):
    teams = db.query(models.Team).all()
    result = []
    for team in teams:
        members = db.query(models.TeamMember.user_id).filter(models.TeamMember.team_id == team.id).all()
        member_ids = [m[0] for m in members]
        result.append(schemas.TeamResponse(
            id=team.id,
            team_name=team.team_name,
            logo=team.logo,
            captain_id=team.captain_id,
            wins=team.wins,
            losses=team.losses,
            points=team.points,
            members=member_ids
        ))
    return result

@router.get("/my", response_model=List[schemas.TeamResponse])
def list_my_teams(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch team IDs where current user is a member or captain
    member_teams = db.query(models.TeamMember.team_id).filter(models.TeamMember.user_id == current_user.id).all()
    team_ids = [t[0] for t in member_teams]
    
    teams = db.query(models.Team).filter(
        (models.Team.id.in_(team_ids)) | (models.Team.captain_id == current_user.id)
    ).all()
    
    result = []
    for team in teams:
        members = db.query(models.TeamMember.user_id).filter(models.TeamMember.team_id == team.id).all()
        member_ids = [m[0] for m in members]
        result.append(schemas.TeamResponse(
            id=team.id,
            team_name=team.team_name,
            logo=team.logo,
            captain_id=team.captain_id,
            wins=team.wins,
            losses=team.losses,
            points=team.points,
            members=member_ids
        ))
    return result

@router.post("", response_model=schemas.TeamResponse)
def create_team(
    team_in: schemas.TeamCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_team = db.query(models.Team).filter(models.Team.team_name == team_in.team_name).first()
    if db_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team name already exists."
        )
        
    new_team = models.Team(
        id=f"team-{uuid.uuid4().hex[:8]}",
        team_name=team_in.team_name,
        logo=team_in.logo or "🛡️",
        captain_id=current_user.id,
        wins=0,
        losses=0,
        points=0
    )
    db.add(new_team)
    
    # Captain is automatically a member
    new_member = models.TeamMember(
        id=f"member-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id,
        team_id=new_team.id
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_team)
    
    return schemas.TeamResponse(
        id=new_team.id,
        team_name=new_team.team_name,
        logo=new_team.logo,
        captain_id=new_team.captain_id,
        wins=new_team.wins,
        losses=new_team.losses,
        points=new_team.points,
        members=[current_user.id]
    )

@router.post("/{team_id}/invite", response_model=schemas.TeamResponse)
def invite_player(
    team_id: str,
    invite_in: schemas.TeamInvite,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    if team.captain_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only team captain can invite players")
        
    invited_user = db.query(models.User).filter(models.User.email == invite_in.email).first()
    if not invited_user:
        raise HTTPException(status_code=404, detail="Player not found with this email.")
        
    already_member = db.query(models.TeamMember).filter(
        models.TeamMember.team_id == team_id,
        models.TeamMember.user_id == invited_user.id
    ).first()
    
    if already_member:
        raise HTTPException(status_code=400, detail="Player is already a member of this team.")
        
    new_member = models.TeamMember(
        id=f"member-{uuid.uuid4().hex[:8]}",
        user_id=invited_user.id,
        team_id=team_id
    )
    db.add(new_member)
    db.commit()
    
    members = db.query(models.TeamMember.user_id).filter(models.TeamMember.team_id == team_id).all()
    member_ids = [m[0] for m in members]
    
    return schemas.TeamResponse(
        id=team.id,
        team_name=team.team_name,
        logo=team.logo,
        captain_id=team.captain_id,
        wins=team.wins,
        losses=team.losses,
        points=team.points,
        members=member_ids
    )

@router.delete("/{team_id}/remove/{member_id}", response_model=schemas.TeamResponse)
def remove_player(
    team_id: str,
    member_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    if team.captain_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only team captain can remove players")
        
    if team.captain_id == member_id:
        raise HTTPException(status_code=400, detail="Cannot remove captain. Reassign captaincy first.")
        
    db_member = db.query(models.TeamMember).filter(
        models.TeamMember.team_id == team_id,
        models.TeamMember.user_id == member_id
    ).first()
    
    if not db_member:
        raise HTTPException(status_code=404, detail="Player is not a member of this team.")
        
    db.delete(db_member)
    db.commit()
    
    members = db.query(models.TeamMember.user_id).filter(models.TeamMember.team_id == team_id).all()
    member_ids = [m[0] for m in members]
    
    return schemas.TeamResponse(
        id=team.id,
        team_name=team.team_name,
        logo=team.logo,
        captain_id=team.captain_id,
        wins=team.wins,
        losses=team.losses,
        points=team.points,
        members=member_ids
    )
