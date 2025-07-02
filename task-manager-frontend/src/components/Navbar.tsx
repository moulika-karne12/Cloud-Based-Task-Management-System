import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const username = localStorage.getItem('username'); // set during login

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-light px-4 shadow-sm d-flex justify-content-between align-items-center">
      {/* Left side links */}
      <div style={{ display: "flex", gap: "1rem" }}>
        {isAuthenticated && (
          <>
            <Link to="/dashboard" className="text-decoration-none">Dashboard</Link>
            <Link to="/create-task" className="text-decoration-none">Create Task</Link>
          </>
        )}
      </div>

      {/* Right side user dropdown */}
      {isAuthenticated && username && (
        <div className="dropdown">
          <button
            className="btn btn-outline-primary dropdown-toggle"
            onClick={() => setDropdownOpen(!isDropdownOpen)}
          >
            Hi, {username}!
          </button>
          {isDropdownOpen && (
            <ul className="dropdown-menu dropdown-menu-end show mt-2">
              <li><a className="dropdown-item" href="/profile">My Profile</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
