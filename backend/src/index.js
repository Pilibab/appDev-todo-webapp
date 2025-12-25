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
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
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

// 4. Get Tasks (Protected)
app.get("/api/tasks", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user.tasks);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// 5. Add Task (Protected)
app.post("/api/task/add", auth, async (req, res) => {
    const { taskName } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.tasks.push({ taskName }); 
        await user.save();

        res.json({ message: "Task added", tasks: user.tasks });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Start Server
async function startServer() {
    await connectDb();
    app.listen(port, () => {
        console.log(`🚀 Server listening at http://localhost:${port}`);
    });
}

startServer();