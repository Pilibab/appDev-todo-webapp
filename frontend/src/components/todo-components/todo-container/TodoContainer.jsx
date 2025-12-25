// TodoContainer.jsx
import { useState, useEffect, useContext } from "react";
import TaskItem from "../task-item/TaskItem";
import AddTask from "../add-task/AddTask";
import "../todo-container/todoContainer.css";
import "../../../style/App.css";
import CredentialContext from "../../../context/CredentialContext";

const TodoContainer = () => {
    const { token } = useContext(CredentialContext);
    const [tasks, setTasks] = useState([]);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState(new Set());

    const getTasks = async () => {
        if (!token) {
            console.warn("No token found, redirecting...");
            window.location.href = "/login";
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/tasks", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                console.error("Token invalid or expired");
                window.location.href = "/login";
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            } else {
                console.error("Server error:", response.status);
            }
        } catch (err) {
            console.error("Network error fetching tasks:", err);
        }
    };

    useEffect(() => {
        getTasks();
    }, [token]);

    const toggleDeleteMode = () => {
        setIsDeleteMode(!isDeleteMode);
        setSelectedTasks(new Set()); // Clear selections when toggling
    };

    const toggleTaskSelection = (taskId) => {
        setSelectedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const handleDeleteSelected = async () => {
        if (selectedTasks.size === 0) {
            alert("Please select at least one task to delete");
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${selectedTasks.size} task(s)?`
        );

        if (!confirmDelete) return;

        try {
            // You'll implement the backend delete endpoint later
            // For now, just filter locally
            const response = await fetch("http://localhost:3000/api/tasks/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ taskIds: Array.from(selectedTasks) })
            });

            if (response.ok) {
                // Refresh tasks after deletion
                await getTasks();
                setSelectedTasks(new Set());
                setIsDeleteMode(false);
            }
        } catch (err) {
            console.error("Error deleting tasks:", err);
            alert("Failed to delete tasks. Please try again.");
        }
    };

    const selectAll = () => {
        const allTaskIds = tasks.map(task => task._id);
        setSelectedTasks(new Set(allTaskIds));
    };

    const deselectAll = () => {
        setSelectedTasks(new Set());
    };

    return (
        <div className="container todo-container">
            <div className="header-section">
                <p className="title">Task</p>
                <div className="action-buttons">
                    <button 
                        className={`toggle-delete-btn ${isDeleteMode ? 'active' : ''}`}
                        onClick={toggleDeleteMode}
                    >
                        {isDeleteMode ? 'Cancel' : 'Delete Tasks'}
                    </button>
                </div>
            </div>

            {isDeleteMode && (
                <div className="delete-controls">
                    <div className="selection-buttons">
                        <button onClick={selectAll} className="select-btn">
                            Select All
                        </button>
                        <button onClick={deselectAll} className="select-btn">
                            Deselect All
                        </button>
                    </div>
                    <button 
                        onClick={handleDeleteSelected}
                        className="delete-selected-btn"
                        disabled={selectedTasks.size === 0}
                    >
                        Delete Selected ({selectedTasks.size})
                    </button>
                </div>
            )}

            <div id="my-task-container">
                <p>My task</p>
                <div className="bar"></div>

                {tasks && tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskItem
                            key={task._id}
                            taskId={task._id}
                            taskName={task.taskName}
                            taskDetail={task.taskDetail}
                            priorityLevel={task.priorityLevel}
                            dateAdded={task.dateAdded}
                            isResolved={task.isResolved}
                            isDeleteMode={isDeleteMode}
                            isSelected={selectedTasks.has(task._id)}
                            onToggleSelect={toggleTaskSelection}
                        />
                    ))
                ) : (
                    <p>No tasks found.</p>
                )}
            </div>

            {!isDeleteMode && <AddTask refreshTasks={getTasks} />}
        </div>
    );
}

export default TodoContainer;