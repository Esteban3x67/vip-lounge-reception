from app import app
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy(app)

class Passenger(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    entry_method = db.Column(db.String(20), nullable=False)  # Priority Pass, Lounge Key, SkyTeam
    airline = db.Column(db.String(50), nullable=False)
    flight_number = db.Column(db.String(20), nullable=False)
    entry_time = db.Column(db.DateTime, default=datetime.utcnow)
    exit_time = db.Column(db.DateTime)
    staff_initials = db.Column(db.String(5), nullable=False)
    status = db.Column(db.String(20), default='active')  # active, checked_out, renewed
    shower_request = db.Column(db.Boolean, default=False)
    shower_entry_time = db.Column(db.DateTime)

class Staff(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    initials = db.Column(db.String(5), nullable=False)
    shift_start = db.Column(db.DateTime, default=datetime.utcnow)
    shift_end = db.Column(db.DateTime)
    active = db.Column(db.Boolean, default=True)

class FlightStatus(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    airline = db.Column(db.String(50), nullable=False)
    flight_number = db.Column(db.String(20), nullable=False)
    scheduled_departure = db.Column(db.DateTime)
    status = db.Column(db.String(20))
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)