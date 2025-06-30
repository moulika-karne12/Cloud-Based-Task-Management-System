import { useEffect, useState } from "react";
import axios from "axios";

const TaskForm = ({ onTaskCreated }: { onTaskCreated: () => void }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [category, setCategory] = useState<number | null>(null);  // selected category
  const [categories, setCategories] = useState<any[]>([]);       // category list


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert("You are not logged in!");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/tasks/",
        { title, description, status, category},
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
      setCategory(null); // Reset category to null or default value
      //console.log("Task created successfully:", response.data);
      alert("Task created successfully!");
      onTaskCreated(); // Refresh task list
    } catch (error: any) {
      console.error("Failed to create task:", error?.response?.data || error);
      alert("Failed to create task!");
    }
  };

  useEffect(() => {
      const fetchCategories = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        try {
          const response = await axios.get("http://127.0.0.1:8000/api/categories/", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setCategories(response.data);
        } catch (error) {
          console.error("❌ Failed to fetch categories", error);
        }
      };

      fetchCategories();
    }, []);


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
      <div className="mb-2">
        <select
          className="form-control"
          value={category ?? ""}  // fallback empty if null
          onChange={(e) => setCategory(parseInt(e.target.value))}
          required
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary">
        Create Task
      </button>
    </form>
  );
};

export default TaskForm;
