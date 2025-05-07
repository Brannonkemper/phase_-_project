import React, { useEffect, useState } from 'react';
import './Pitches.css';

function Pitches() {
  const [pitches, setPitches] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/pitches')
      .then((res) => res.json())
      .then((data) => setPitches(data));
  }, []);

  return (
    <div className="pitches-container">
      <h2 className="pitches-title">Available Football Pitches</h2>
      <div className="pitches-grid">
        {pitches.map((pitch) => (
          <div key={pitch.id} className="pitch-card">
            {pitch.image_url && (
              <img src={pitch.image_url} alt={pitch.name} className="pitch-image" />
            )}
            <h3>{pitch.name}</h3>
            <p>{pitch.location}</p>
            <span className="status-tag">Available</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pitches;
