import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.models.models import ReleaseRequest, FDRRecord, Institution
from app.schemas.schemas import ReleaseRequestCreate, ReleaseRequestAction, ReleaseRequestOut
from app.services.audit_service import AuditService

router = APIRouter(prefix="/releases", tags=["Security Deposit Release & Refund Workflow"])

def serialize_release(req: ReleaseRequest) -> dict:
    fdr = req.fdr
    inst = req.institution
    return {
        "id": req.id,
        "fdr_id": req.fdr_id,
        "institution_id": req.institution_id,
        "institution_name": inst.name if inst else None,
        "aicte_id": inst.aicte_id if inst else None,
        "fdr_amount": fdr.amount if fdr else 0.0,
        "fdr_bank": fdr.issuing_bank if fdr else None,
        "fdr_maturity": fdr.maturity_date if fdr else None,
        "reason": req.reason,
        "bank_account_no": req.bank_account_no,
        "bank_name": req.bank_name,
        "ifsc_code": req.ifsc_code,
        "supporting_doc_name": req.supporting_doc_name,
        "status": req.status,
        "scrutinized_by": req.scrutinized_by,
        "approved_by": req.approved_by,
        "official_remarks": req.official_remarks,
        "created_at": req.created_at,
        "updated_at": req.updated_at
    }

@router.get("/")
def list_release_requests(
    institution_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ReleaseRequest)
    if institution_id:
        query = query.filter(ReleaseRequest.institution_id == institution_id)
    if status and status != "ALL":
        query = query.filter(ReleaseRequest.status == status)
    
    requests = query.order_by(ReleaseRequest.created_at.desc()).all()
    return [serialize_release(r) for r in requests]

@router.post("/submit")
def submit_release_request(
    payload: ReleaseRequestCreate,
    institution_id: int = Query(...),
    actor_name: str = Query("College Registrar"),
    db: Session = Depends(get_db)
):
    fdr = db.query(FDRRecord).filter(FDRRecord.id == payload.fdr_id).first()
    if not fdr:
        raise HTTPException(status_code=404, detail="FDR record not found.")

    if fdr.institution_id != institution_id:
        raise HTTPException(status_code=403, detail="Not authorized to request release for this institution's FDR.")

    count = db.query(ReleaseRequest).count()
    req_id = f"REL-{26000 + count + 1}"
    while db.query(ReleaseRequest).filter(ReleaseRequest.id == req_id).first():
        count += 1
        req_id = f"REL-{26000 + count + 1}"

    new_req = ReleaseRequest(
        id=req_id,
        fdr_id=payload.fdr_id,
        institution_id=institution_id,
        reason=payload.reason,
        bank_account_no=payload.bank_account_no,
        bank_name=payload.bank_name,
        ifsc_code=payload.ifsc_code,
        supporting_doc_name=payload.supporting_doc_name or "Clearance_Resolution.pdf",
        status="SUBMITTED"
    )

    fdr.administrative_status = "RELEASE_REQUESTED"

    db.add(new_req)
    db.flush()

    AuditService.log_event(
        db=db,
        actor_id=str(institution_id),
        actor_name=actor_name,
        actor_role="institution",
        action="CREATE_RELEASE_REQUEST",
        target_type="RELEASE",
        target_id=req_id,
        details={
            "fdr_id": fdr.id,
            "amount": fdr.amount,
            "bank_account": payload.bank_account_no
        }
    )

    db.commit()
    db.refresh(new_req)
    return serialize_release(new_req)

@router.post("/{req_id}/action")
def update_release_status(
    req_id: str,
    payload: ReleaseRequestAction,
    db: Session = Depends(get_db)
):
    req = db.query(ReleaseRequest).filter(ReleaseRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Release request not found.")

    old_status = req.status
    req.status = payload.action
    req.official_remarks = payload.remarks
    req.scrutinized_by = payload.officer_name

    if payload.action == "APPROVED":
        req.approved_by = payload.officer_name
        req.fdr.administrative_status = "RELEASED"
        req.fdr.verification_status = "VERIFIED"
    elif payload.action == "REJECTED":
        req.fdr.administrative_status = "ACTIVE"

    AuditService.log_event(
        db=db,
        actor_id="OFFICER-REG-01",
        actor_name=payload.officer_name or "AICTE Authority",
        actor_role="admin",
        action="DECIDE_RELEASE_REQUEST",
        target_type="RELEASE",
        target_id=req.id,
        details={
            "fdr_id": req.fdr_id,
            "decision": payload.action,
            "from_status": old_status,
            "remarks": payload.remarks
        }
    )

    db.commit()
    db.refresh(req)
    return serialize_release(req)
