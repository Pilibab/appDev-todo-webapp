const { MongoClient, ServerApiVersion } = require('mongodb');
import dotenv from "dotenv";

dotenv.config(); // load .env
const uri = process.env.MONGODB_URI

if (!uri) {
    throw new Error("Please define MONGODB_URI in your .env file");
    
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;     // hold db instance


export async function connectDb() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        // Ensures that the client will close when you finish/error
        // await client.close();
        console.error("❌ MongoDB connection error:", err);
        throw err; // stop server if DB fails
    }
}

export function getDB() {
    if (!db) {
        throw new Error("Database not connected. Call connectDB first.");
    }
    return db;
}