import { useState, useEffect } from "react";
import TaskItem from "../task-item/TaskItem"; 
import AddTask from "../add-task/AddTask";
import "../todo-container/todoContainer.css";
import "../../../style/App.css";

const TodoContainer = () => {
    const [tasks, setTasks] = useState([]);

    // Helper function to request the array of user tasks
    const getTasks = async () => {
        try {
            const response = await fetch("/api/tasks", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // Replace 'token' with your actual localStorage key
                    "Authorization": `Bearer ${localStorage.getItem("token")}` 
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTasks(data); // Store the array in state
            } else {
                console.error("Failed to fetch tasks");
            }
        } catch (err) {
            console.error("Network error:", err);
        }
    };

    // Run the helper function once when the component mounts
    useEffect(() => {
        getTasks();
    }, []);

    return (
        <div className="container todo-container">
            <p className="title">Task</p>
            <div id="my-task-container">
                <p>My task</p>
            <div className="bar"></div>

                                {/* maybe theres a better way using func? */}
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskItem 
                            key={task._id} 
                            taskName={task.taskName}
                            taskDetail={task.taskDetail}
                            priorityLevel={task.priorityLevel}
                            dateAdded={task.dateAdded}
                            isResolved={task.isResolved}
                        />
                    ))
                ) : (
                    <p>No tasks found.</p>
                )}
            </div>
            <AddTask refreshTasks={getTasks} />
        </div>
    );
}

export default TodoContainer;