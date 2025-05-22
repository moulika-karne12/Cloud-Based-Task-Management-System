import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/tasks/"; // Adjust this if your Django API is different

export const getTasks = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error("No token found");

  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
