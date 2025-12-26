import { useContext, useState } from "react";
import "../add-task/AddTask.css"
import CredentialContext from "../../../context/CredentialContext";
const API_BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;


const AddTask = ({ refreshTasks }) => { 
    const { token } = useContext(CredentialContext);
    const [showPopup, setShowPopup] = useState(false);
    
    // Initialize with "none" to match your select options
    const [taskData, setTaskData] = useState({
        taskName: "",
        priorityLevel: "none"  // Default val
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Field ${name} changed to:`, value); // Debug log
        setTaskData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Debugging: Check this in your browser console!
        console.log("Sending to Backend:", taskData);

        try {
            const response = await fetch(`${API_BASE_URL}/api/task/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(taskData) 
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Task added successfully:", result);
                
                setTaskData({ taskName: "", priorityLevel: "none" });
                setShowPopup(false);
                
                if (refreshTasks) refreshTasks(); 
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || "Failed to add task"}`); // FIXED: Added opening (
            }
        } catch (err) {
            console.error("Error adding task:", err);
            alert("Network error. Please try again.");
        }
    };

    return (
        <>
            <button className="btn-primary-trigger" onClick={() => setShowPopup(true)}>
                <span className="plus-icon">+</span>
                <span className="add-task-label">Add New Task</span>
            </button>

            {showPopup && (
                <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                    <form 
                        className="popup-content" 
                        onSubmit={handleSubmit}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking form
                    >
                        <h3>Create Task</h3>
                        
                        <label>Title</label>
                        <input 
                            type="text" 
                            name="taskName"
                            value={taskData.taskName}
                            onChange={handleChange}
                            required 
                        />

                        <label>Priority Level</label>
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
                            <button type="button" onClick={() => setShowPopup(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default AddTask;