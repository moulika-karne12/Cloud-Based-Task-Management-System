import { useState } from "react";
import axios from "axios";

const TaskForm = ({ onTaskCreated }: { onTaskCreated: () => void }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  //const [category, setCategory] = useState("General"); // Optional category field

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert("You are not logged in!");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/tasks/",
        { title, description, status, category : 1},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTitle("");
      setDescription("");
      setStatus("Pending");
      alert("Task created successfully!");
      onTaskCreated(); // Refresh task list
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <h4>Create a New Task</h4>
      <div className="mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="mb-2">
        <textarea
          className="form-control"
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="mb-2">
        <select
          className="form-control"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary">
        Create Task
      </button>
    </form>
  );
};

export default TaskForm;
