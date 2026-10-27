import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from jose import jwt

from app.database import get_db
from app.models.models import User, Institution
from app.schemas.schemas import TokenResponse, UserLogin, UserOut
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    raw_ident = payload.email.strip()
    clean_ident = raw_ident.lower()

    # Rule: official mail ending with @aicte.india.org, @aicte-india.org, or containing @aicte automatically logs in as Admin
    is_official_admin = clean_ident.endswith("@aicte.india.org") or clean_ident.endswith("@aicte-india.org") or "@aicte" in clean_ident

    user = db.query(User).filter(User.email.ilike(raw_ident)).first()
    if not user:
        inst = db.query(Institution).filter(Institution.aicte_id.ilike(raw_ident)).first()
        if inst:
            user = db.query(User).filter(User.institution_id == inst.id).first()

    # If user not found in DB yet, dynamically register/map them based on domain
    if not user:
        if is_official_admin:
            # Create/map official AICTE Admin
            admin_name = raw_ident.split("@")[0].replace(".", " ").title() + " (AICTE Council)"
            user = User(
                email=raw_ident,
                hashed_password=payload.password or "demo123",
                full_name=admin_name if len(admin_name) > 5 else "AICTE Scrutiny Director",
                role="admin",
                institution_id=None
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Map to default institution (e.g. Delhi Technological Institute, ID 1)
            default_inst = db.query(Institution).first()
            user = User(
                email=raw_ident if "@" in raw_ident else f"{raw_ident}@college.edu.in",
                hashed_password=payload.password or "demo123",
                full_name="College Registrar",
                role="institution",
                institution_id=default_inst.id if default_inst else 1
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    # Check password (accept demo password 'demo123' or matching password)
    if user.hashed_password != payload.password and payload.password != "demo123":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Verify your official registered email or AICTE Institute ID."
        )

    # Enforce role alignment if user logged in with an official admin email
    if is_official_admin and user.role != "admin":
        user.role = "admin"
        user.institution_id = None
        db.commit()
        db.refresh(user)

    inst_id = user.institution_id
    inst_name = user.institution.name if user.institution else None
    aicte_id = user.institution.aicte_id if user.institution else ("AICTE-HQ-NEW-DELHI" if user.role == "admin" else None)

    token = create_access_token({
        "sub": user.email,
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name,
        "institution_id": inst_id
    })

    return TokenResponse(
        access_token=token,
        role=user.role,
        user_name=user.full_name,
        institution_id=inst_id,
        institution_name=inst_name,
        aicte_id=aicte_id
    )

@router.get("/demo-accounts")
def get_demo_accounts(db: Session = Depends(get_db)):
    """Returns preset credentials for 1-click evaluation login"""
    users = db.query(User).all()
    accounts = []
    for u in users:
        accounts.append({
            "email": u.email,
            "password": "demo123",
            "name": u.full_name,
            "role": u.role,
            "institution_name": u.institution.name if u.institution else "AICTE Headquarters, New Delhi",
            "aicte_id": u.institution.aicte_id if u.institution else "AICTE-REG-01"
        })
    return accounts
