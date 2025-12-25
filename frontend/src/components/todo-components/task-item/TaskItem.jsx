import { useState } from "react";

const TaskItem = ({ taskName, taskDetail,priorityLevel, dateAdded, isResolved }) => {

    const taskColor = {"low": "yellow", "med": "orange", "high": "red"}

    const [showPopup, setShowPopup] = useState(false)
    // Fallback to gray if priorityLevel is missing or "none"
    const activeColor = taskColor[priorityLevel] || "gray";

    return (<>
        <div 
            style={{"--shadow-color": activeColor}}
            className="task-item-card"  
            onClick={() => setShowPopup(true)}
        >
            <span className="task-title">{taskName}</span>
            <span className="task-date">{dateAdded}</span>

            <input
                type="radio"
            />
        </div>

        {
        // conditional popup
        showPopup && (
            // outer div, bluring outside ojt
            <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                
                <div>
                    <span>Task Name:</span>
                    <span className="task-title">{taskName}</span>
                    <span>Task Details:</span>
                    <span className="task-detail">{taskDetail}</span>
                </div>
            </div>
        )}
    </>);
}

export default TaskItem;