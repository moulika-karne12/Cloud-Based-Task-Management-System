import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  due_date: string;
  custom_user: string;
}

interface User {
  id: number;
  username: string;
}

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
  onSave: () => void;
  users: User[];
  isAdmin: boolean;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onClose, onSave, users, isAdmin }) => {
  const [formData, setFormData] = useState<Task>(task);

  useEffect(() => {
    setFormData(task); // Update when props change
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    console.log("📦 Updating task with payload:", formData);
    try {
      await axios.patch(`http://127.0.0.1:8000/api/tasks/${formData.id}/`, {
        ...formData,
        custom_user: Number(formData.custom_user) || null, // Handle unassignment
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      alert("Task updated successfully!");
      onSave();
    } catch (error: any) {
      console.error("Failed to update task:", error?.response?.data || error);
      alert("Failed to update task!");
    }
  };

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Task</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <input
              className="form-control mb-2"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
            <textarea
              className="form-control mb-2"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            <select
              className="form-select mb-2"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <input
              type="date"
              className="form-control mb-2"
              name="due_date"
              value={formData.due_date?.split('T')[0] || ''}
              onChange={handleChange}
            />

            {isAdmin && (
              <select
                className="form-select mb-2"
                name="custom_user"
                value={formData.custom_user}
                onChange={handleChange}
              >
                <option value="">Reassign Task To</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleUpdate}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
