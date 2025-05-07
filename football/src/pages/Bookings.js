// src/components/Bookings.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Bookings.css";

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [formData, setFormData] = useState({
    pitchId: "",
    teamName: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, pitchesRes, userRes] = await Promise.all([
          axios.get("http://localhost:5000/bookings", { withCredentials: true }),
          axios.get("http://localhost:5000/api/pitches"),
          axios.get("http://localhost:5000/api/current_user", { withCredentials: true }),
        ]);
        setBookings(bookingsRes.data);
        setPitches(pitchesRes.data);
        setCurrentUserId(userRes.data.id);
      } catch (err) {
        setError("Failed to load data. Please try again.");
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        pitch_id: formData.pitchId,
        team_name: formData.teamName,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
      };

      if (editingId) {
        // Update
        await axios.put(`http://localhost:5000/bookings/${editingId}`, payload, { withCredentials: true });
        setBookings(prev =>
          prev.map(b => (b.id === editingId
            ? {
                ...b,
                pitch: pitches.find(p => p.id == formData.pitchId)?.name || b.pitch,
                team: formData.teamName,
                date: formData.date,
                start_time: formData.startTime,
                end_time: formData.endTime,
              }
            : b))
        );
        setEditingId(null);
      } else {
        // Create
        const res = await axios.post("http://localhost:5000/bookings", payload, { withCredentials: true });
        setBookings(prev => [
          ...prev,
          {
            id: res.data.booking_id, // Make sure backend sends booking_id
            pitch: pitches.find(p => p.id == formData.pitchId)?.name || "",
            team: formData.teamName,
            date: formData.date,
            start_time: formData.startTime,
            end_time: formData.endTime,
            user_id: currentUserId,
          },
        ]);
      }

      setFormData({
        pitchId: "",
        teamName: "",
        date: "",
        startTime: "",
        endTime: "",
      });
      setError(null);

    } catch (err) {
      const msg = err.response?.data?.message || "Error creating or updating booking.";
      setError(msg);
    }
  };

  const handleEdit = (booking) => {
    setEditingId(booking.id);
    setFormData({
      pitchId: pitches.find(p => p.name === booking.pitch)?.id || "",
      teamName: booking.team,
      date: booking.date,
      startTime: booking.start_time,
      endTime: booking.end_time,
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/bookings/${id}`, { withCredentials: true });
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError("Failed to delete booking.");
    }
  };

  return (
    <div className="bookings">
      <h1>{editingId ? "Edit Booking" : "Book a Pitch"}</h1>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        <select
          value={formData.pitchId}
          onChange={(e) => setFormData({ ...formData, pitchId: e.target.value })}
          required
        >
          <option value="">Select Pitch</option>
          {pitches.map((pitch) => (
            <option key={pitch.id} value={pitch.id}>
              {pitch.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Enter Team Name"
          value={formData.teamName}
          onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
          required
        />
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
        <input
          type="time"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          required
        />
        <input
          type="time"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          required
        />
        <button type="submit" className="btn-submit">
          {editingId ? "Update Booking" : "Book"}
        </button>
      </form>

      <h2>Bookings</h2>
      <table className="booking-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Pitch</th>
            <th>Date</th>
            <th>Time</th>
            <th>Team</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length > 0 ? (
            bookings.map((booking, index) => (
              <tr key={booking.id || index}>
                <td>{booking.id}</td>
                <td>{booking.pitch}</td>
                <td>{booking.date}</td>
                <td>{booking.start_time} - {booking.end_time}</td>
                <td>{booking.team}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(booking)}>
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(booking.id)}
                    disabled={currentUserId !== booking.user_id}
                    title={currentUserId !== booking.user_id ? "You can only delete your own bookings." : ""}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No bookings found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Bookings;
