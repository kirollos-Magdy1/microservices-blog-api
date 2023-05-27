import express from "express";
import pool from "./database.js";
import dotenv from "dotenv";
import amqplib from "amqplib";
dotenv.config();
const app = express();
const port = process.env.PORT;
app.use(express.json());

const APP = {
  connection: undefined,
  ch1: undefined,
};

// Get all posts
app.get("/api/posts", async (req, res) => {
  try {
    const title = req.query.title;

    let query = "SELECT * FROM posts";
    let queryParams = [];
    if (title) {
      query += " WHERE title LIKE ?";
      query += " LIMIT 1";
      queryParams.push(`%${title}%`);
      const [rows] = await pool.execute(query, queryParams);
      res.send(rows);
    } else {
      const [rows] = await pool.execute(query);
      res.send(rows);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get a post by id
app.get("/api/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const [rows] = await pool.execute("SELECT * FROM posts WHERE id = ?", [
      postId,
    ]);
    res.send(rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Create a new post
app.post("/api/posts", async (req, res) => {
  try {
    const { title, content } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO posts ( title, content) VALUES (?, ?)",
      [title, content]
    );

    res.status(201).send("post created successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete a post
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const [result] = await pool.execute("SELECT * FROM posts WHERE id = ?", [
      postId,
    ]);
    if (result[0]) {
      await pool.execute("DELETE FROM posts WHERE id = ?", [postId]);
      APP.ch1.sendToQueue(
        "delete_post",
        Buffer.from(JSON.stringify(result[0]))
      );

      return res.send("Post deleted successfully");
    } else {
      return res.status(404).send("post not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

const start = async () => {
  try {
    APP.connection = await amqplib.connect(process.env.RABBITMQ_URL);
    APP.ch1 = await APP.connection.createChannel();

    app.listen(port, () => {
      console.log(`Lestining to port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
