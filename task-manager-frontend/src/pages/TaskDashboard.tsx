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
  const [showModal, setShowModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);


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

  useEffect(() => {
    fetchTasks();
  },[navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  const handleDelete = async (taskId: number) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert("You are not logged in!");
    return;
  }

  if (!window.confirm("Are you sure you want to delete this task?")) {
    return;
  }

  try {
    await axios.delete(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    alert("Task deleted successfully!");
    fetchTasks(); // Or refetch tasks
  } catch (error: any) {
    console.error("❌ Failed to delete task:", error?.response?.data || error);
    alert("Failed to delete task!");
  }
};

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You are not logged in!");
      return;
    }

    try {
      await axios.patch(`http://127.0.0.1:8000/api/tasks/${taskToEdit.id}/`, {
        title: taskToEdit.title,
        description: taskToEdit.description,
        status: taskToEdit.status,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      alert("Task updated successfully!");
      closeModal();
      fetchTasks(); // Reuse your existing function to refresh
    } catch (error: any) {
      console.error("❌ Failed to update task:", error?.response?.data || error);
      alert("Failed to update task!");
    }
  };

  const openEditModal = (task: any) => {
  setTaskToEdit(task);
  setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTaskToEdit(null);
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "warning"; // Bootstrap yellow/orange
      case "In Progress":
        return "primary"; // Bootstrap blue
      case "Completed":
        return "success"; // Bootstrap green
      default:
        return "secondary"; // fallback gray
    }
  };


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
            <li key={task.id} className="list-group-item mb-2">
              <h5>{task.title}</h5>
              <p>{task.description}</p>
              <span className={`badge bg-${getBadgeClass(task.status)}`}>
                {task.status}
              </span>
              <button className="btn btn-sm btn-primary ms-2" onClick={() => openEditModal(task)}>Edit</button>
              <button className="btn btn-sm btn-danger ms-2" onClick={() => handleDelete(task.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Task</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  type="text"
                  value={taskToEdit.title}
                  onChange={(e) => setTaskToEdit({...taskToEdit, title: e.target.value})}
                />
                <textarea
                  className="form-control mb-2"
                  value={taskToEdit.description}
                  onChange={(e) => setTaskToEdit({...taskToEdit, description: e.target.value})}
                />
                <select
                  className="form-select"
                  value={taskToEdit.status}
                  onChange={(e) => setTaskToEdit({...taskToEdit, status: e.target.value})}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveChanges}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );  
};

export default TaskDashboard;
