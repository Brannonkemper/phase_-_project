# ✅ backend/models.py
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin


db = SQLAlchemy()


team_members = db.Table('team_members',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('team_id', db.Integer, db.ForeignKey('team.id'), primary_key=True)
)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password = db.Column(db.String(200), nullable=False)

    teams = db.relationship('Team', secondary=team_members, back_populates='members')
    bookings = db.relationship('Booking', backref='user', lazy=True)

class Pitch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    location = db.Column(db.String(120), nullable=True)
    image_url = db.Column(db.String(200))

    bookings = db.relationship("Booking", backref="pitch", lazy=True)

class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)

    members = db.relationship('User', secondary=team_members, back_populates='teams')
    bookings = db.relationship("Booking", backref="team", lazy=True)

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pitch_id = db.Column(db.Integer, db.ForeignKey('pitch.id'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    start_time = db.Column(db.String(10), nullable=False)
    end_time = db.Column(db.String(10), nullable=False)

    def overlaps(self, date, start_time, end_time):
        return (
            self.date == date and
            self.start_time < end_time and
            self.end_time > start_time
        )

    def update(self, pitch_id, team_id, date, start_time, end_time):
        self.pitch_id = pitch_id
        self.team_id = team_id
        self.date = date
        self.start_time = start_time
        self.end_time = end_time
