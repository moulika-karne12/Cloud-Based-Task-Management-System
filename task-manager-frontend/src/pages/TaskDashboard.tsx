import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskForm from "../components/TaskForm"; // Add this import at top

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
}

const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error("No access token found! Redirecting to login.");
          navigate('/login');
          return;
        }
  
        const response = await axios.get('http://127.0.0.1:8000/api/tasks/', {
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json',
          },
        });
  
        console.log("API Response:", response.data);
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setError("Failed to load tasks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchTasks();
  }, [navigate]);  

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-5">
      <h2>Task Dashboard</h2>
      <button onClick={handleLogout} className="btn btn-danger mb-3">Logout</button>

      <TaskForm onTaskCreated={() => window.location.reload()} /> {/* New Form */}

      {tasks.length === 0 ? (
        <p>No tasks found. Try adding some tasks!</p>
      ) : (
        <ul className="list-group">
          {tasks.map((task) => (
            <li key={task.id} className="list-group-item">
              <h5>{task.title}</h5>
              <p>{task.description}</p>
              <span><strong>Status:</strong> {task.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );  
};

export default TaskDashboard;
