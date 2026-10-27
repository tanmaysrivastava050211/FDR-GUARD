import os
import json
import uuid
import shutil
import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional, List

from app.database import get_db
from app.models.models import FDRRecord, Institution, VerificationLog, AuditLog, User
from app.schemas.schemas import FDROut, FDRCreate, FDRUpdateStatus, VerificationLogOut
from app.services.ocr_service import OCRService
from app.services.audit_service import AuditService
from app.services.maturity_service import MaturityService
from app.config import settings

router = APIRouter(prefix="/fdrs", tags=["FDR Lifecycle Management"])

def serialize_fdr(fdr: FDRRecord) -> dict:
    today = datetime.date.today()
    days_left = (fdr.maturity_date - today).days

    logs = []
    if fdr.verification_logs:
        for vl in fdr.verification_logs:
            logs.append({
                "id": vl.id,
                "officer_name": vl.officer_name,
                "officer_role": vl.officer_role,
                "action": vl.action,
                "previous_status": vl.previous_status,
                "new_status": vl.new_status,
                "remarks": vl.remarks,
                "discrepancies_noted": vl.discrepancies_noted,
                "created_at": vl.created_at
            })

    return {
        "id": fdr.id,
        "fdr_number": fdr.fdr_number,
        "institution_id": fdr.institution_id,
        "institution_name": fdr.institution.name if fdr.institution else None,
        "aicte_id": fdr.institution.aicte_id if fdr.institution else None,
        "issuing_bank": fdr.issuing_bank,
        "branch_name": fdr.branch_name,
        "ifsc_code": fdr.ifsc_code,
        "amount": fdr.amount,
        "issue_date": fdr.issue_date,
        "maturity_date": fdr.maturity_date,
        "tenure_months": fdr.tenure_months,
        "interest_rate": fdr.interest_rate,
        "document_path": fdr.document_path,
        "document_filename": fdr.document_filename,
        "verification_status": fdr.verification_status,
        "administrative_status": fdr.administrative_status,
        "ocr_extracted_data": fdr.ocr_extracted_data,
        "discrepancy_flags": fdr.discrepancy_flags,
        "is_duplicate": fdr.is_duplicate,
        "duplicate_of_fdr_id": fdr.duplicate_of_fdr_id,
        "renewed_from_fdr_id": fdr.renewed_from_fdr_id,
        "renewed_to_fdr_id": fdr.renewed_to_fdr_id,
        "days_to_maturity": days_left,
        "created_at": fdr.created_at,
        "updated_at": fdr.updated_at,
        "verification_logs": logs
    }

@router.get("/")
def list_fdrs(
    q: Optional[str] = None,
    status: Optional[str] = None,
    bank: Optional[str] = None,
    institution_id: Optional[int] = None,
    urgency: Optional[str] = None,  # 'maturing_30', 'overdue', 'flagged', 'draft'
    include_drafts: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(FDRRecord)

    if institution_id:
        query = query.filter(FDRRecord.institution_id == institution_id)
    else:
        # For Admin views, only show FDRs that have been submitted to admin (exclude DRAFT)
        if not include_drafts and status != "DRAFT":
            query = query.filter(FDRRecord.verification_status != "DRAFT")

    if status and status != "ALL":
        query = query.filter(or_(
            FDRRecord.verification_status == status,
            FDRRecord.administrative_status == status
        ))

    if bank and bank != "ALL":
        query = query.filter(FDRRecord.issuing_bank.ilike(f"%{bank}%"))

    if q:
        query = query.join(Institution).filter(or_(
            FDRRecord.id.ilike(f"%{q}%"),
            FDRRecord.fdr_number.ilike(f"%{q}%"),
            FDRRecord.issuing_bank.ilike(f"%{q}%"),
            Institution.name.ilike(f"%{q}%"),
            Institution.aicte_id.ilike(f"%{q}%")
        ))

    today = datetime.date.today()
    if urgency == "maturing_30":
        query = query.filter(and_(
            FDRRecord.maturity_date >= today,
            FDRRecord.maturity_date <= today + datetime.timedelta(days=30)
        ))
    elif urgency == "overdue":
        query = query.filter(FDRRecord.maturity_date < today)
    elif urgency == "flagged":
        query = query.filter(or_(
            FDRRecord.verification_status == "FLAGGED_DISCREPANCY",
            FDRRecord.is_duplicate == True
        ))
    elif urgency == "draft":
        query = query.filter(FDRRecord.verification_status == "DRAFT")

    records = query.order_by(FDRRecord.created_at.desc()).all()
    return [serialize_fdr(r) for r in records]

@router.get("/{fdr_id}")
def get_fdr(fdr_id: str, db: Session = Depends(get_db)):
    fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not fdr:
        raise HTTPException(status_code=404, detail=f"FDR record '{fdr_id}' not found.")
    return serialize_fdr(fdr)

@router.post("/submit")
async def submit_fdr(
    fdr_number: str = Form(...),
    issuing_bank: str = Form(...),
    branch_name: str = Form("Main Branch"),
    ifsc_code: str = Form("SBIN0001234"),
    amount: float = Form(...),
    issue_date: str = Form(...),
    maturity_date: str = Form(...),
    tenure_months: int = Form(24),
    interest_rate: float = Form(7.1),
    institution_id: int = Form(...),
    renewed_from_fdr_id: Optional[str] = Form(None),
    actor_name: str = Form("Institutional Registrar"),
    actor_role: str = Form("institution"),
    submit_to_admin: bool = Form(True),
    save_as_draft: bool = Form(False),
    action: str = Form("submit"),
    document: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Submits or drafts a new FDR. Executes EasyOCR scanning, checks for duplicates,
    flags discrepancies, and creates audit trail.
    If save_as_draft or action == 'draft', details are kept as DRAFT and NOT sent to admin until confirmed.
    """
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Parse dates
    try:
        iss_d = datetime.date.fromisoformat(issue_date)
        mat_d = datetime.date.fromisoformat(maturity_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # Generate sequential unique FDR ID (e.g., FDR-26010)
    count = db.query(FDRRecord).count()
    fdr_id = f"FDR-{26000 + count + 1}"

    # Handle document upload
    saved_doc_path = None
    saved_doc_filename = None
    ocr_result = {
        "extracted_fields": {},
        "overall_confidence": 0.0,
        "raw_text": "",
        "bounding_boxes": []
    }

    if document and document.filename:
        saved_doc_filename = document.filename
        file_ext = os.path.splitext(document.filename)[1].lower()
        unique_name = f"{fdr_id}_{uuid.uuid4().hex[:6]}{file_ext}"
        saved_doc_path = os.path.join(settings.UPLOAD_DIR, unique_name)
        
        with open(saved_doc_path, "wb") as buffer:
            shutil.copyfileobj(document.file, buffer)

        # Run EasyOCR
        try:
            ocr_result = OCRService.scan_fdr_document(saved_doc_path)
        except Exception as e:
            ocr_result["raw_text"] = f"OCR Error: {e}"

    # 1. Duplicate check: is this FDR reference number already registered in another active record?
    clean_fdr_num = fdr_number.strip().upper()
    existing_dup = db.query(FDRRecord).filter(
        FDRRecord.fdr_number.ilike(clean_fdr_num),
        FDRRecord.administrative_status.notin_(["RELEASED", "ENCASHED"])
    ).first()

    is_duplicate = existing_dup is not None
    duplicate_of = existing_dup.id if existing_dup else None

    # 2. Smart Discrepancy Detection
    entered_payload = {
        "fdr_number": fdr_number,
        "issuing_bank": issuing_bank,
        "amount": amount,
        "issue_date": iss_d,
        "maturity_date": mat_d
    }

    discrepancies = OCRService.detect_discrepancies(
        entered_data=entered_payload,
        ocr_extracted=ocr_result.get("extracted_fields", {}),
        is_duplicate=is_duplicate,
        duplicate_id=duplicate_of
    )

    is_draft = save_as_draft or (not submit_to_admin) or (action == "draft")

    if is_draft:
        initial_verif_status = "DRAFT"
        admin_status = "DRAFT"
    else:
        # Determine initial verification status
        if is_duplicate or any(d["severity"] in ["CRITICAL", "HIGH"] for d in discrepancies):
            initial_verif_status = "FLAGGED_DISCREPANCY"
        elif ocr_result.get("overall_confidence", 0) > 0.7 and not discrepancies:
            initial_verif_status = "AUTO_CHECKED_CLEAN"
        else:
            initial_verif_status = "SUBMITTED"

        # Determine administrative status
        today = datetime.date.today()
        days_left = (mat_d - today).days
        if days_left < 0:
            admin_status = "MATURED"
        elif days_left <= 30:
            admin_status = "MATURING_SOON"
        else:
            admin_status = "ACTIVE"

    # Create FDR Record
    new_fdr = FDRRecord(
        id=fdr_id,
        fdr_number=fdr_number.strip(),
        institution_id=institution_id,
        issuing_bank=issuing_bank.strip(),
        branch_name=branch_name.strip(),
        ifsc_code=ifsc_code.strip(),
        amount=amount,
        issue_date=iss_d,
        maturity_date=mat_d,
        tenure_months=tenure_months,
        interest_rate=interest_rate,
        document_path=saved_doc_path,
        document_filename=saved_doc_filename,
        verification_status=initial_verif_status,
        administrative_status=admin_status,
        ocr_extracted_data=json.dumps(ocr_result),
        discrepancy_flags=json.dumps(discrepancies),
        is_duplicate=is_duplicate,
        duplicate_of_fdr_id=duplicate_of,
        renewed_from_fdr_id=renewed_from_fdr_id
    )

    db.add(new_fdr)
    db.flush()

    # Link predecessor FDR if renewal
    if renewed_from_fdr_id:
        old_fdr = db.query(FDRRecord).filter(FDRRecord.id == renewed_from_fdr_id).first()
        if old_fdr:
            old_fdr.renewed_to_fdr_id = fdr_id
            old_fdr.administrative_status = "RENEWAL_SUBMITTED"

    # Create Initial Verification Log
    if is_draft:
        log_action = "DRAFT_SAVED"
        log_remarks = f"FDR draft created and saved by {actor_name}. Details NOT yet transmitted to AICTE Admin."
        audit_action = "SAVE_FDR_DRAFT"
    else:
        log_action = "AUTO_EASYOCR_SCAN" if document else "INITIAL_SUBMISSION"
        log_remarks = f"Document processed with EasyOCR. {len(discrepancies)} discrepancy flags identified. Transmitted to AICTE Admin."
        audit_action = "SUBMIT_FDR_TO_ADMIN"

    v_log = VerificationLog(
        fdr_id=fdr_id,
        officer_name="AICTE Automated OCR Engine" if document else actor_name,
        officer_role="system" if document else actor_role,
        action=log_action,
        previous_status=None,
        new_status=initial_verif_status,
        remarks=log_remarks,
        discrepancies_noted=json.dumps(discrepancies)
    )
    db.add(v_log)

    # Log to tamper-evident audit ledger
    AuditService.log_event(
        db=db,
        actor_id=str(institution_id),
        actor_name=actor_name,
        actor_role=actor_role,
        action=audit_action,
        target_type="FDR",
        target_id=fdr_id,
        details={
            "amount": amount,
            "bank": issuing_bank,
            "fdr_number": fdr_number,
            "discrepancies_count": len(discrepancies),
            "status": initial_verif_status,
            "is_draft": is_draft
        }
    )

    db.commit()
    db.refresh(new_fdr)
    return serialize_fdr(new_fdr)

@router.post("/{fdr_id}/edit")
@router.put("/{fdr_id}")
async def edit_fdr(
    fdr_id: str,
    fdr_number: Optional[str] = Form(None),
    issuing_bank: Optional[str] = Form(None),
    branch_name: Optional[str] = Form(None),
    ifsc_code: Optional[str] = Form(None),
    amount: Optional[float] = Form(None),
    issue_date: Optional[str] = Form(None),
    maturity_date: Optional[str] = Form(None),
    tenure_months: Optional[int] = Form(None),
    interest_rate: Optional[float] = Form(None),
    submit_to_admin: bool = Form(False),
    action: str = Form("save"),  # 'save' to keep draft/edited, 'submit' to send to admin
    actor_name: str = Form("Institutional Registrar"),
    actor_role: str = Form("institution"),
    document: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Allows the institution to edit FDR instrument details and optionally upload
    a corrected/updated document certificate.
    If action == 'submit' or submit_to_admin is True, the details are officially
    transmitted to the AICTE Admin Scrutiny Desk.
    """
    fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not fdr:
        raise HTTPException(status_code=404, detail=f"FDR record '{fdr_id}' not found.")

    old_status = fdr.verification_status

    # Handle document upload if provided
    ocr_result = None
    if fdr.ocr_extracted_data:
        try:
            ocr_result = json.loads(fdr.ocr_extracted_data)
        except:
            ocr_result = {}

    if document and document.filename:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_ext = os.path.splitext(document.filename)[1].lower()
        unique_name = f"{fdr.id}_{uuid.uuid4().hex[:6]}{file_ext}"
        saved_doc_path = os.path.join(settings.UPLOAD_DIR, unique_name)
        
        with open(saved_doc_path, "wb") as buffer:
            shutil.copyfileobj(document.file, buffer)

        fdr.document_path = saved_doc_path
        fdr.document_filename = document.filename

        try:
            ocr_result = OCRService.scan_fdr_document(saved_doc_path)
            fdr.ocr_extracted_data = json.dumps(ocr_result)
        except Exception as e:
            ocr_result = {"extracted_fields": {}, "overall_confidence": 0.0, "raw_text": f"OCR Error: {e}"}

    # Update scalar fields if provided
    if fdr_number is not None:
        fdr.fdr_number = fdr_number.strip()
    if issuing_bank is not None:
        fdr.issuing_bank = issuing_bank.strip()
    if branch_name is not None:
        fdr.branch_name = branch_name.strip()
    if ifsc_code is not None:
        fdr.ifsc_code = ifsc_code.strip()
    if amount is not None:
        fdr.amount = amount
    if issue_date is not None:
        try:
            fdr.issue_date = datetime.date.fromisoformat(issue_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid issue_date format. Use YYYY-MM-DD.")
    if maturity_date is not None:
        try:
            fdr.maturity_date = datetime.date.fromisoformat(maturity_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid maturity_date format. Use YYYY-MM-DD.")
    if tenure_months is not None:
        fdr.tenure_months = tenure_months
    if interest_rate is not None:
        fdr.interest_rate = interest_rate

    # Check duplicates excluding current record
    clean_fdr_num = fdr.fdr_number.strip().upper()
    existing_dup = db.query(FDRRecord).filter(
        FDRRecord.fdr_number.ilike(clean_fdr_num),
        FDRRecord.id != fdr.id,
        FDRRecord.administrative_status.notin_(["RELEASED", "ENCASHED"])
    ).first()

    is_duplicate = existing_dup is not None
    fdr.is_duplicate = is_duplicate
    fdr.duplicate_of_fdr_id = existing_dup.id if existing_dup else None

    # Detect discrepancies with OCR data
    entered_payload = {
        "fdr_number": fdr.fdr_number,
        "issuing_bank": fdr.issuing_bank,
        "amount": fdr.amount,
        "issue_date": fdr.issue_date,
        "maturity_date": fdr.maturity_date
    }

    discrepancies = OCRService.detect_discrepancies(
        entered_data=entered_payload,
        ocr_extracted=ocr_result.get("extracted_fields", {}) if ocr_result else {},
        is_duplicate=is_duplicate,
        duplicate_id=fdr.duplicate_of_fdr_id
    )
    fdr.discrepancy_flags = json.dumps(discrepancies)

    # Determine whether user is submitting to admin or just saving edits
    is_submitting_to_admin = submit_to_admin or (action == "submit")

    if is_submitting_to_admin:
        if is_duplicate or any(d["severity"] in ["CRITICAL", "HIGH"] for d in discrepancies):
            new_status = "FLAGGED_DISCREPANCY"
        elif ocr_result and ocr_result.get("overall_confidence", 0) > 0.7 and not discrepancies:
            new_status = "AUTO_CHECKED_CLEAN"
        else:
            new_status = "SUBMITTED"

        fdr.verification_status = new_status

        # Administrative status
        today = datetime.date.today()
        days_left = (fdr.maturity_date - today).days
        if days_left < 0:
            fdr.administrative_status = "MATURED"
        elif days_left <= 30:
            fdr.administrative_status = "MATURING_SOON"
        else:
            fdr.administrative_status = "ACTIVE"

        v_log = VerificationLog(
            fdr_id=fdr.id,
            officer_name=actor_name,
            officer_role=actor_role,
            action="EDITED_AND_SUBMITTED_TO_ADMIN",
            previous_status=old_status,
            new_status=new_status,
            remarks=f"FDR details edited and officially dispatched to AICTE Admin Scrutiny by {actor_name}.",
            discrepancies_noted=json.dumps(discrepancies)
        )
        db.add(v_log)

        AuditService.log_event(
            db=db,
            actor_id=str(fdr.institution_id),
            actor_name=actor_name,
            actor_role=actor_role,
            action="SUBMIT_FDR_TO_ADMIN",
            target_type="FDR",
            target_id=fdr.id,
            details={
                "previous_status": old_status,
                "new_status": new_status,
                "amount": fdr.amount,
                "bank": fdr.issuing_bank,
                "fdr_number": fdr.fdr_number,
                "discrepancies_count": len(discrepancies)
            }
        )
    else:
        # Saving edits without sending to admin
        if old_status == "DRAFT":
            fdr.administrative_status = "DRAFT"

        v_log = VerificationLog(
            fdr_id=fdr.id,
            officer_name=actor_name,
            officer_role=actor_role,
            action="FDR_RECORD_EDITED",
            previous_status=old_status,
            new_status=fdr.verification_status,
            remarks=f"FDR details updated by {actor_name}. Pending submission to Admin.",
            discrepancies_noted=json.dumps(discrepancies)
        )
        db.add(v_log)

        AuditService.log_event(
            db=db,
            actor_id=str(fdr.institution_id),
            actor_name=actor_name,
            actor_role=actor_role,
            action="UPDATE_FDR_RECORD",
            target_type="FDR",
            target_id=fdr.id,
            details={
                "status": fdr.verification_status,
                "amount": fdr.amount,
                "bank": fdr.issuing_bank,
                "fdr_number": fdr.fdr_number
            }
        )

    db.commit()
    db.refresh(fdr)
    return serialize_fdr(fdr)

@router.post("/{fdr_id}/send-to-admin")
def send_fdr_to_admin(
    fdr_id: str,
    actor_name: str = Query("Institutional Registrar"),
    actor_role: str = Query("institution"),
    db: Session = Depends(get_db)
):
    """
    Directly dispatches an existing Draft FDR to the AICTE Central Scrutiny Bureau.
    """
    fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not fdr:
        raise HTTPException(status_code=404, detail=f"FDR record '{fdr_id}' not found.")

    old_status = fdr.verification_status

    # Parse discrepancies
    discrepancies = []
    if fdr.discrepancy_flags:
        try:
            discrepancies = json.loads(fdr.discrepancy_flags)
        except:
            discrepancies = []

    ocr_result = {}
    if fdr.ocr_extracted_data:
        try:
            ocr_result = json.loads(fdr.ocr_extracted_data)
        except:
            ocr_result = {}

    if fdr.is_duplicate or any(d.get("severity") in ["CRITICAL", "HIGH"] for d in discrepancies):
        new_status = "FLAGGED_DISCREPANCY"
    elif ocr_result and ocr_result.get("overall_confidence", 0) > 0.7 and not discrepancies:
        new_status = "AUTO_CHECKED_CLEAN"
    else:
        new_status = "SUBMITTED"

    fdr.verification_status = new_status

    today = datetime.date.today()
    days_left = (fdr.maturity_date - today).days
    if days_left < 0:
        fdr.administrative_status = "MATURED"
    elif days_left <= 30:
        fdr.administrative_status = "MATURING_SOON"
    else:
        fdr.administrative_status = "ACTIVE"

    v_log = VerificationLog(
        fdr_id=fdr.id,
        officer_name=actor_name,
        officer_role=actor_role,
        action="DISPATCHED_TO_ADMIN",
        previous_status=old_status,
        new_status=new_status,
        remarks=f"FDR instrument officially dispatched to AICTE Admin Scrutiny by {actor_name}.",
        discrepancies_noted=fdr.discrepancy_flags
    )
    db.add(v_log)

    AuditService.log_event(
        db=db,
        actor_id=str(fdr.institution_id),
        actor_name=actor_name,
        actor_role=actor_role,
        action="SUBMIT_FDR_TO_ADMIN",
        target_type="FDR",
        target_id=fdr.id,
        details={
            "previous_status": old_status,
            "new_status": new_status,
            "amount": fdr.amount,
            "bank": fdr.issuing_bank,
            "fdr_number": fdr.fdr_number
        }
    )

    db.commit()
    db.refresh(fdr)
    return serialize_fdr(fdr)

@router.post("/{fdr_id}/scrutiny-action")
def perform_scrutiny_action(
    fdr_id: str,
    payload: FDRUpdateStatus,
    db: Session = Depends(get_db)
):
    """
    Allows authorized AICTE scrutiny officers to verify, raise corrections,
    flag discrepancies, or confirm bank authenticity.
    """
    fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not fdr:
        raise HTTPException(status_code=404, detail="FDR record not found.")

    old_status = fdr.verification_status
    new_status = payload.verification_status or old_status

    fdr.verification_status = new_status
    if payload.administrative_status:
        fdr.administrative_status = payload.administrative_status

    # Record Verification Log
    v_log = VerificationLog(
        fdr_id=fdr.id,
        officer_name=payload.officer_name or "AICTE Scrutiny Officer",
        officer_role="scrutiny_officer",
        action="OFFICER_REVIEW",
        previous_status=old_status,
        new_status=new_status,
        remarks=payload.remarks or "Official review recorded.",
        discrepancies_noted=fdr.discrepancy_flags
    )
    db.add(v_log)

    # Audit Trail
    AuditService.log_event(
        db=db,
        actor_id="OFFICER-01",
        actor_name=payload.officer_name or "AICTE Scrutiny Officer",
        actor_role="scrutiny_officer",
        action="UPDATE_FDR_STATUS",
        target_type="FDR",
        target_id=fdr.id,
        details={
            "from_status": old_status,
            "to_status": new_status,
            "remarks": payload.remarks
        }
    )

    db.commit()
    db.refresh(fdr)
    return serialize_fdr(fdr)
