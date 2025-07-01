import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as jwt_decode from "jwt-decode";

interface JwtPayload {
  is_staff: boolean;
  username: string;
}

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username,
        password,
      });

      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      // ✅ Decode the JWT to extract `is_staff`
      const decoded = jwt_decode.jwtDecode<JwtPayload>(accessToken);
      const isAdmin = decoded.is_staff;

      // ✅ Store everything
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('is_admin', String(isAdmin)); // 🔥 This line enables admin UI
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      navigate('/tasks');  // Redirect to dashboard
    } catch (error) {
      alert('Login failed! Check your credentials.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
