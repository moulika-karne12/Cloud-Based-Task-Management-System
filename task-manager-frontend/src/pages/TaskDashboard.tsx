import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditTaskModal from '../components/EditTaskModal';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  due_date: string,
  assigned_user?: string; 
  priority: number;
}

interface Category {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
}


const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<number | "All">("All");
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pageSize, setPageSize] = useState(() => {
  const saved = localStorage.getItem("pageSize");
  return saved ? parseInt(saved) : 2;  // fallback to default 2
  });

useEffect(() => {
  const fetchUsers = async () => {
    const token = localStorage.getItem('access_token');
    const res = await axios.get('http://127.0.0.1:8000/api/users/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(res.data);
  };

  const isUserAdmin = localStorage.getItem('is_admin') === 'true'; // or decode from JWT
  setIsAdmin(isUserAdmin);
  fetchUsers();
}, []);



useEffect(() => {
  const fetchCategories = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/categories/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data);
      //console.log("Categories fetched:", response.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  fetchCategories();
}, []);

const fetchTasks = async (url?: string) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error("No access token found! Redirecting to login.");
      navigate('/login');
      return;
    }

    //const endpoint = url || 'http://127.0.0.1:8000/api/tasks/';

     // If url is passed (from next/prev), use it. Else, build filtered base URL
    let endpoint = url;
    if (endpoint) {
      const parsedUrl = new URL(endpoint);
      parsedUrl.searchParams.set('page_size', String(pageSize));
      endpoint = parsedUrl.toString();
    } else {
      const base = 'http://127.0.0.1:8000/api/tasks/';
      const params = new URLSearchParams();

      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (categoryFilter !== 'All') params.append('category', String(categoryFilter));
      params.append('page_size', String(pageSize));

      endpoint = `${base}?${params.toString()}`;
    }

    const response = await axios.get(endpoint, {
      headers: { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json',
      },
    });

    console.log("API Response:", response.data);
    setTasks(response.data.results || []); // Use results for paginated response
    setNextPageUrl(response.data.next);
    setPrevPageUrl(response.data.previous);

    // ✅ Extract and use dynamic page_size

    const count = response.data.count || 0;
    setTotalPages(Math.ceil(count / pageSize));

    // ✅ Figure out current page from `next` or `previous`
    if (response.data.next) {
      const nextPage = new URL(response.data.next).searchParams.get("page");
      setCurrentPage(Number(nextPage) - 1);
    } else if (response.data.previous) {
      const prevPage = new URL(response.data.previous).searchParams.get("page");
      setCurrentPage(Number(prevPage) + 1);
    } else {
      setCurrentPage(1); // no next/prev means only one page
    }
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    setError("Failed to load tasks. Please try again later.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchTasks();
  },[pageSize, statusFilter, categoryFilter]); // Re-fetch tasks when filters change

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

  // const handleSaveChanges = async () => {
  //   const token = localStorage.getItem("access_token");
  //   if (!token) {
  //     alert("You are not logged in!");
  //     return;
  //   }

  //   try {
  //     await axios.patch(`http://127.0.0.1:8000/api/tasks/${taskToEdit.id}/`, {
  //       title: taskToEdit.title,
  //       description: taskToEdit.description,
  //       status: taskToEdit.status,
  //       due_date: taskToEdit.due_date,
  //     }, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });
  //     alert("Task updated successfully!");
  //     closeModal();
  //     fetchTasks(); // Reuse your existing function to refresh
  //   } catch (error: any) {
  //     console.error("❌ Failed to update task:", error?.response?.data || error);
  //     alert("Failed to update task!");
  //   }
  // };

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

  const filteredTasks = tasks.filter((task: any) => {
  const matchStatus = statusFilter === "All" || task.status === statusFilter;
  const matchCategory = categoryFilter === "All" || task.category === Number(categoryFilter);
  return matchStatus && matchCategory;
});


  return (
    <div className="container mt-5">
      <h2>Task Dashboard</h2>
      {/* <button onClick={handleLogout} className="btn btn-danger mb-3">Logout</button> */}

      {/* <TaskForm onTaskCreated={() => window.location.reload()} /> New Form */}

      {tasks.length === 0 ? (
        <p>No tasks found. Try adding some tasks!</p>
      ) : (
        <>
        <div className="d-flex gap-3 mb-4">
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value === "All" ? "All" : parseInt(e.target.value))}>
            <option value="All">All Categories</option>
            {/** Dynamically map categories here */}
            {categories.map((cat: Category) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
       
        <h4>My Tasks</h4>
        <ul className="list-group">
          {filteredTasks.map((task) => (
            // <li key={task.id} className="list-group-item mb-4 p-3 shadow-sm rounded">
            //   <h5>{task.title}</h5>
            //   <p>{task.description}</p>
            //   <p>Due Date: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</p>
            //   /* Display assigned user if available */
            //   {isAdmin && task.assigned_user && <p>Assigned to: {task.assigned_user || 'Unassigned'}</p>}
            //   <span className={`badge bg-${getBadgeClass(task.status)}`}>
            //     {task.status}
            //   </span>
            //   <span className={`badge ${task.priority === 1 ? 'bg-danger' :
            //             task.priority === 2 ? 'bg-warning text-dark' :
            //             'bg-secondary'}`}>
            //     {task.priority === 1 ? 'High' :
            //     task.priority === 2 ? 'Medium' : 'Low'}
            //   </span>
            //   <button className="btn btn-sm btn-primary ms-2" onClick={() => openEditModal(task)}>Edit</button>
            //   <button className="btn btn-sm btn-danger ms-2" onClick={() => handleDelete(task.id)}>Delete</button>
            // </li>
            <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">{task.title}</h5>
              <p className="card-text">{task.description}</p>
              <p className="text-muted">Due Date: {task.due_date || 'N/A'}</p>
              <div>
                <span className={`badge bg-${getBadgeClass(task.status)} me-2`}>
                  {task.status}
                </span>
                <span className={`badge me-2 ${task.priority === 1 ? 'bg-danger' :
                        task.priority === 2 ? 'bg-warning text-dark' :
                        'bg-secondary'}`}>
                  {task.priority === 1 ? 'High' :
                  task.priority === 2 ? 'Medium' : 'Low'}
                </span>
                {/* Display assigned user if available */}
                <span className="badge bg-info">
                  {/* Assigned to: {task.assigned_user} */}
                  {isAdmin && task.assigned_user && <p>Assigned User: {task.assigned_user || 'Unassigned'}</p>}
                </span>
              </div>
              <div className="mt-3">
                <button className="btn btn-sm btn-primary ms-2" onClick={() => openEditModal(task)}>Edit</button>
                <button className="btn btn-sm btn-danger ms-2" onClick={() => handleDelete(task.id)}>Delete</button>
              </div>
            </div>
          </div>
          ))}
        </ul>
        
         {/* Pagination Controls */}
        <div className="d-flex align-items-center gap-2">
          <label className="form-label mb-0">Tasks per page:</label>
          <select
            className="form-select w-auto"
            value={pageSize}
            onChange={(e) => {
              const newSize=parseInt(e.target.value);
              localStorage.setItem("pageSize", String(newSize)); // 💾 Save it
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          >
            <option value={2}>2</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </div>

        <div className="d-flex justify-content-between mt-4">
        <button
          className="btn btn-outline-primary"
          onClick={() => fetchTasks(prevPageUrl!)}
          disabled={!prevPageUrl}
        >
          Previous
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => fetchTasks(nextPageUrl!)}
          disabled={!nextPageUrl}
        >
          Next
        </button>
      </div>
      <div className="text-center mt-3">
        Page {currentPage} of {totalPages}
      </div>

      </>
      )}
      {/* {showModal && (
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
                <input
                  type="date"
                  className="form-control mb-2"
                  value={taskToEdit.due_date?.split('T')[0] || ''}
                  onChange={(e) => setTaskToEdit({ ...taskToEdit, due_date: e.target.value })}
                />

              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveChanges}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )} */}
      {showModal && taskToEdit && (
        <EditTaskModal
          task={taskToEdit}
          onClose={closeModal}
          onSave={() => {
            fetchTasks();
            closeModal();
          }}
          users={users}
          isAdmin={isAdmin}
        />
      )}

    </div>
  );  
};

export default TaskDashboard;
