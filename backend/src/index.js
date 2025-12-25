// Suggested Tech Stack: Node.js, Express.js, MongoDB, JWT Auth
import jwt from "jsonwebtoken"
import express from "express"
import dotenv from "dotenv";
import cors from "cors"
import bcrypt from "bcrypt"

import { connectDb } from "./config/db.js";
import { auth } from "./middleware/auth.js";
import User from "./model/user.js";
// import { taskSchema, Task } from "./model/task.js";
// import {User} from "./model/user.js";

// load env
dotenv.config();

// 
const saltRounds = 10;


// server 
const app = express()
const port = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:5173", // Allow your React app
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json())
// allows communication between front and back end 
// app.use(cors())

app.post("/api/check-user", async (req, res) => {
    try {
        const database = getDB();
        const users = database.collection("users");

        // match the user
        const user = await users.findOne({userName: req.body.username})

        if (user) {
            // sign in ❌ login ✅
            res.json({ exists: true });
        } else {
            // sign in ✅ login ❌
            res.json({ exists: false });
        }

    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
})


// when the form is submit this will be called 
app.post("/auth/register", async (req, res) => {
    const {username, password} = req.body;

    try {
        // check if user name is taken
        const existingUser = await User.findOne({ userName: username });

        if (existingUser) {
            return res.status(400).json({ error: "Username already taken!" });
        }

        // if not 
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        const newUser = await User.create({
            userName: username,
            passWord: hashedPassword,
            task: []
        })

        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        // Handle the MongoDB Unique Index error if the findOne check missed it
        if (err.code === 11000) {
            return res.status(400).json({ error: "Username already exists!" });
        }
        console.error(err);
        res.status(500).json({ error: "Server error during registration" });
    }
});

app.post("/auth/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ userName: username });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passWord);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token });
});

// todo: create a method for getting task
app.post("/api/task", async (req, res) => {
    const {credentials} = req.body; // temp 

    try {
        const database = getDB();
        const user = database.collection("taskXuser").findOne(credentials);

        res.json(user);
    } catch (err) {
        
    }
})

// !method for adding task to db
app.post("/api/task/add", async (req, res) => {
    const { username, taskName, taskDetail, priorityLevel } = req.body;

    try {
        const database = getDB();
        const users = database.collection("taskXuser");

        const user = await users.updateOne(
            { userName: username });

        // should not be possible 
        if (!user) return res.status(404).json({ error: "User not found" });
        
        user.task.push({taskName, taskDetail, priorityLevel});

        await user.save();
        
        console.log({ message: "Task added" });
        
        res.status(201).json({ message: "Task added" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});




app.post("/api/task/add", auth, async (req, res) => {
    const { taskName } = req.body;

    const user = await User.findById(req.userId);

    user.tasks.push({ taskName });
    await user.save();

    res.json({ message: "Task added" });
});



async function startServer() {
    await connectDb()
    app.listen(port, () => {
        console.log(`listening at http://localhost:${port}`);
    })
}


startServer()

