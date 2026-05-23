from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class SmartMeter(Base):
    __tablename__ = "smart_meters"
    
    id = Column(String, primary_key=True, index=True)
    location = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    status = Column(String, default="normal") # normal, suspicious, confirmed
    installed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    readings = relationship("MeterReading", back_populates="meter", cascade="all, delete-orphan")

class MeterReading(Base):
    __tablename__ = "meter_readings"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    meter_id = Column(String, ForeignKey("smart_meters.id"), index=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    
    voltage = Column(Float) # V
    current = Column(Float) # A
    power = Column(Float) # kW
    
    is_anomalous = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0)
    
    # Relationships
    meter = relationship("SmartMeter", back_populates="readings")

class GridNode(Base):
    __tablename__ = "grid_nodes"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    type = Column(String) # substation, transformer, renewable, storage, meter
    lat = Column(Float)
    lng = Column(Float)
    status = Column(String) # online, warning, critical, offline
    capacity_mw = Column(Float)
    current_load_mw = Column(Float)
