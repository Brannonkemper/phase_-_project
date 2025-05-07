import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Bookings from './pages/Bookings';
import Pitches from './pages/Pitches';
import Teams from './pages/Teams';

const App = () => {
  const [navKey, setNavKey] = useState(0); // This will force navbar re-render

  const handleLoginLogout = () => {
    setNavKey((prev) => prev + 1); // Just change key to re-render Navbar
  };

  return (
    <Router>
      <Navbar key={navKey} />
      <Routes>
        <Route path="/" element={<Login onLogin={handleLoginLogout} />} />
        <Route path="/login" element={<Login onLogin={handleLoginLogout} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/pitches" element={<Pitches />} />
        <Route path="/teams" element={<Teams />} />
      </Routes>
    </Router>
  );
};

export default App;
