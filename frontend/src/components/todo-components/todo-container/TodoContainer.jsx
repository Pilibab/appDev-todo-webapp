import "../todo-container/todoContainer.css"
import "../../../style/App.css"
import AddTask from "../add-task/AddTask";
const TodoContainer = ({child}) => {

    return (
    <div className="container todo-container">
        <p className="title">Task</p>
        <div className="bar"></div>
        <div id="my-task-container">
            <p>My task</p>
            
            {child}
        </div>
        <AddTask/>
    </div>)
}

export default TodoContainer;