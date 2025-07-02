import React from 'react';
import TaskForm from '../components/TaskForm';

const CreateTaskPage: React.FC = () => {
  return (
    <div className="container mt-4">
      {/* <h2 className="mb-4">Create a New Task</h2> */}
      <TaskForm onTaskCreated={() => window.location.href = "/dashboard"} />
    </div>
  );
};

export default CreateTaskPage;
