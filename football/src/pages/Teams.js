// ✅ src/components/Teams.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Teams.css';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [joinedTeams, setJoinedTeams] = useState([]);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, teamsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/current_user', { withCredentials: true }),
          axios.get('http://localhost:5000/api/teams', { withCredentials: true })
        ]);

        setUserId(userRes.data.id);
        setUsername(userRes.data.username);
        setTeams(teamsRes.data.teams);
        setJoinedTeams(teamsRes.data.user_teams || []);
      } catch (err) {
        console.error("Failed to fetch teams or user info.", err);
      }
    };
    fetchData();
  }, []);

  const joinTeam = async (teamId) => {
    try {
      await axios.post(`http://localhost:5000/api/teams/${teamId}/join`, {}, { withCredentials: true });
      setJoinedTeams([...joinedTeams, teamId]);
      setTeams(prev =>
        prev.map(team =>
          team.id === teamId
            ? { ...team, member_count: team.member_count + 1, members: [...team.members, username] }
            : team
        )
      );
    } catch (err) {
      alert('Failed to join team. It might already be full or you are already a member.');
    }
  };

  const leaveTeam = async (teamId) => {
    try {
      await axios.post(`http://localhost:5000/api/teams/${teamId}/leave`, {}, { withCredentials: true });
      setJoinedTeams(joinedTeams.filter((id) => id !== teamId));
      setTeams(prev =>
        prev.map(team =>
          team.id === teamId
            ? { ...team, member_count: team.member_count - 1, members: team.members.filter(member => member !== username) }
            : team
        )
      );
    } catch (err) {
      alert('Failed to leave team.');
    }
  };

  return (
    <div className="teams-container">
      <h2>All Teams</h2>
      <div className="teams-list">
        {teams.map((team) => (
          <div key={team.id} className="team-card">
            <h3>{team.name}</h3>
            <p>{team.member_count} / 20 members</p>
            <div className="team-members">
              {team.members && team.members.length > 0 ? (
                <ul>
                  {team.members.map((member, idx) => (
                    <li key={idx}>{member}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-members">No members yet</p>
              )}
            </div>
            {joinedTeams.includes(team.id) ? (
              <button onClick={() => leaveTeam(team.id)}>Leave Team</button>
            ) : (
              team.member_count < 20 ? (
                <button onClick={() => joinTeam(team.id)}>Join Team</button>
              ) : (
                <button disabled>Team Full</button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;
