# ✅ backend/routes/teams.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from backend.models import db, Team

teams = Blueprint('teams', __name__)

@teams.route('/api/teams', methods=['GET'])
def get_teams():
    teams = Team.query.all()
    return jsonify([{'id': t.id, 'name': t.name} for t in teams])

@teams.route('/api/teams', methods=['POST'])
@login_required
def create_team():
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Team name is required'}), 400

    if Team.query.filter_by(name=name).first():
        return jsonify({'error': 'Team already exists'}), 409

    team = Team(name=name)
    db.session.add(team)
    db.session.commit()

    return jsonify({
        'message': 'Team created successfully',
        'team': {'id': team.id, 'name': team.name}
    })
