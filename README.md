# ⚽ Football Pitch Booking System

A full-stack web application that allows users to register, log in, and book football pitches. This project uses **Flask** for the backend and **React** for the frontend. Authentication is managed through **Flask-Login** with session-based handling.

---

## 📌 Features

- 🔐 User registration and login
- ⚽ View available pitches
- 📅 Book a pitch by selecting date and time
- 🧾 View all bookings
- ✏️ Update or delete your own bookings
- ❌ Cannot edit or delete others' bookings
- 🧑‍🤝‍🧑 Teams support (planned: many-to-many relationships)

---

## 🛠️ Tech Stack

### Frontend:
- React (Vite or Create React App)
- `react-router-dom`
- Axios (direct usage)
- Plain CSS

### Backend:
- Python Flask
- Flask-Login
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-CORS
- SQLite (development)

---

## 📁 Project Structure


---

## 🧰 Backend Setup

1. **Navigate to backend**:
```bash
cd backend

python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install flask flask_sqlalchemy flask_migrate flask_cors flask_login

flask db init
flask db migrate
flask db upgrade

flask run



💻 Frontend Setup

cd football

npm install

npm start
