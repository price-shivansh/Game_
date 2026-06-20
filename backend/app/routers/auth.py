from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
from ..core.database import get_db
from ..core import auth
from ..models import models
from ..schemas import schemas

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists."
        )
    
    hashed_password = auth.get_password_hash(user_in.password)
    new_user = models.User(
        id=f"user-{uuid.uuid4().hex[:8]}",
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=hashed_password,
        profile_picture=user_in.profile_picture or f"https://api.dicebear.com/7.x/adventurer/svg?seed={user_in.name}",
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(login_in: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == login_in.email).first()
    if not db_user or not auth.verify_password(login_in.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
        
    access_token = auth.create_access_token(data={"sub": db_user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "phone": db_user.phone,
            "profile_picture": db_user.profile_picture,
            "role": db_user.role
        }
    }

@router.put("/profile", response_model=schemas.UserResponse)
def update_profile(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.phone is not None:
        current_user.phone = user_update.phone
    if user_update.profile_picture is not None:
        current_user.profile_picture = user_update.profile_picture
        
    db.commit()
    db.refresh(current_user)
    return current_user
