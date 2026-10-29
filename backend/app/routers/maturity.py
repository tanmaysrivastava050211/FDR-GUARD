import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.models import FDRRecord, EscalationReminder
from app.services.maturity_service import MaturityService
from app.routers.fdrs import serialize_fdr

router = APIRouter(prefix="/maturity", tags=["Maturity & Escalation Engine"])

@router.get("/tracker")
def get_maturity_tracker(
    institution_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(FDRRecord)
    if institution_id:
        query = query.filter(FDRRecord.institution_id == institution_id)

    # Exclude released and unsubmitted drafts
    records = query.filter(
        FDRRecord.verification_status != "DRAFT",
        FDRRecord.administrative_status.notin_(["RELEASED", "ENCASHED", "DRAFT"])
    ).order_by(FDRRecord.maturity_date.asc()).all()

    return [serialize_fdr(r) for r in records]

@router.post("/trigger-reminders")
def run_automated_reminder_engine(db: Session = Depends(get_db)):
    """
    Executes automated maturity tracking, generates 30-day, 15-day,
    and overdue escalation notices, and logs audit events.
    """
    result = MaturityService.evaluate_and_dispatch_reminders(db)
    return {
        "status": "success",
        "message": "Automated maturity and escalation rules evaluated successfully.",
        "details": result
    }

@router.get("/reminders")
def list_dispatched_reminders(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    reminders = db.query(EscalationReminder).order_by(
        EscalationReminder.triggered_at.desc()
    ).limit(limit).all()

    return [
        {
            "id": r.id,
            "fdr_id": r.fdr_id,
            "reminder_type": r.reminder_type,
            "days_left": r.days_left,
            "status": r.status,
            "triggered_at": r.triggered_at,
            "recipient_email": r.recipient_email,
            "message": r.message
        }
        for r in reminders
    ]
