// TaskItem.jsx
import "../task-item/TaskItem.css"
import { useState } from "react";

const TaskItem = ({ 
    taskName, 
    taskDetail, 
    priorityLevel, 
    dateAdded, 
    isResolved,
    isDeleteMode,
    isSelected,
    onToggleSelect,
    taskId
}) => {
    const taskColor = { "low": "yellow", "med": "orange", "high": "red" };
    const [showPopup, setShowPopup] = useState(false);
    const activeColor = taskColor[priorityLevel] || "gray";

    const dateObj = new Date(dateAdded);
    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = dateObj.toLocaleDateString('en-GB');
    const formattedDate = `${time} ${date}`;

    const handleCardClick = () => {
        if (isDeleteMode) {
            onToggleSelect(taskId);
        } else {
            setShowPopup(true);
        }
    };

    const handleCheckboxClick = (e) => {
        e.stopPropagation();
        onToggleSelect(taskId);
    };

    return (
        <>
            <div
                style={{"--shadow-color": activeColor}}
                className={`task-item-card ${isDeleteMode && isSelected ? 'selected' : ''}`}
                onClick={handleCardClick}
            >
                {/* Text Group */}
                <div className="task-info-wrapper">
                    <span className="task-title">{taskName}</span>
                    <span className="task-date">{formattedDate}</span>
                </div>

                {/* Checkbox/Radio Group */}
                {isDeleteMode ? (
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={handleCheckboxClick}
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <input
                        type="radio"
                        checked={isResolved}
                        onClick={(e) => e.stopPropagation()}
                        readOnly
                    />
                )}
            </div>

            {showPopup && !isDeleteMode && (
                <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
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