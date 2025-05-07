from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from backend.models import db, User, Pitch, Team, Booking, team_members
from backend.db import migrate
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import and_
import os

def create_app():
    app = Flask(__name__)
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, '..', 'instance', 'pitches.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'secret'
    CORS(app, supports_credentials=True)

    db.init_app(app)
    migrate.init_app(app, db)

    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # -------------------- AUTH ROUTES --------------------

    @app.route('/register', methods=['POST'])
    def register():
        data = request.json
        hashed_pw = generate_password_hash(data['password'])
        user = User(username=data['username'], email=data.get('email'), password=hashed_pw)
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully'})

    @app.route('/login', methods=['POST'])
    def login():
        data = request.json
        user = User.query.filter_by(username=data['username']).first()
        if user and check_password_hash(user.password, data['password']):
            login_user(user)
            return jsonify({'message': 'Login successful'})
        return jsonify({'message': 'Invalid credentials'}), 401

    @app.route('/logout', methods=['POST'])
    @login_required
    def logout():
        logout_user()
        return jsonify({'message': 'Logged out'})

    @app.route('/api/current_user', methods=['GET'])
    def get_current_user():
        if current_user.is_authenticated:
            return jsonify({'username': current_user.username, 'id': current_user.id})
        else:
            return jsonify({'message': 'Not logged in'}), 401

    # -------------------- PITCH ROUTES --------------------

    @app.route('/api/pitches', methods=['GET'])
    def get_pitches():
        pitches = Pitch.query.all()
        return jsonify([{
            'id': p.id,
            'name': p.name,
            'image_url': p.image_url,
            'location': p.location
        } for p in pitches])

    # -------------------- BOOKING ROUTES --------------------

    @app.route('/bookings', methods=['GET'])
    @login_required
    def get_bookings():
        bookings = Booking.query.all()
        return jsonify([
            {
                'id': b.id,
                'pitch': b.pitch.name,
                'team': b.team.name,
                'date': b.date,
                'start_time': b.start_time,
                'end_time': b.end_time,
                'user_id': b.user_id
            } for b in bookings
        ])

    @app.route('/bookings', methods=['POST'])
    @login_required
    def create_booking():
        data = request.json

        conflict = Booking.query.filter(
            Booking.pitch_id == data['pitch_id'],
            Booking.date == data['date'],
            and_(
                Booking.start_time < data['end_time'],
                Booking.end_time > data['start_time']
            )
        ).first()

        if conflict:
            return jsonify({
                'message': f"Pitch already booked from {conflict.start_time} to {conflict.end_time} on {conflict.date}"
            }), 400

        team = Team.query.filter_by(name=data['team_name']).first()
        if not team:
            team = Team(name=data['team_name'])
            db.session.add(team)
            db.session.commit()

        booking = Booking(
            pitch_id=data['pitch_id'],
            team_id=team.id,
            user_id=current_user.id,
            date=data['date'],
            start_time=data['start_time'],
            end_time=data['end_time']
        )
        db.session.add(booking)
        db.session.commit()

        return jsonify({'message': 'Booking created', 'booking_id': booking.id, 'team_id': team.id})

    @app.route('/bookings/<int:booking_id>', methods=['PUT'])
    @login_required
    def update_booking(booking_id):
        booking = Booking.query.get_or_404(booking_id)
        if booking.user_id != current_user.id:
            return jsonify({'message': 'Unauthorized'}), 403

        data = request.get_json()

        conflict = Booking.query.filter(
            Booking.id != booking.id,
            Booking.pitch_id == data['pitch_id'],
            Booking.date == data['date'],
            and_(
                Booking.start_time < data['end_time'],
                Booking.end_time > data['start_time']
            )
        ).first()

        if conflict:
            return jsonify({'message': f"Pitch already booked from {conflict.start_time} to {conflict.end_time} on {conflict.date}"}), 400

        team = Team.query.filter_by(name=data['team_name']).first()
        if not team:
            team = Team(name=data['team_name'])
            db.session.add(team)
            db.session.commit()

        booking.pitch_id = data['pitch_id']
        booking.team_id = team.id
        booking.date = data['date']
        booking.start_time = data['start_time']
        booking.end_time = data['end_time']

        db.session.commit()

        return jsonify({'message': 'Booking updated successfully'})

    @app.route('/bookings/<int:booking_id>', methods=['DELETE'])
    @login_required
    def delete_booking(booking_id):
        booking = Booking.query.get_or_404(booking_id)
        if booking.user_id != current_user.id:
            return jsonify({'message': 'Unauthorized'}), 403

        team = booking.team

        db.session.delete(booking)
        db.session.commit()

        # Check if the team has any more bookings
        if Booking.query.filter_by(team_id=team.id).count() == 0:
            db.session.delete(team)
            db.session.commit()

        return jsonify({'message': 'Booking and possibly team deleted successfully'})

    # -------------------- TEAM ROUTES --------------------

    @app.route('/api/teams', methods=['GET'])
    @login_required
    def get_teams():
        all_teams = Team.query.all()
        user_teams = [team.id for team in current_user.teams]

        return jsonify({
            'teams': [
                {
                    'id': team.id,
                    'name': team.name,
                    'member_count': len(team.members),
                    'members': [user.username for user in team.members]
                }
                for team in all_teams
            ],
            'user_teams': user_teams
        })

    @app.route('/api/teams/<int:team_id>/join', methods=['POST'])
    @login_required
    def join_team(team_id):
        team = Team.query.get_or_404(team_id)
        if current_user in team.members:
            return jsonify({'message': 'Already a member'}), 400
        if len(team.members) >= 20:
            return jsonify({'message': 'Team is full'}), 400
        team.members.append(current_user)
        db.session.commit()
        return jsonify({'message': 'Joined team'})

    @app.route('/api/teams/<int:team_id>/leave', methods=['POST'])
    @login_required
    def leave_team(team_id):
        team = Team.query.get_or_404(team_id)
        if current_user in team.members:
            team.members.remove(current_user)
            db.session.commit()
            return jsonify({'message': 'Left team'})
        return jsonify({'message': 'Not a member of team'}), 400

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
