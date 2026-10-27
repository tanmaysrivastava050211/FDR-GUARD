import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import FDRRecord, EscalationReminder, Institution
from app.services.audit_service import AuditService

class MaturityService:
    @staticmethod
    def calculate_days_to_maturity(maturity_date: datetime.date) -> int:
        today = datetime.date.today()
        delta = maturity_date - today
        return delta.days

    @classmethod
    def evaluate_and_dispatch_reminders(cls, db: Session) -> Dict[str, Any]:
        """
        Scans all active and maturing FDRs, updates status, and triggers policy-based alerts:
        1. 30-Day advance notice
        2. 15-Day urgent renewal prompt
        3. 0-Day maturity notification
        4. Overdue escalation to AICTE Regional Officer
        """
        fdrs = db.query(FDRRecord).filter(
            FDRRecord.administrative_status.in_(["ACTIVE", "MATURING_SOON", "MATURED", "RENEWAL_PENDING"])
        ).all()

        reminders_dispatched = 0
        status_updates = 0
        today = datetime.date.today()

        for fdr in fdrs:
            days = (fdr.maturity_date - today).days

            # Determine updated administrative status
            old_admin_status = fdr.administrative_status
            if days < 0 and fdr.administrative_status not in ["RELEASED", "ENCASHED"]:
                fdr.administrative_status = "MATURED"
            elif 0 <= days <= 30 and fdr.administrative_status not in ["RENEWAL_SUBMITTED", "RELEASE_REQUESTED"]:
                fdr.administrative_status = "MATURING_SOON"

            if old_admin_status != fdr.administrative_status:
                status_updates += 1

            inst = fdr.institution
            recipient_email = inst.contact_email if inst else "registrar@college.edu.in"

            # Check if reminder already triggered today/recently
            existing_today = db.query(EscalationReminder).filter(
                EscalationReminder.fdr_id == fdr.id,
                EscalationReminder.days_left == days
            ).first()

            if not existing_today:
                reminder_type = None
                msg = None

                if days == 30:
                    reminder_type = "30_DAY_ADVANCE"
                    msg = f"ADVANCE NOTICE: FDR {fdr.id} (₹{fdr.amount:,.0f}) matures in 30 days on {fdr.maturity_date}. Please prepare renewal instrument if required."
                elif days == 15:
                    reminder_type = "15_DAY_URGENT"
                    msg = f"URGENT COMPLIANCE: FDR {fdr.id} matures in 15 days. Institutional renewal action required to prevent regulatory non-compliance."
                elif days == 0:
                    reminder_type = "MATURITY_DUE"
                    msg = f"MATURITY ALERT: FDR {fdr.id} has matured today ({fdr.maturity_date}). Please submit replacement FDR or request release."
                elif days < -7 and fdr.administrative_status == "MATURED":
                    reminder_type = "OVERDUE_ESCALATION"
                    msg = f"REGULATORY ESCALATION: FDR {fdr.id} is {abs(days)} days overdue! Escalated to AICTE Regional Directorate for scrutiny."

                if reminder_type and msg:
                    reminder = EscalationReminder(
                        fdr_id=fdr.id,
                        reminder_type=reminder_type,
                        days_left=days,
                        status="DISPATCHED",
                        recipient_email=recipient_email,
                        message=msg
                    )
                    db.add(reminder)
                    reminders_dispatched += 1

                    AuditService.log_event(
                        db=db,
                        actor_id="SYSTEM_CRON",
                        actor_name="AICTE Maturity Engine",
                        actor_role="system",
                        action="DISPATCH_MATURITY_REMINDER",
                        target_type="FDR",
                        target_id=fdr.id,
                        details={"days_left": days, "type": reminder_type, "recipient": recipient_email}
                    )

        db.commit()
        return {
            "evaluated_instruments": len(fdrs),
            "status_transitions": status_updates,
            "reminders_dispatched": reminders_dispatched
        }
