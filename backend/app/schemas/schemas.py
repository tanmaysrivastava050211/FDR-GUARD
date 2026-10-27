import datetime
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_name: str
    institution_id: Optional[int] = None
    institution_name: Optional[str] = None
    aicte_id: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    institution_id: Optional[int] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class InstitutionBase(BaseModel):
    aicte_id: str
    name: str
    state: str
    city: str
    category: str
    contact_email: str
    phone: str
    compliance_status: str

class InstitutionOut(InstitutionBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class FDRCreate(BaseModel):
    fdr_number: str
    issuing_bank: str
    branch_name: Optional[str] = "Main Branch"
    ifsc_code: Optional[str] = "SBIN0001234"
    amount: float
    issue_date: datetime.date
    maturity_date: datetime.date
    tenure_months: Optional[int] = 24
    interest_rate: Optional[float] = 7.1
    institution_id: Optional[int] = None
    renewed_from_fdr_id: Optional[str] = None

class FDRUpdateStatus(BaseModel):
    verification_status: Optional[str] = None
    administrative_status: Optional[str] = None
    remarks: Optional[str] = None
    officer_name: Optional[str] = "AICTE Scrutiny Officer"

class VerificationLogOut(BaseModel):
    id: int
    officer_name: str
    officer_role: str
    action: str
    previous_status: Optional[str] = None
    new_status: str
    remarks: Optional[str] = None
    discrepancies_noted: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class FDROut(BaseModel):
    id: str
    fdr_number: str
    institution_id: int
    institution_name: Optional[str] = None
    aicte_id: Optional[str] = None
    issuing_bank: str
    branch_name: str
    ifsc_code: str
    amount: float
    issue_date: datetime.date
    maturity_date: datetime.date
    tenure_months: int
    interest_rate: float
    document_path: Optional[str] = None
    document_filename: Optional[str] = None
    verification_status: str
    administrative_status: str
    ocr_extracted_data: Optional[str] = None
    discrepancy_flags: Optional[str] = None
    is_duplicate: bool
    duplicate_of_fdr_id: Optional[str] = None
    renewed_from_fdr_id: Optional[str] = None
    renewed_to_fdr_id: Optional[str] = None
    days_to_maturity: Optional[int] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    verification_logs: Optional[List[VerificationLogOut]] = []

    class Config:
        from_attributes = True

class ReleaseRequestCreate(BaseModel):
    fdr_id: str
    reason: str
    bank_account_no: str
    bank_name: str
    ifsc_code: str
    supporting_doc_name: Optional[str] = "clearance_noc.pdf"

class ReleaseRequestAction(BaseModel):
    action: str  # APPROVED, REJECTED, UNDER_SCRUTINY, REGIONAL_DIRECTOR_CLEARED
    remarks: str
    officer_name: Optional[str] = "AICTE Regional Director"

class ReleaseRequestOut(BaseModel):
    id: str
    fdr_id: str
    institution_id: int
    institution_name: Optional[str] = None
    aicte_id: Optional[str] = None
    fdr_amount: Optional[float] = None
    fdr_bank: Optional[str] = None
    fdr_maturity: Optional[datetime.date] = None
    reason: str
    bank_account_no: str
    bank_name: str
    ifsc_code: str
    supporting_doc_name: Optional[str] = None
    status: str
    scrutinized_by: Optional[str] = None
    approved_by: Optional[str] = None
    official_remarks: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class OCRScanResult(BaseModel):
    extracted_fields: Dict[str, Any]
    detected_discrepancies: List[Dict[str, Any]]
    overall_confidence: float
    raw_text: str
    bounding_boxes: List[Dict[str, Any]] = []

class AdminDashboardStats(BaseModel):
    total_fdrs: int
    total_deposit_amount: float
    verified_fdrs: int
    pending_scrutiny: int
    discrepancy_flagged: int
    maturing_30_days: int
    overdue_maturities: int
    release_requests_pending: int
    bank_distribution: List[Dict[str, Any]]
    compliance_distribution: List[Dict[str, Any]]

class InstitutionDashboardStats(BaseModel):
    my_fdrs_count: int
    my_total_deposit: float
    my_verified_count: int
    my_action_required_count: int
    upcoming_maturities_30d: int
    active_release_requests: int
    compliance_health: str
    my_drafts_count: Optional[int] = 0

class AuditLogOut(BaseModel):
    id: int
    timestamp: datetime.datetime
    actor_id: str
    actor_name: str
    actor_role: str
    action: str
    target_type: str
    target_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: str

    class Config:
        from_attributes = True
