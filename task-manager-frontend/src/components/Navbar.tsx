import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "1rem", background: "#f0f0f0" }}>
      <div>
        <Link to="/dashboard" style={{ marginRight: "10px" }}>Dashboard</Link>
        <Link to="/login" style={{ marginRight: "10px" }}>Login</Link>
        <Link to="/register" style={{ marginRight: "10px" }}>Register</Link>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
