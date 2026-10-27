import json
import datetime
from sqlalchemy.orm import Session
from app.models.models import AuditLog

class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        actor_id: str,
        actor_name: str,
        actor_role: str,
        action: str,
        target_type: str,
        target_id: str = None,
        details: any = None,
        ip_address: str = "127.0.0.1"
    ) -> AuditLog:
        if isinstance(details, (dict, list)):
            details_str = json.dumps(details, default=str)
        else:
            details_str = str(details) if details else ""

        entry = AuditLog(
            timestamp=datetime.datetime.utcnow(),
            actor_id=str(actor_id),
            actor_name=actor_name,
            actor_role=actor_role,
            action=action,
            target_type=target_type,
            target_id=str(target_id) if target_id else None,
            details=details_str,
            ip_address=ip_address
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry
