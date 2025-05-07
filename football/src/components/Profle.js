import { useEffect, useState } from 'react';
import axios from '../axiosConfig'; // Import the axios instance with interceptors

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user profile data from the backend
    axios.get('http://localhost:5000/api/profile')
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
      });
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.username}'s Profile</h1>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default Profile;
