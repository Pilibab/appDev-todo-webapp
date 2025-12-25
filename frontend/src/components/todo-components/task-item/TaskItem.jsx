import "../task-item/TaskItem.css"
import { useState } from "react";

const TaskItem = ({ taskName, taskDetail, priorityLevel, dateAdded, isResolved }) => {
    const taskColor = { "low": "yellow", "med": "orange", "high": "red" };
    const [showPopup, setShowPopup] = useState(false);
    const activeColor = taskColor[priorityLevel] || "gray";

    const dateObj = new Date(dateAdded);
    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = dateObj.toLocaleDateString('en-GB'); // en-GB gives dd/mm/yyyy
    
    const formattedDate = `${time} ${date}`;

    return (
        <>
            <div 
                style={{"--shadow-color": activeColor}}
                className="task-item-card"  
                onClick={() => setShowPopup(true)}
            >
                {/* Text Group */}
                <div className="task-info-wrapper">
                    <span className="task-title">{taskName}</span>
                    <span className="task-date">{formattedDate}</span>
                </div>

                {/* Checkbox Group */}
                <input
                    type="radio"
                    checked={isResolved}
                    onClick={(e) => e.stopPropagation()} 
                    readOnly
                />
            </div>

            {showPopup && (
                <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                    <div onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside box */}
                        <span>Task Name:</span>
                        <span className="task-title">{taskName}</span>
                        <hr />
                        <span>Task Details:</span>
                        <span className="task-detail">{taskDetail}</span>
                    </div>
                </div>
            )}
        </>
    );
}

export default TaskItem;