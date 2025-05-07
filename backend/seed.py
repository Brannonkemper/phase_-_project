from backend.app import create_app
from backend.models import db, Pitch  # ✅ import db from models.py
# REMOVE: from backend.db import db ❌

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    pitches = [
        Pitch(name="Old Trafford", location="Donholm", image_url="http://localhost:5000/static/images/Old%20Trafford.jpeg"),
        Pitch(name="Etihad", location="Kahawa West", image_url="http://localhost:5000/static/images/Etihad.jpeg"),
        Pitch(name="Santiago", location="Utawala", image_url="http://localhost:5000/static/images/Santiago.jpeg"),
        Pitch(name="Camp Nou", location="Burburu", image_url="http://localhost:5000/static/images/Camp%20Nou.jpeg"),
        Pitch(name="Stamford", location="Kitengela", image_url="http://localhost:5000/static/images/Stamford.jpeg"),
    ]

    db.session.add_all(pitches)
    db.session.commit()

    print("Database reset and seeded successfully.")
