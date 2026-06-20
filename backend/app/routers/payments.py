from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from ..core.database import get_db
from ..core import auth
from ..models import models
from ..schemas import schemas

router = APIRouter(prefix="/api/payments", tags=["payments"])

@router.post("", response_model=schemas.PaymentResponse)
def create_payment(
    payment_in: schemas.PaymentCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Check if team is already registered
    tournament = db.query(models.Tournament).filter(models.Tournament.id == payment_in.tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
        
    if payment_in.team_id in tournament.registered_teams:
        raise HTTPException(status_code=400, detail="Team is already registered for this tournament.")
        
    new_payment = models.Payment(
        id=f"pay-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id,
        tournament_id=payment_in.tournament_id,
        team_id=payment_in.team_id,
        amount=payment_in.amount,
        screenshot=payment_in.screenshot,
        status="pending"
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment

@router.get("", response_model=List[schemas.PaymentResponse])
def get_all_payments(
    current_admin: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Payment).all()

@router.get("/pending", response_model=List[schemas.PaymentResponse])
def get_pending_payments(
    current_admin: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Payment).filter(models.Payment.status == "pending").all()

@router.put("/{payment_id}/verify", response_model=schemas.PaymentResponse)
def verify_payment(
    payment_id: str,
    verify_in: schemas.PaymentVerify,
    current_admin: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(get_db)
):
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
        
    payment.status = verify_in.action
    
    if verify_in.action == "approved":
        # Add team to registered teams in tournament
        tournament = db.query(models.Tournament).filter(models.Tournament.id == payment.tournament_id).first()
        if tournament:
            registered = list(tournament.registered_teams)
            if payment.team_id not in registered:
                registered.append(payment.team_id)
                tournament.registered_teams = registered
                
    db.commit()
    db.refresh(payment)
    return payment
