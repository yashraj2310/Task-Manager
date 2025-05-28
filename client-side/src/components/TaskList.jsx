import React from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onDeleteTask, onSetEditingTask, onToggleStatus, loading, error }) => {
  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500 bg-red-100 p-3 rounded-md">Error: {error}</div>;
  }

  if (!tasks || tasks.length === 0) {
    return <div className="text-center py-4 text-gray-500">No tasks found. Add one above!</div>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onDeleteTask={onDeleteTask}
          onSetEditingTask={onSetEditingTask}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};

export default TaskList;