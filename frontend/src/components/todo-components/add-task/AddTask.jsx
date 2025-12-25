import { useContext, useState } from "react";
import "../add-task/AddTask.css"
import CredentialContext from "../../../context/CredentialContext";
const AddTask = () => {
    const {userName, setUserName, token, setToken, isAuth, setAuth} = useContext(CredentialContext);
    
    const [showPopup, setShowPopup] = useState(false);
    
    // Initial state for a blank task
    const [taskData, setTaskData] = useState({
        taskName: "",
        priorityLevel: "low" // matching your model enum
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/api/task/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                // Pass the whole state object
                body: JSON.stringify(taskData) 
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Task Added:", data);
                
                // 1. Reset the form
                setTaskData({ taskName: "", priorityLevel: "low" });
                // 2. Close the popup
                setShowPopup(false);
                // 3. Refresh the parent list so the new task appears!
                if (refreshTasks) refreshTasks(); 
            } else {
                alert("Failed to add task. Check console.");
            }
        } catch (err) {
            console.error("Error adding task:", err);
        }
    };


    return (
        <>
            {/* The trigger button */}
            <button 
                className="add-task-btn"
                onClick={() => setShowPopup(true)}>
                    <span className="add-task-label">Add New Task</span>
            </button>

            {showPopup && (
                <div className="popup-overlay">
                    <form className="popup-content" onSubmit={handleSubmit}>
                        <h3>Create Task</h3>
                        
                        <span>Title</span>
                        <input 
                            type="text" 
                            name="taskName"
                            value={taskData.taskName}
                            onChange={handleChange}
                            required 
                        />

                        <span>Priority Level</span>
                        <select 
                            name="priorityLevel" 
                            value={taskData.priorityLevel}
                            onChange={handleChange}
                        >
                            <option value="none">None</option>
                            <option value="low">Low</option>
                            <option value="med">Medium</option>
                            <option value="high">High</option>
                        </select>

                        <div className="button-group">
                            <button type="submit">Add Task</button>
                            <button type="button" onClick={() => setShowPopup(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default AddTask;