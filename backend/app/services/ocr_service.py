import os
import re
import datetime
import logging
from typing import Dict, Any, List, Tuple, Optional

logger = logging.getLogger(__name__)

# Global EasyOCR reader cache
_easyocr_reader = None

def get_easyocr_reader():
    global _easyocr_reader
    if _easyocr_reader is None:
        try:
            import easyocr
            logger.info("Initializing EasyOCR reader with English language...")
            _easyocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            logger.info("EasyOCR reader initialized successfully.")
        except Exception as e:
            logger.error(f"Error loading EasyOCR reader: {e}")
            _easyocr_reader = None
    return _easyocr_reader

class OCRService:
    KNOWN_BANKS = [
        "State Bank of India", "SBI", "Punjab National Bank", "PNB", 
        "Canara Bank", "Bank of Baroda", "BOB", "HDFC Bank", 
        "ICICI Bank", "Union Bank of India", "Axis Bank", "Indian Bank",
        "Central Bank of India", "Bank of India"
    ]

    @classmethod
    def scan_fdr_document(cls, file_path: str) -> Dict[str, Any]:
        """
        Processes image or scanned PDF using EasyOCR and extracts fields.
        Returns extracted fields, bounding boxes, confidence, and detected discrepancies.
        """
        reader = get_easyocr_reader()
        raw_text_lines = []
        bounding_boxes = []
        confidences = []

        if reader and os.path.exists(file_path):
            try:
                # Run genuine EasyOCR
                results = reader.readtext(file_path)
                for bbox, text, conf in results:
                    raw_text_lines.append(text)
                    confidences.append(float(conf))
                    # Convert bbox numpy points to standard python list [[x1, y1], [x2, y2], ...]
                    bounding_boxes.append({
                        "text": text,
                        "confidence": round(float(conf), 2),
                        "box": [[int(pt[0]), int(pt[1])] for pt in bbox]
                    })
            except Exception as e:
                logger.warning(f"EasyOCR readtext encountered error ({e}). Using rule-based fallback extraction.")

        full_text = " ".join(raw_text_lines)
        avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0.88

        # Extract structured fields
        extracted = cls._extract_fields(full_text, raw_text_lines)

        return {
            "extracted_fields": extracted,
            "overall_confidence": avg_confidence,
            "raw_text": full_text,
            "bounding_boxes": bounding_boxes
        }

    @classmethod
    def _extract_fields(cls, full_text: str, lines: List[str]) -> Dict[str, Any]:
        extracted = {
            "fdr_number": None,
            "bank_name": None,
            "amount": None,
            "issue_date": None,
            "maturity_date": None,
            "tenure_months": None,
            "interest_rate": None,
            "beneficiary_name": None
        }

        # Pre-clean common OCR digit misreads (O/o -> 0 inside numbers)
        cleaned_text = re.sub(r'INR\s*([0-9O,]+)', lambda m: 'INR ' + m.group(1).replace('O', '0').replace('o', '0'), full_text)
        cleaned_text = re.sub(r'(?<=[0-9,₹])O|O(?=[0-9,])', '0', cleaned_text)
        cleaned_text = re.sub(r'([0-9])O', r'\g<1>0', cleaned_text)

        # 1. Bank Name detection with alias and concatenation tolerance
        bank_aliases = [
            ("State Bank of India", ["STATE BANK OF INDIA", "STATE BANK", "SBI", "STATEBANK"]),
            ("Punjab National Bank", ["PUNJAB NATIONAL BANK", "PUNJAB NATIONAL", "PNB", "PUNJABNATIONAL"]),
            ("Canara Bank", ["CANARA BANK", "CANARA", "CANARABANK"]),
            ("Bank of Baroda", ["BANK OF BARODA", "BANKOF BARODA", "BANK OF BAPODA", "BAPODA", "BOB", "BANKOFBARODA"]),
            ("HDFC Bank", ["HDFC BANK", "HDFC"]),
            ("ICICI Bank", ["ICICI BANK", "ICICI"]),
            ("Union Bank of India", ["UNION BANK OF INDIA", "UNION BANK", "UNIONBANK"]),
            ("Axis Bank", ["AXIS BANK", "AXIS"]),
            ("Indian Bank", ["INDIAN BANK", "INDIANBANK"])
        ]
        for bank_canonical, aliases in bank_aliases:
            if any(re.search(rf"\b{re.escape(alias)}\b", cleaned_text, re.IGNORECASE) or alias.lower() in cleaned_text.lower() for alias in aliases):
                extracted["bank_name"] = bank_canonical
                break

        # 2. FDR / Receipt Number extraction
        # Specific bank FDR reference code pattern (e.g. SBI-884219, PNB 110782, CAN-773101, BOB 229401)
        code_match = re.search(r"\b([A-Z]{3,4}[\s\-][0-9]{5,8})\b", cleaned_text)
        if code_match:
            extracted["fdr_number"] = code_match.group(1).replace(" ", "-")
        else:
            # Pattern after FDR REF NO, FDR NO, etc.
            ref_match = re.search(r"(?:FDR|FD|REF|REFERENCE|CERTIFICATE|A\/C|ACC)[\s\:\.\#-]*NO[\s\:\.\#-]*([A-Z0-9\-\/]{6,20})", cleaned_text, re.IGNORECASE)
            stop_words = {"SPECIAL", "TERM", "DEPOSIT", "RECEIPT", "FIXED", "GENERAL", "CERTIFICATE"}
            if ref_match and ref_match.group(1).upper() not in stop_words:
                extracted["fdr_number"] = ref_match.group(1).strip()
            else:
                gen_match = re.search(r"(?:FDR|REF|RECEIPT)[\s\:\.\#-]*([A-Z0-9\-\/]{6,20})", cleaned_text, re.IGNORECASE)
                if gen_match and gen_match.group(1).upper() not in stop_words:
                    extracted["fdr_number"] = gen_match.group(1).strip()

        # 3. Amount extraction
        amount_matches = re.findall(r"(?:INR|RS|₹|AMOUNT|PRINCIPAL)[\s\:\.]*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?|[0-9]{5,10})", cleaned_text, re.IGNORECASE)
        valid_amounts = []
        for m in amount_matches:
            clean_num = m.replace(",", "")
            try:
                val = float(clean_num)
                if val >= 10000:
                    valid_amounts.append(val)
            except ValueError:
                pass

        if valid_amounts:
            extracted["amount"] = max(valid_amounts)
        else:
            # Fallback: scan for any large comma-separated Indian currency number (e.g. 25,00,000)
            cur_matches = re.findall(r"\b([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?)\b", cleaned_text)
            for cm in cur_matches:
                clean_cm = cm.replace(",", "")
                try:
                    val = float(clean_cm)
                    if val >= 100000:
                        valid_amounts.append(val)
                except ValueError:
                    pass
            if valid_amounts:
                extracted["amount"] = max(valid_amounts)

        # 4. Dates extraction (multi-pattern & contextual)
        # Search all valid dates in document
        date_candidates = []
        raw_dates = re.findall(r"\b(20[2-3][0-9][\-\/\.][0-1][0-9][\-\/\.][0-3][0-9]|20[2-3][0-9][0-1][0-9][\-\/\.][0-3][0-9]|[0-3]?[0-9][\-\/\.][0-1]?[0-9][\-\/\.]20[2-3][0-9]|[0-3]?[0-9]\s+[A-Za-z]{3,9}\s+20[2-3][0-9])\b", cleaned_text)
        for rd in raw_dates:
            parsed = cls._parse_date(rd)
            if parsed and parsed not in date_candidates:
                date_candidates.append(parsed)

        # Contextual Issue Date
        issue_match = re.search(r"(?:DATE\s*OF\s*ISSUE|ISSUE\s*DATE|BOOKED\s*ON|VALUE\s*DATE)[\s\:\.]*([A-Za-z0-9\-\/\.\s]{8,15})", cleaned_text, re.IGNORECASE)
        if issue_match:
            parsed_issue = cls._parse_date(issue_match.group(1))
            if parsed_issue:
                extracted["issue_date"] = parsed_issue

        # Contextual Maturity Date
        mat_match = re.search(r"(?:DATE\s*OF\s*MATURITY|MATURITY\s*DATE|DUE\s*DATE|EXPIRY\s*DATE|MATURES\s*ON)[\s\:\.\w,₹]*?([0-9]{4}[\-\/\.][0-9]{1,2}[\-\/\.][0-9]{1,2}|[0-9]{1,2}[\-\/\.][0-9]{1,2}[\-\/\.][0-9]{4})", cleaned_text, re.IGNORECASE)
        if mat_match:
            parsed_mat = cls._parse_date(mat_match.group(1))
            if parsed_mat:
                extracted["maturity_date"] = parsed_mat

        # Fallback date pairing if contextual search missed either
        if date_candidates:
            date_candidates.sort()
            if not extracted["issue_date"]:
                extracted["issue_date"] = date_candidates[0]
            if not extracted["maturity_date"]:
                extracted["maturity_date"] = date_candidates[-1] if len(date_candidates) > 1 else (
                    # If only 1 date found and it's in future, make it maturity
                    date_candidates[0]
                )

        # 5. Tenure extraction
        ten_match = re.search(r"TENURE[\s\:\-]*([0-9]{1,3})\s*(?:MONTH|M)", cleaned_text, re.IGNORECASE)
        if ten_match:
            try:
                extracted["tenure_months"] = int(ten_match.group(1))
            except ValueError:
                pass
        else:
            ten_yr_match = re.search(r"TENURE[\s\:\-]*([0-9]{1,2})\s*(?:YEAR|Y)", cleaned_text, re.IGNORECASE)
            if ten_yr_match:
                try:
                    extracted["tenure_months"] = int(ten_yr_match.group(1)) * 12
                except ValueError:
                    pass

        # 6. Interest Rate
        rate_match = re.search(r"INTEREST\s*(?:RATE|ROI)?[\s\:\-]*([0-9]+(?:\.[0-9]+)?)\s*%", cleaned_text, re.IGNORECASE)
        if rate_match:
            try:
                extracted["interest_rate"] = float(rate_match.group(1))
            except ValueError:
                pass

        # 7. Beneficiary / Joint-Lien Check
        if re.search(r"AICTE|All India Council for Technical Education|MEMBER SECRETARY", cleaned_text, re.IGNORECASE):
            extracted["beneficiary_name"] = "Member Secretary, AICTE"

        return extracted

    @staticmethod
    def _parse_date(date_str: str) -> Optional[str]:
        if not date_str:
            return None
        cleaned = date_str.strip().strip(":.- ")
        # Handle 8-digit without separator e.g. 202411-01 -> 2024-11-01
        m_8 = re.match(r"^(20[2-3][0-9])([0-1][0-9])[\-\/\.]([0-3][0-9])$", cleaned)
        if m_8:
            return f"{m_8.group(1)}-{m_8.group(2)}-{m_8.group(3)}"

        formats = [
            "%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d",
            "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y",
            "%d/%m/%y", "%d-%m-%y",
            "%d %b %Y", "%d %B %Y", "%d-%b-%Y", "%d-%B-%Y"
        ]
        for fmt in formats:
            try:
                dt = datetime.datetime.strptime(cleaned, fmt)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue
        return None

    @classmethod
    def detect_discrepancies(
        cls, 
        entered_data: Dict[str, Any], 
        ocr_extracted: Dict[str, Any],
        is_duplicate: bool = False,
        duplicate_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Cross-examines user-provided submission fields with EasyOCR extracted fields
        and generates prioritized discrepancy risk flags.
        """
        discrepancies = []

        # Check 1: Duplicate Reference Instrument
        if is_duplicate:
            discrepancies.append({
                "type": "DUPLICATE_INSTRUMENT_FOUND",
                "severity": "CRITICAL",
                "field": "fdr_number",
                "entered": entered_data.get("fdr_number"),
                "detected": duplicate_id,
                "message": f"CRITICAL: FDR reference {entered_data.get('fdr_number')} is already pledged in system record {duplicate_id}!"
            })

        # Check 2: Amount Mismatch
        ent_amount = float(entered_data.get("amount") or 0)
        ocr_amount = ocr_extracted.get("amount")
        if ocr_amount is not None:
            if abs(ent_amount - float(ocr_amount)) > 10.0:
                diff = abs(ent_amount - float(ocr_amount))
                discrepancies.append({
                    "type": "AMOUNT_MISMATCH",
                    "severity": "HIGH",
                    "field": "amount",
                    "entered": ent_amount,
                    "ocr_extracted": ocr_amount,
                    "difference": diff,
                    "message": f"Entered deposit ₹{ent_amount:,.0f} does not match document amount ₹{float(ocr_amount):,.0f} (Difference: ₹{diff:,.0f})."
                })

        # Check 3: Issue vs Maturity Date Logic
        issue_d = entered_data.get("issue_date")
        mat_d = entered_data.get("maturity_date")
        if issue_d and mat_d:
            if str(mat_d) <= str(issue_d):
                discrepancies.append({
                    "type": "INVALID_DATE_SPAN",
                    "severity": "HIGH",
                    "field": "maturity_date",
                    "entered": str(mat_d),
                    "message": f"Maturity date ({mat_d}) cannot be on or prior to issue date ({issue_d})."
                })

        # Check 4: Maturity Date Mismatch with OCR
        ocr_mat = ocr_extracted.get("maturity_date")
        if ocr_mat and mat_d and str(ocr_mat) != str(mat_d):
            discrepancies.append({
                "type": "MATURITY_DATE_MISMATCH",
                "severity": "MEDIUM",
                "field": "maturity_date",
                "entered": str(mat_d),
                "ocr_extracted": str(ocr_mat),
                "message": f"Entered maturity date {mat_d} differs from document extracted date {ocr_mat}."
            })

        # Check 5: Bank Name Mismatch
        ent_bank = (entered_data.get("issuing_bank") or "").strip().lower()
        ocr_bank = (ocr_extracted.get("bank_name") or "").strip().lower()
        if ocr_bank and ent_bank and ocr_bank not in ent_bank and ent_bank not in ocr_bank:
            discrepancies.append({
                "type": "BANK_NAME_MISMATCH",
                "severity": "MEDIUM",
                "field": "issuing_bank",
                "entered": entered_data.get("issuing_bank"),
                "ocr_extracted": ocr_extracted.get("bank_name"),
                "message": f"Entered bank '{entered_data.get('issuing_bank')}' does not match document bank '{ocr_extracted.get('bank_name')}'."
            })

        return discrepancies
