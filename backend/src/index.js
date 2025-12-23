// Suggested Tech Stack: Node.js, Express.js, MongoDB, JWT Auth

import express from "express"
import dotenv from "dotenv";
import cors from "cors "

import { connectDb } from "./config/db";

// load env
dotenv.config();

// server 
const express = require('express');
const app = express()
const port = process.env.PORT || 3000;


app.use(express.json())
// allows communication between front and back end 
app.use(cors())


async function startServer() {
    await connectDb()
    app.listen(port, () => {
        console.log(`listening at http://localhost:${port}`);
    })
}

startServer()

