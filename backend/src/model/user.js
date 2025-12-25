import mongoose from "mongoose";
import { taskSchema } from "./task.js";


const userSchema = new mongoose.Schema({
    userName: {type: String, required: true, unique: true},
    passWord: {type: String, required: true},
    tasks: [taskSchema] // array of task with shape of schema
});

const User = mongoose.model("User", userSchema);
export default User;