import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.ocr_service import OCRService
from app.config import settings

router = APIRouter(prefix="/ocr", tags=["EasyOCR Document Analysis"])

@router.post("/scan")
async def scan_document(
    file: UploadFile = File(...)
):
    """
    Receives an uploaded FDR receipt image/PDF, executes EasyOCR,
    and returns detected fields, confidence scores, and bounding boxes.
    """
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in [".jpg", ".jpeg", ".png", ".webp", ".pdf"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload JPG, PNG, or PDF.")

    unique_filename = f"scan_{uuid.uuid4().hex[:10]}{file_ext}"
    temp_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Run EasyOCR extraction
        ocr_result = OCRService.scan_fdr_document(temp_path)
        ocr_result["temp_file_url"] = f"/uploads/{unique_filename}"
        ocr_result["filename"] = file.filename
        return ocr_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR analysis failed: {str(e)}")

@router.get("/samples")
def get_sample_fdrs():
    """Returns metadata for sample FDR documents bundled with the prototype."""
    return [
        {
            "id": "sample-valid-sbi",
            "name": "State Bank of India — Clean FDR (₹25,00,000)",
            "bank": "State Bank of India",
            "ref": "SBI-884219",
            "amount": 2500000,
            "maturity": "2026-12-31",
            "type": "Clean / Verifiable"
        },
        {
            "id": "sample-discrepancy-pnb",
            "name": "Punjab National Bank — Amount Discrepancy (Doc shows ₹18L vs ₹25L entered)",
            "bank": "Punjab National Bank",
            "ref": "PNB-110782",
            "amount": 1800000,
            "maturity": "2026-11-15",
            "type": "Discrepancy Demo"
        },
        {
            "id": "sample-duplicate-canara",
            "name": "Canara Bank — Duplicate Instrument (Pledged across 2 colleges)",
            "bank": "Canara Bank",
            "ref": "CAN-773101",
            "amount": 3000000,
            "maturity": "2026-10-20",
            "type": "Fraud / Duplicate Demo"
        }
    ]
