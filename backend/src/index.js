import jwt from "jsonwebtoken";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";

import { connectDb } from "./config/db.js";
import { auth } from "./middleware/auth.js";
import User from "./model/user.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const saltRounds = 10;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// --- ROUTES ---

// 1. Check if user exists (Updated to use Mongoose)
app.post("/api/check-user", async (req, res) => {
    try {
        const user = await User.findOne({ userName: req.body.username });
        res.json({ exists: !!user });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// 2. Register
app.post("/auth/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ userName: username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already taken!" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            userName: username,
            passWord: hashedPassword,
            tasks: [] // Changed from 'task' to 'tasks' to match your schema
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during registration" });
    }
});

// 3. Login
app.post("/auth/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ userName: username });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.passWord);
        if (!match) return res.status(401).json({ error: "Invalid credentials" });

        // IMPORTANT: Ensure your .env has JWT_KEY
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_KEY, 
            { expiresIn: "1h" }
        );

        res.json({ token, username: user.userName });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get Tasks (Protected)
app.get("/api/tasks", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user.tasks);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Add Task (Protected)
app.post("/api/task/add", auth, async (req, res) => {
    const { taskName, priorityLevel } = req.body; // TODO: add taskDets if in use 
    
    console.log("Received task data:", { taskName, priorityLevel }); // Debug log
    
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Push both fields to tasks array
        user.tasks.push({ 
            taskName, 
            priorityLevel: priorityLevel || "none" // Default to "none" if not provided
        }); 
        
        await user.save();

        res.json({ message: "Task added", tasks: user.tasks });
    } catch (err) {
        console.error("Error adding task:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// delete task 
// Delete multiple tasks
app.delete("/api/tasks/delete", auth, async (req, res) => {
    const { taskIds } = req.body;
    
    if (!Array.isArray(taskIds)) {
        return res.status(400).json({ error: "Invalid input: taskIds must be an array" });
    }

    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Filter: Keep tasks whose ID is NOT in the taskIds array
        const initialCount = user.tasks.length;
        user.tasks = user.tasks.filter(task => !taskIds.includes(task._id.toString()));

        await user.save();

        res.json({ 
            message: "Deletion successful", 
            deletedCount: initialCount - user.tasks.length,
            remainingTasks: user.tasks 
        });
    } catch (err) {
        res.status(500).json({ error: "Server error during deletion" });
    }
});
// Update task resolved status
app.patch("/api/tasks/:taskId/resolve", auth, async (req, res) => {
    const { taskId } = req.params;
    const { isResolved } = req.body;
    
    console.log(`Updating task ${taskId} to resolved: ${isResolved}`);
    
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Find the task in the user's tasks array
        const task = user.tasks.id(taskId);
        
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        // Update the isResolved property
        task.isResolved = isResolved;
        
        await user.save();

        res.json({ 
            message: "Task updated successfully", 
            task: task
        });
    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).json({ error: "Server error while updating task" });
    }
});

// Start Server
// async function startServer() {
//     await connectDb();
//     app.listen(port, () => {
//         console.log(`🚀 Server listening at http://localhost:${port}`);
//     });
// }

// startServer();


app.get("/", (req, res) => res.send("Task API is running..."));

// We export the app for Vercel, but only call app.listen locally
if (process.env.NODE_ENV !== "production") {
    app.listen(port, () => {
        console.log(` server at http://localhost:${port}`);
    });
}

export default app;