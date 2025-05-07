import React from 'react';
import './Home.css';
import { FaTwitter, FaInstagram, FaTiktok } from 'react-icons/fa';



function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <img src="/Images/pitch (2).jpeg" alt="Football Pitch" className="background-image" />
        <div className="overlay-text">
          <h1>Kemper Football Pitch Booking</h1>
          <p>Book your pitch. Play your game. Anytime, anywhere.</p>
        </div>
      </div>

      <footer className="footer">
        <p>
          Kemper Football Pitch Booking lets you easily reserve football pitches, manage your team, and track your game history — all in one place.
        </p>
        <div className="social-links">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter size={24} /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram size={24} /></a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"><FaTiktok size={24} /></a>
        </div>
      </footer>
    </div>
  );
}

export default Home;
