import asyncio
import os
import random
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
import pandas as pd
from dotenv import load_dotenv

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models import Base, SmartMeter, MeterReading, GridNode
from app.config import get_settings

load_dotenv()
settings = get_settings()

engine = create_async_engine(settings.database_url, echo=False)
async_session = async_sessionmaker(engine, expire_on_commit=False)

def generate_mock_data():
    print("Generating mock data in memory...")
    now = datetime.now(timezone.utc)
    
    # 1. Generate Meters
    meters = []
    locations = ["Connaught Place", "Karol Bagh", "Lajpat Nagar", "Dwarka Sec 12", "Rohini Sec 7"]
    for i in range(100):
        meters.append({
            "id": f"MTR-{1000+i}",
            "location": random.choice(locations),
            "lat": 28.6139 + random.uniform(-0.05, 0.05),
            "lng": 77.2090 + random.uniform(-0.05, 0.05),
            "status": "normal",
            "installed_at": now - timedelta(days=random.randint(100, 1000))
        })
        
    # 2. Generate Readings (last 24 hours, every 15 minutes)
    readings = []
    for m in meters:
        # Determine if this meter is stealing power
        is_thief = random.random() < 0.05 
        if is_thief:
            m["status"] = "suspicious"
            
        for h in range(24):
            for m_min in [0, 15, 30, 45]:
                time_offset = timedelta(hours=24-h, minutes=m_min)
                reading_time = now - time_offset
                
                # Base consumption
                hour = reading_time.hour
                demand_factor = 0.5 + 0.5 * math.sin(math.pi * (hour - 4) / 12) if 4 <= hour <= 22 else 0.35
                
                voltage = random.uniform(220, 240)
                current = random.uniform(5, 20) * demand_factor
                
                if is_thief and hour > 18:
                    # Voltage drop, huge current bypassing meter (anomaly)
                    voltage -= random.uniform(15, 30)
                    current += random.uniform(20, 50)
                    
                power = (voltage * current * 0.9) / 1000 # kW
                
                readings.append({
                    "meter_id": m["id"],
                    "timestamp": reading_time,
                    "voltage": voltage,
                    "current": current,
                    "power": power,
                    "is_anomalous": False,
                    "anomaly_score": 0.0
                })
                
    # 3. Generate Grid Nodes
    nodes = []
    node_types = ["substation", "transformer", "renewable", "storage"]
    for i in range(50):
        t = random.choice(node_types)
        nodes.append({
            "id": f"NODE-{5000+i}",
            "name": f"{t.capitalize()} Alpha-{i}",
            "type": t,
            "lat": 28.6139 + random.uniform(-0.1, 0.1),
            "lng": 77.2090 + random.uniform(-0.1, 0.1),
            "status": "online" if random.random() > 0.1 else "warning",
            "capacity_mw": random.uniform(50, 500),
            "current_load_mw": random.uniform(10, 200)
        })
        
    return meters, readings, nodes

import math

async def seed_db():
    print("Connecting to database...")
    async with engine.begin() as conn:
        print("Dropping existing tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
        
    meters_data, readings_data, nodes_data = generate_mock_data()
    
    print("Inserting data into PostgreSQL...")
    async with async_session() as session:
        # Insert nodes
        nodes = [GridNode(**n) for n in nodes_data]
        session.add_all(nodes)
        
        # Insert meters
        meters = [SmartMeter(**m) for m in meters_data]
        session.add_all(meters)
        
        # Insert readings
        readings = [MeterReading(**r) for r in readings_data]
        session.add_all(readings)
        
        await session.commit()
        
    print("Database seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_db())
