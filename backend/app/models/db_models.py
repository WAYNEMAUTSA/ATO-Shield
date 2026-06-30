import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
# 1. Added DeclarativeBase here:
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase 

# 2. REMOVED: from app.db.session import Base

# 3. Create Base natively here:
class Base(DeclarativeBase):
    pass

def gen_uuid() -> str:
    return str(uuid.uuid4())

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)

    user_id: Mapped[str] = mapped_column(String, index=True)
    amount: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String, default="USD")

    location_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_lon: Mapped[float | None] = mapped_column(Float, nullable=True)

    device_id: Mapped[str | None] = mapped_column(String, nullable=True)
    network_fingerprint: Mapped[str | None] = mapped_column(String, nullable=True)
    merchant_category: Mapped[str | None] = mapped_column(String, nullable=True)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    verdict: Mapped["Verdict"] = relationship(
        back_populates="transaction", uselist=False, cascade="all, delete-orphan"
    )


class Verdict(Base):
    __tablename__ = "verdicts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)

    transaction_id: Mapped[str] = mapped_column(
        String, ForeignKey("transactions.id"), unique=True
    )

    tier1_score: Mapped[float] = mapped_column(Float)
    tier2_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    zone: Mapped[str] = mapped_column(String)
    final_risk_score: Mapped[float] = mapped_column(Float)

    action: Mapped[str] = mapped_column(String)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    transaction: Mapped["Transaction"] = relationship(back_populates="verdict")


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)

    user_id: Mapped[str] = mapped_column(String, index=True)
    device_id: Mapped[str] = mapped_column(String, index=True)
    is_trusted: Mapped[bool] = mapped_column(default=False)
    first_seen: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_seen: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
