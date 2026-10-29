import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from typing import Optional, List, Dict, Any

from app.database import get_db
from app.models.models import FDRRecord, Institution, ReleaseRequest
from app.schemas.schemas import AdminDashboardStats, InstitutionDashboardStats

router = APIRouter(prefix="/stats", tags=["Analytical Dashboards & KPIs"])

@router.get("/admin-dashboard", response_model=AdminDashboardStats)
def get_admin_dashboard_stats(db: Session = Depends(get_db)):
    today = datetime.date.today()
    in_30_days = today + datetime.timedelta(days=30)

    # Admin only sees FDRs that were submitted/sent to admin (excluding drafts)
    non_draft_filter = FDRRecord.verification_status != "DRAFT"

    total_fdrs = db.query(FDRRecord).filter(non_draft_filter).count()
    total_amount = db.query(func.sum(FDRRecord.amount)).filter(non_draft_filter).scalar() or 0.0

    verified_fdrs = db.query(FDRRecord).filter(
        non_draft_filter,
        FDRRecord.verification_status.in_(["VERIFIED", "BANK_CONFIRMED", "AUTO_CHECKED_CLEAN"])
    ).count()

    pending_scrutiny = db.query(FDRRecord).filter(
        FDRRecord.verification_status.in_(["SUBMITTED", "UNDER_SCRUTINY"])
    ).count()

    discrepancy_flagged = db.query(FDRRecord).filter(
        non_draft_filter,
        or_(
            FDRRecord.verification_status == "FLAGGED_DISCREPANCY",
            FDRRecord.is_duplicate == True
        )
    ).count()

    maturing_30_days = db.query(FDRRecord).filter(
        non_draft_filter,
        and_(
            FDRRecord.maturity_date >= today,
            FDRRecord.maturity_date <= in_30_days,
            FDRRecord.administrative_status.notin_(["RELEASED", "ENCASHED"])
        )
    ).count()

    overdue_maturities = db.query(FDRRecord).filter(
        non_draft_filter,
        and_(
            FDRRecord.maturity_date < today,
            FDRRecord.administrative_status.notin_(["RELEASED", "ENCASHED"])
        )
    ).count()

    release_pending = db.query(ReleaseRequest).filter(
        ReleaseRequest.status.in_(["SUBMITTED", "UNDER_SCRUTINY", "REGIONAL_DIRECTOR_CLEARED"])
    ).count()

    # Bank distribution
    banks = db.query(
        FDRRecord.issuing_bank,
        func.count(FDRRecord.id).label("count"),
        func.sum(FDRRecord.amount).label("total")
    ).filter(non_draft_filter).group_by(FDRRecord.issuing_bank).all()

    bank_distribution = [
        {"bank": b[0], "count": b[1], "total": float(b[2] or 0)}
        for b in banks
    ]

    # Institutional compliance distribution
    comp = db.query(
        Institution.compliance_status,
        func.count(Institution.id).label("count")
    ).group_by(Institution.compliance_status).all()

    compliance_distribution = [
        {"status": c[0], "count": c[1]}
        for c in comp
    ]

    return AdminDashboardStats(
        total_fdrs=total_fdrs,
        total_deposit_amount=float(total_amount),
        verified_fdrs=verified_fdrs,
        pending_scrutiny=pending_scrutiny,
        discrepancy_flagged=discrepancy_flagged,
        maturing_30_days=maturing_30_days,
        overdue_maturities=overdue_maturities,
        release_requests_pending=release_pending,
        bank_distribution=bank_distribution,
        compliance_distribution=compliance_distribution
    )

@router.get("/institution-dashboard", response_model=InstitutionDashboardStats)
def get_institution_dashboard_stats(
    institution_id: int = Query(...),
    db: Session = Depends(get_db)
):
    today = datetime.date.today()
    in_30_days = today + datetime.timedelta(days=30)

    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    comp_health = inst.compliance_status if inst else "Compliant"

    fdrs_query = db.query(FDRRecord).filter(FDRRecord.institution_id == institution_id)

    total_count = fdrs_query.count()
    total_deposit = db.query(func.sum(FDRRecord.amount)).filter(FDRRecord.institution_id == institution_id).scalar() or 0.0

    verified_count = fdrs_query.filter(
        FDRRecord.verification_status.in_(["VERIFIED", "BANK_CONFIRMED", "AUTO_CHECKED_CLEAN"])
    ).count()

    action_required_count = fdrs_query.filter(
        or_(
            FDRRecord.verification_status.in_(["FLAGGED_DISCREPANCY", "REVISION_REQUIRED"]),
            FDRRecord.is_duplicate == True
        )
    ).count()

    upcoming_maturities = fdrs_query.filter(
        and_(
            FDRRecord.maturity_date >= today,
            FDRRecord.maturity_date <= in_30_days,
            FDRRecord.administrative_status.notin_(["RELEASED", "ENCASHED"])
        )
    ).count()

    active_releases = db.query(ReleaseRequest).filter(
        ReleaseRequest.institution_id == institution_id,
        ReleaseRequest.status.notin_(["APPROVED", "REJECTED"])
    ).count()

    my_drafts = fdrs_query.filter(FDRRecord.verification_status == "DRAFT").count()

    return InstitutionDashboardStats(
        my_fdrs_count=total_count,
        my_total_deposit=float(total_deposit),
        my_verified_count=verified_count,
        my_action_required_count=action_required_count,
        upcoming_maturities_30d=upcoming_maturities,
        active_release_requests=active_releases,
        compliance_health=comp_health,
        my_drafts_count=my_drafts
    )
