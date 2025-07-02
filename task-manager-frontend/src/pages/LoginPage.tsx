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
      localStorage.setItem("username", decoded.username); // Store username
      const isAdmin = decoded.is_staff;

      // ✅ Store everything
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('is_admin', String(isAdmin)); // 🔥 This line enables admin UI
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      navigate('/dashboard');  // Redirect to dashboard
    } catch (error) {
      alert('Login failed! Check your credentials.');
    }
  };

  // return (
  //   <div>
  //     <h2>Login</h2>
  //     <form onSubmit={handleLogin}>
  //       <input
  //         type="text"
  //         placeholder="Username"
  //         value={username}
  //         onChange={(e) => setUsername(e.target.value)}
  //         required
  //       />
  //       <input
  //         type="password"
  //         placeholder="Password"
  //         value={password}
  //         onChange={(e) => setPassword(e.target.value)}
  //         required
  //       />
  //       <button type="submit">Login</button>
  //     </form>
  //   </div>
  // );
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="me-5">
        <h1 className="display-4 fw-bold">TaskFlow - Your Focus Ally</h1>
        <p className="text-center fs-5">Plan better. Work smarter. Finish faster.</p>
      </div>
      <div className="card p-4 shadow" style={{ width: '400px' }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        <div className="mt-3 text-center">
          <a href="/register">Don't have an account? Register</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
