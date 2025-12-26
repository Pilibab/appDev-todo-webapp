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
    const [showCompleted, setShowCompleted] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    
    // Priority filter state - all enabled by default
    const [priorityFilters, setPriorityFilters] = useState({
        none: true,
        low: true,
        med: true,
        high: true
    });

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
                console.log("Fetched tasks:", data);
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
        setSelectedTasks(new Set());
    };

    const toggleTaskSelection = (taskId) => {
        const idString = String(taskId);
        setSelectedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(idString)) {
                newSet.delete(idString);
            } else {
                newSet.add(idString);
            }
            console.log("Selected tasks after toggle:", Array.from(newSet));
            return newSet;
        });
    };

    const toggleTaskResolved = async (taskId, newResolvedState) => {
        try {
            console.log(`Toggling task ${taskId} to resolved: ${newResolvedState}`);

            const response = await fetch(`http://localhost:3000/api/tasks/${taskId}/resolve`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ isResolved: newResolvedState })
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Task resolved status updated:", result);
                
                await getTasks();
            } else {
                const errorData = await response.json();
                console.error("Failed to update task:", errorData);
                alert(`Failed to update task: ${errorData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error("Error updating task:", err);
            alert("Network error. Please check your connection and try again.");
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedTasks.size === 0) {
            alert("Please select at least one task to delete");
            return;
        }

        const selectedIdsArray = Array.from(selectedTasks);
        const tasksToDelete = tasks.filter(task => 
            selectedIdsArray.includes(String(task._id))
        );
        const taskNames = tasksToDelete.map(t => t.taskName).join(", ");
        
        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${selectedTasks.size} task(s)?\n\n${taskNames}`
        );

        if (!confirmDelete) return;

        try {
            console.log("Deleting task IDs:", selectedIdsArray);

            const response = await fetch("http://localhost:3000/api/tasks/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ taskIds: selectedIdsArray })
            });

            const result = await response.json();
            console.log("Delete response:", result);

            if (response.ok) {
                await getTasks();
                setSelectedTasks(new Set());
                setIsDeleteMode(false);
                
                alert(`Successfully deleted ${result.deletedCount} task(s)`);
            } else {
                console.error("Delete failed:", result);
                alert(`Failed to delete tasks: ${result.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error("Error deleting tasks:", err);
            alert("Network error. Please check your connection and try again.");
        }
    };

    const selectAll = () => {
        const allTaskIds = filteredTasks.map(task => String(task._id));
        console.log("Selecting all:", allTaskIds);
        setSelectedTasks(new Set(allTaskIds));
    };

    const deselectAll = () => {
        console.log("Deselecting all tasks");
        setSelectedTasks(new Set());
    };

    const togglePriorityFilter = (priority) => {
        setPriorityFilters(prev => ({
            ...prev,
            [priority]: !prev[priority]
        }));
    };

    const selectAllPriorities = () => {
        setPriorityFilters({
            none: true,
            low: true,
            med: true,
            high: true
        });
    };

    const deselectAllPriorities = () => {
        setPriorityFilters({
            none: false,
            low: false,
            med: false,
            high: false
        });
    };

    // Filter tasks based on completion status AND priority
    const filteredTasks = tasks
        .filter(task => showCompleted ? true : !task.isResolved) // Filter by completion
        .filter(task => priorityFilters[task.priorityLevel]); // Filter by priority

    const completedCount = tasks.filter(task => task.isResolved).length;
    const pendingCount = tasks.length - completedCount;

    // Count active filters
    const activeFilterCount = Object.values(priorityFilters).filter(v => v).length;

    return (
        <div className="container todo-container">
            <div className="header-section">
                <div>
                    <p className="title">
                        Tasks 
                        <span style={{ fontSize: '1rem', color: '#636e72', marginLeft: '10px' }}>
                            ({pendingCount} pending / {completedCount} completed)
                        </span>
                    </p>
                </div>

                <div className="action-buttons">
                    <button 
                        className={`filter-btn ${showFilterMenu ? 'active' : ''}`}
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                    >
                        Filter ({activeFilterCount}/4)
                    </button>
                    <button 
                        className={`toggle-show-btn ${showCompleted ? 'active' : ''}`}
                        onClick={() => setShowCompleted(!showCompleted)}
                    >
                        {showCompleted ? 'Hide Completed' : 'Show Completed'}
                    </button>
                    <button 
                        className={`toggle-delete-btn ${isDeleteMode ? 'active' : ''}`}
                        onClick={toggleDeleteMode}
                    >
                        {isDeleteMode ? 'Cancel' : 'Delete Tasks'}
                    </button>
                </div>
            </div>

            {/* Priority Filter Menu */}
            {showFilterMenu && (
                <div className="filter-menu">
                    <div className="filter-header">
                        <span className="filter-title">Filter by Priority</span>
                        <div className="filter-actions">
                            <button onClick={selectAllPriorities} className="filter-action-btn">
                                All
                            </button>
                            <button onClick={deselectAllPriorities} className="filter-action-btn">
                                None
                            </button>
                        </div>
                    </div>
                    <div className="filter-options">
                        <label className="filter-option">
                            <input
                                type="checkbox"
                                checked={priorityFilters.none}
                                onChange={() => togglePriorityFilter('none')}
                            />
                            <span className="filter-label">
                                <span className="priority-indicator none"></span>
                                None
                            </span>
                        </label>
                        <label className="filter-option">
                            <input
                                type="checkbox"
                                checked={priorityFilters.low}
                                onChange={() => togglePriorityFilter('low')}
                            />
                            <span className="filter-label">
                                <span className="priority-indicator low"></span>
                                Low
                            </span>
                        </label>
                        <label className="filter-option">
                            <input
                                type="checkbox"
                                checked={priorityFilters.med}
                                onChange={() => togglePriorityFilter('med')}
                            />
                            <span className="filter-label">
                                <span className="priority-indicator med"></span>
                                Medium
                            </span>
                        </label>
                        <label className="filter-option">
                            <input
                                type="checkbox"
                                checked={priorityFilters.high}
                                onChange={() => togglePriorityFilter('high')}
                            />
                            <span className="filter-label">
                                <span className="priority-indicator high"></span>
                                High
                            </span>
                        </label>
                    </div>
                </div>
            )}

            {isDeleteMode && (
                <div className="delete-controls">
                    <div className="selection-buttons">
                        <button onClick={selectAll} className="select-btn">
                            Select All ({filteredTasks.length})
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

                {filteredTasks && filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <TaskItem
                            key={task._id}
                            taskId={task._id}
                            taskName={task.taskName}
                            taskDetail={task.taskDetail || "No details provided"}
                            priorityLevel={task.priorityLevel}
                            dateAdded={task.dateAdded}
                            isResolved={task.isResolved}
                            isDeleteMode={isDeleteMode}
                            isSelected={selectedTasks.has(String(task._id))}
                            onToggleSelect={toggleTaskSelection}
                            onToggleResolved={toggleTaskResolved}
                        />
                    ))
                ) : (
                    <p>{showCompleted ? 'No tasks match the selected filters.' : 'No pending tasks! 🎉'}</p>
                )}
            </div>

            {!isDeleteMode && <AddTask refreshTasks={getTasks} />}
        </div>
    );
}

export default TodoContainer;