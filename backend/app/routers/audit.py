import io
import csv
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.models.models import AuditLog
from app.schemas.schemas import AuditLogOut

router = APIRouter(prefix="/audit", tags=["Tamper-Evident Audit Trail"])

@router.get("/logs", response_model=List[AuditLogOut])
def get_audit_logs(
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if target_type:
        query = query.filter(AuditLog.target_type == target_type)
    if target_id:
        query = query.filter(AuditLog.target_id == target_id)

    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs

@router.get("/export-csv")
def export_audit_csv(db: Session = Depends(get_db)):
    """Exports entire chronological audit ledger to a downloadable CSV."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp", "Actor ID", "Actor Name", "Actor Role", "Action", "Target Type", "Target ID", "Details", "IP Address"])

    for l in logs:
        writer.writerow([
            l.id,
            l.timestamp.isoformat(),
            l.actor_id,
            l.actor_name,
            l.actor_role,
            l.action,
            l.target_type,
            l.target_id or "",
            l.details or "",
            l.ip_address
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=aicte_fdr_audit_ledger.csv"}
    )
