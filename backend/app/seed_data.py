import os
import datetime
import json
from sqlalchemy.orm import Session
from app.models.models import (
    User, Institution, FDRRecord, VerificationLog, 
    ReleaseRequest, AuditLog, EscalationReminder
)
from app.config import settings
from PIL import Image, ImageDraw, ImageFont

def generate_sample_fdr_image(filename: str, bank_name: str, ref_no: str, amount_str: str, maturity_str: str, issue_str: str):
    """Generates an authentic looking Fixed Deposit Receipt certificate image for demo and EasyOCR scanning."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        return filepath

    img = Image.new("RGB", (900, 520), color=(252, 252, 254))
    draw = ImageDraw.Draw(img)

    # Decorative border
    draw.rectangle([15, 15, 885, 505], outline=(30, 64, 128), width=3)
    draw.rectangle([22, 22, 878, 498], outline=(200, 160, 60), width=2)

    # Bank Header Bar
    draw.rectangle([25, 25, 875, 85], fill=(22, 45, 90))
    draw.text((45, 42), f"{bank_name.upper()} — FIXED DEPOSIT RECEIPT", fill=(255, 255, 255))
    draw.text((700, 45), "SPECIAL TERM DEPOSIT", fill=(255, 215, 0))

    # Certificate Details
    y = 110
    draw.text((50, y), f"FDR REFERENCE NO: {ref_no}", fill=(20, 20, 30))
    draw.text((520, y), f"DATE OF ISSUE: {issue_str}", fill=(60, 60, 70))

    y += 45
    draw.text((50, y), "BENEFICIARY: MEMBER SECRETARY, AICTE (SECURITY DEPOSIT)", fill=(10, 80, 50))

    y += 45
    draw.text((50, y), "DEPOSITOR: TECHNICAL INSTITUTION FOR REGULATORY COMPLIANCE", fill=(40, 40, 50))

    # Box for Amount & Maturity
    y += 45
    draw.rectangle([50, y, 850, y + 110], fill=(240, 244, 252), outline=(180, 200, 230), width=1)
    draw.text((70, y + 18), "PRINCIPAL DEPOSIT AMOUNT:", fill=(70, 80, 95))
    draw.text((70, y + 48), f"INR {amount_str} /-", fill=(18, 50, 120))

    draw.text((520, y + 18), "DATE OF MATURITY:", fill=(70, 80, 95))
    draw.text((520, y + 48), f"{maturity_str}", fill=(180, 40, 40))

    # Terms & Stamp
    y += 135
    draw.text((50, y), "TENURE: 24 MONTHS | INTEREST RATE: 7.10% P.A. | JOINT LIEN WITH AICTE", fill=(80, 90, 100))
    draw.text((50, y + 30), "Non-transferable security deposit held under AICTE Approval Process Handbook Regulations.", fill=(110, 120, 130))

    # Simulated Bank Seal
    draw.ellipse([670, y - 20, 820, y + 90], outline=(180, 40, 40), width=2)
    draw.text((695, y + 25), "BRANCH MANAGER\nAUTHORIZED SIGN", fill=(180, 40, 40))

    img.save(filepath)
    return filepath

def seed_initial_data(db: Session):
    from app.database import engine, Base
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    if db.query(Institution).count() > 0:
        return

    print("Seeding initial AICTE FDR Portal database...")

    # Generate sample FDR documents
    generate_sample_fdr_image("sample_sbi_26001.png", "State Bank of India", "SBI-884219", "25,00,000", "2026-11-13", "2024-11-13")
    generate_sample_fdr_image("sample_pnb_26002.png", "Punjab National Bank", "PNB-110782", "18,00,000", "2026-11-01", "2024-11-01")
    generate_sample_fdr_image("sample_can_26003.png", "Canara Bank", "CAN-773101", "30,00,000", "2026-10-23", "2024-10-23")
    generate_sample_fdr_image("sample_bob_26004.png", "Bank of Baroda", "BOB-229401", "15,00,000", "2027-02-23", "2025-02-23")
    generate_sample_fdr_image("sample_sbi_26005.png", "State Bank of India", "SBI-884219", "9,00,000", "2026-12-20", "2024-12-20")

    # 1. Institutions
    inst1 = Institution(
        aicte_id="1-10294821",
        name="Delhi Technological Institute",
        state="Delhi",
        city="New Delhi",
        category="Engineering & Technology",
        contact_email="delhi@college.edu.in",
        phone="+91 11 27871018",
        compliance_status="Compliant"
    )
    inst2 = Institution(
        aicte_id="1-39281044",
        name="Aryabhatta College of Engineering",
        state="Karnataka",
        city="Bengaluru",
        category="Engineering & Technology",
        contact_email="aryabhatta@college.edu.in",
        phone="+91 80 23419022",
        compliance_status="Under Scrutiny"
    )
    inst3 = Institution(
        aicte_id="1-55829102",
        name="North Valley Institute of Technology",
        state="Uttarakhand",
        city="Dehradun",
        category="Technical Campus",
        contact_email="northvalley@college.edu.in",
        phone="+91 135 2776001",
        compliance_status="Compliant"
    )
    inst4 = Institution(
        aicte_id="1-88421099",
        name="Saraswati Technical Campus",
        state="Maharashtra",
        city="Pune",
        category="Engineering & Management",
        contact_email="saraswati@college.edu.in",
        phone="+91 20 25679900",
        compliance_status="Compliant"
    )

    db.add_all([inst1, inst2, inst3, inst4])
    db.flush()

    # 2. Users
    user_admin = User(
        email="admin@aicte-india.org",
        hashed_password="demo123",
        full_name="Dr. Rajeshwar Sharma",
        role="admin",
        institution_id=None
    )
    user_officer = User(
        email="officer@aicte-india.org",
        hashed_password="demo123",
        full_name="Pooja Deshmukh",
        role="scrutiny_officer",
        institution_id=None
    )
    user_inst1 = User(
        email="delhi@college.edu.in",
        hashed_password="demo123",
        full_name="Prof. A.K. Verma (Registrar)",
        role="institution",
        institution_id=inst1.id
    )
    user_inst2 = User(
        email="aryabhatta@college.edu.in",
        hashed_password="demo123",
        full_name="Dr. Sunita Rao (Principal)",
        role="institution",
        institution_id=inst2.id
    )

    db.add_all([user_admin, user_officer, user_inst1, user_inst2])
    db.flush()

    today = datetime.date.today()
    d = lambda offset: today + datetime.timedelta(days=offset)

    # 3. FDRs
    fdr1 = FDRRecord(
        id="FDR-26001",
        fdr_number="SBI-884219",
        institution_id=inst1.id,
        issuing_bank="State Bank of India",
        branch_name="Parliament Street Branch, New Delhi",
        ifsc_code="SBIN0000691",
        amount=2500000.0,
        issue_date=d(-712),
        maturity_date=d(18),
        tenure_months=24,
        interest_rate=7.10,
        document_path="sample_sbi_26001.png",
        document_filename="sample_sbi_26001.png",
        verification_status="VERIFIED",
        administrative_status="MATURING_SOON",
        ocr_extracted_data=json.dumps({"extracted_fields": {"bank_name": "State Bank of India", "fdr_number": "SBI-884219", "amount": 2500000.0, "maturity_date": str(d(18))}, "overall_confidence": 0.94}),
        discrepancy_flags=json.dumps([]),
        is_duplicate=False
    )

    fdr2 = FDRRecord(
        id="FDR-26002",
        fdr_number="PNB-110782",
        institution_id=inst2.id,
        issuing_bank="Punjab National Bank",
        branch_name="MG Road Branch, Bengaluru",
        ifsc_code="PUNB0123400",
        amount=1800000.0,
        issue_date=d(-724),
        maturity_date=d(6),
        tenure_months=24,
        interest_rate=6.95,
        document_path="sample_pnb_26002.png",
        document_filename="sample_pnb_26002.png",
        verification_status="SUBMITTED",
        administrative_status="MATURING_SOON",
        ocr_extracted_data=json.dumps({"extracted_fields": {"bank_name": "Punjab National Bank", "fdr_number": "PNB-110782", "amount": 1800000.0, "maturity_date": str(d(6))}, "overall_confidence": 0.91}),
        discrepancy_flags=json.dumps([]),
        is_duplicate=False
    )

    fdr3 = FDRRecord(
        id="FDR-26003",
        fdr_number="CAN-773101",
        institution_id=inst3.id,
        issuing_bank="Canara Bank",
        branch_name="Rajpur Road, Dehradun",
        ifsc_code="CNRB0002044",
        amount=3000000.0,
        issue_date=d(-733),
        maturity_date=d(-3),
        tenure_months=24,
        interest_rate=7.20,
        document_path="sample_can_26003.png",
        document_filename="sample_can_26003.png",
        verification_status="FLAGGED_DISCREPANCY",
        administrative_status="MATURED",
        ocr_extracted_data=json.dumps({"extracted_fields": {"bank_name": "Canara Bank", "fdr_number": "CAN-773101", "amount": 3000000.0, "maturity_date": str(d(-3))}, "overall_confidence": 0.89}),
        discrepancy_flags=json.dumps([
            {"type": "MATURITY_PASSED", "severity": "HIGH", "message": "FDR is 3 days past maturity without an approved renewal record."}
        ]),
        is_duplicate=False
    )

    fdr4 = FDRRecord(
        id="FDR-26004",
        fdr_number="BOB-229401",
        institution_id=inst4.id,
        issuing_bank="Bank of Baroda",
        branch_name="Shivaji Nagar, Pune",
        ifsc_code="BARB0SHIVAJ",
        amount=1500000.0,
        issue_date=d(-120),
        maturity_date=d(610),
        tenure_months=24,
        interest_rate=7.05,
        document_path="sample_bob_26004.png",
        document_filename="sample_bob_26004.png",
        verification_status="VERIFIED",
        administrative_status="ACTIVE",
        ocr_extracted_data=json.dumps({"extracted_fields": {"bank_name": "Bank of Baroda", "fdr_number": "BOB-229401", "amount": 1500000.0, "maturity_date": str(d(610))}, "overall_confidence": 0.95}),
        discrepancy_flags=json.dumps([]),
        is_duplicate=False
    )

    fdr5 = FDRRecord(
        id="FDR-26005",
        fdr_number="SBI-884219",  # Duplicate of FDR-26001!
        institution_id=inst2.id,
        issuing_bank="State Bank of India",
        branch_name="Indiranagar Branch, Bengaluru",
        ifsc_code="SBIN0003344",
        amount=900000.0,
        issue_date=d(-45),
        maturity_date=d(55),
        tenure_months=12,
        interest_rate=6.80,
        document_path="sample_sbi_26005.png",
        document_filename="sample_sbi_26005.png",
        verification_status="FLAGGED_DISCREPANCY",
        administrative_status="ACTIVE",
        ocr_extracted_data=json.dumps({"extracted_fields": {"bank_name": "State Bank of India", "fdr_number": "SBI-884219", "amount": 900000.0, "maturity_date": str(d(55))}, "overall_confidence": 0.88}),
        discrepancy_flags=json.dumps([
            {"type": "DUPLICATE_INSTRUMENT_FOUND", "severity": "CRITICAL", "message": "CRITICAL: FDR reference SBI-884219 is already pledged under FDR-26001 (Delhi Technological Institute)!"}
        ]),
        is_duplicate=True,
        duplicate_of_fdr_id="FDR-26001"
    )

    db.add_all([fdr1, fdr2, fdr3, fdr4, fdr5])
    db.flush()

    # 4. Verification Logs
    vlog1 = VerificationLog(
        fdr_id=fdr1.id,
        officer_name="Pooja Deshmukh",
        officer_role="scrutiny_officer",
        action="MANUAL_VERIFY",
        previous_status="AUTO_CHECKED_CLEAN",
        new_status="VERIFIED",
        remarks="Bank confirmation obtained via SBI Institutional Portal. Valid security deposit lien verified.",
        discrepancies_noted=json.dumps([])
    )
    vlog5 = VerificationLog(
        fdr_id=fdr5.id,
        officer_name="AICTE Automated Engine",
        officer_role="system",
        action="AUTO_EASYOCR_SCAN",
        previous_status="SUBMITTED",
        new_status="FLAGGED_DISCREPANCY",
        remarks="CRITICAL: Duplicate FDR reference detected. Pledged in active record FDR-26001.",
        discrepancies_noted=fdr5.discrepancy_flags
    )
    db.add_all([vlog1, vlog5])

    # 5. Release Request
    rel1 = ReleaseRequest(
        id="REL-26001",
        fdr_id=fdr3.id,
        institution_id=inst3.id,
        reason="Institution autonomous university transition and revised state corpus replacement.",
        bank_account_no="399102948210",
        bank_name="Canara Bank",
        ifsc_code="CNRB0002044",
        supporting_doc_name="Autonomous_Status_Gazette_NOC.pdf",
        status="UNDER_SCRUTINY",
        scrutinized_by="Pooja Deshmukh",
        official_remarks="Under scrutiny by Finance Committee. Awaiting No-Objection from Regional Office."
    )
    db.add(rel1)

    # 6. Audit Trail
    audit1 = AuditLog(
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=5),
        actor_id="SYS-INIT",
        actor_name="AICTE Core Engine",
        actor_role="system",
        action="PORTAL_INITIALIZATION",
        target_type="SYSTEM",
        target_id="AICTE-HQ",
        details="Security Deposit & FDR Management System initialized with EasyOCR engine.",
        ip_address="127.0.0.1"
    )
    audit2 = AuditLog(
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
        actor_id="OFFICER-02",
        actor_name="Pooja Deshmukh",
        actor_role="scrutiny_officer",
        action="VERIFIED_INSTRUMENT",
        target_type="FDR",
        target_id=fdr1.id,
        details="Marked FDR-26001 as Verified following bank lien verification.",
        ip_address="192.168.1.10"
    )
    audit3 = AuditLog(
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=35),
        actor_id=str(inst3.id),
        actor_name="North Valley Registrar",
        actor_role="institution",
        action="CREATE_RELEASE_REQUEST",
        target_type="RELEASE",
        target_id=rel1.id,
        details="Submitted deposit refund application for FDR-26003.",
        ip_address="10.20.4.15"
    )
    db.add_all([audit1, audit2, audit3])

    db.commit()
    print("Database successfully seeded with realistic institutions, FDRs, duplicate detection, and audit entries.")

if __name__ == "__main__":
    from app.database import SessionLocal
    db = SessionLocal()
    seed_initial_data(db)
    db.close()
