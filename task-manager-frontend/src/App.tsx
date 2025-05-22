import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TaskDashboard from "./pages/TaskDashboard";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute"; // Import it!

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <TaskDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
