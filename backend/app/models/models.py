import datetime
import json
from sqlalchemy import (
    Column, String, Integer, Float, Date, DateTime, Boolean, 
    ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # 'admin', 'scrutiny_officer', 'institution'
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    institution = relationship("Institution", back_populates="users")

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    aicte_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    state = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    category = Column(String(100), default="Engineering & Technology")
    contact_email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    compliance_status = Column(String(50), default="Compliant")  # Compliant, Under Scrutiny, Defaulter
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    users = relationship("User", back_populates="institution")
    fdrs = relationship("FDRRecord", back_populates="institution")
    release_requests = relationship("ReleaseRequest", back_populates="institution")

class FDRRecord(Base):
    __tablename__ = "fdr_records"

    id = Column(String(50), primary_key=True, index=True)  # e.g., FDR-26001
    fdr_number = Column(String(100), index=True, nullable=False)  # e.g., SBI-884219
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    issuing_bank = Column(String(150), nullable=False)
    branch_name = Column(String(150), default="Main Branch")
    ifsc_code = Column(String(50), default="SBIN0001234")
    
    amount = Column(Float, nullable=False)
    issue_date = Column(Date, nullable=False)
    maturity_date = Column(Date, nullable=False)
    tenure_months = Column(Integer, default=24)
    interest_rate = Column(Float, default=7.1)
    
    document_path = Column(String(500), nullable=True)
    document_filename = Column(String(255), nullable=True)
    
    # Verification lifecycle
    verification_status = Column(String(50), default="SUBMITTED") 
    # SUBMITTED, AUTO_CHECKED_CLEAN, FLAGGED_DISCREPANCY, UNDER_SCRUTINY, BANK_CONFIRMED, VERIFIED, REVISION_REQUIRED
    
    # Administrative lifecycle
    administrative_status = Column(String(50), default="ACTIVE")
    # ACTIVE, MATURING_SOON, MATURED, RENEWAL_PENDING, RENEWAL_SUBMITTED, RELEASE_REQUESTED, RELEASED, ENCASHED
    
    ocr_extracted_data = Column(Text, nullable=True)  # JSON string of OCR fields & confidence
    discrepancy_flags = Column(Text, nullable=True)   # JSON string list of discrepancy notes
    
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_fdr_id = Column(String(50), nullable=True)
    
    # Renewal linking
    renewed_from_fdr_id = Column(String(50), nullable=True)  # predecessor FDR
    renewed_to_fdr_id = Column(String(50), nullable=True)    # successor FDR
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    institution = relationship("Institution", back_populates="fdrs")
    verification_logs = relationship("VerificationLog", back_populates="fdr", cascade="all, delete-orphan")
    release_requests = relationship("ReleaseRequest", back_populates="fdr")
    reminders = relationship("EscalationReminder", back_populates="fdr", cascade="all, delete-orphan")

class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    fdr_id = Column(String(50), ForeignKey("fdr_records.id"), nullable=False)
    officer_name = Column(String(100), nullable=False)
    officer_role = Column(String(50), default="Scrutiny Official")
    action = Column(String(100), nullable=False)  # AUTO_EASYOCR_SCAN, MANUAL_VERIFY, RAISE_DISCREPANCY, CORRECTION_REQUESTED
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    remarks = Column(Text, nullable=True)
    discrepancies_noted = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    fdr = relationship("FDRRecord", back_populates="verification_logs")

class ReleaseRequest(Base):
    __tablename__ = "release_requests"

    id = Column(String(50), primary_key=True, index=True)  # e.g., REL-26001
    fdr_id = Column(String(50), ForeignKey("fdr_records.id"), nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    
    reason = Column(Text, nullable=False)
    bank_account_no = Column(String(50), nullable=False)
    bank_name = Column(String(100), nullable=False)
    ifsc_code = Column(String(50), nullable=False)
    supporting_doc_name = Column(String(255), nullable=True)
    
    # Status: SUBMITTED, UNDER_SCRUTINY, REGIONAL_DIRECTOR_CLEARED, APPROVED, REJECTED, DISBURSED
    status = Column(String(50), default="SUBMITTED")
    scrutinized_by = Column(String(100), nullable=True)
    approved_by = Column(String(100), nullable=True)
    official_remarks = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    fdr = relationship("FDRRecord", back_populates="release_requests")
    institution = relationship("Institution", back_populates="release_requests")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    actor_id = Column(String(100), nullable=False)
    actor_name = Column(String(150), nullable=False)
    actor_role = Column(String(50), nullable=False)
    action = Column(String(150), nullable=False)
    target_type = Column(String(50), nullable=False)  # FDR, RELEASE, INSTITUTION, SYSTEM
    target_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)  # JSON string or description
    ip_address = Column(String(50), default="127.0.0.1")

class EscalationReminder(Base):
    __tablename__ = "escalation_reminders"

    id = Column(Integer, primary_key=True, index=True)
    fdr_id = Column(String(50), ForeignKey("fdr_records.id"), nullable=False)
    reminder_type = Column(String(50), nullable=False)  # 30_DAY_ADVANCE, 15_DAY_URGENT, MATURITY_DUE, OVERDUE_ESCALATION
    days_left = Column(Integer, nullable=False)
    status = Column(String(50), default="DISPATCHED")  # DISPATCHED, ACKNOWLEDGED, RESOLVED
    triggered_at = Column(DateTime, default=datetime.datetime.utcnow)
    recipient_email = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)

    fdr = relationship("FDRRecord", back_populates="reminders")
