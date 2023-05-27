import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import Model from "./Comment.js";
import connectDB from "./database.js";
import amqplib from "amqplib";
const app = express();
dotenv.config();
const port = process.env.PORT;
app.use(express.json());

const APP = {
  connection: undefined,
  ch2: undefined,
};

// Create a new comment
app.post("/api/:postID/comments", async (req, res) => {
  try {
    const postID = +req.params.postID;
    const { body } = req.body;
    const result = await axios.get(`http://localhost:3000/api/posts/${postID}`);
    console.log(result.data);
    if (result.data) {
      await Model.create({ postID, body });
      return res.status(201).send("Comment created successfully");
    } else {
      return res.status(404).send("post not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// get all comments
app.get("/api/comments", async (req, res) => {
  try {
    const comments = await Model.find();
    res.status(200).send(comments);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// get all post comments
app.get("/api/:postID/comments", async (req, res) => {
  try {
    const postID = +req.params.postID;
    const result = await axios.get(`http://localhost:3000/api/posts/${postID}`);
    console.log(result.data);
    if (result.data) {
      const result = await Model.find({ postID }, { body: -1 });
      return res.status(201).send(result);
    } else {
      return res.status(404).send("post not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

const removeCommentsForDeletedPost = async () => {
  APP.ch2.consume(
    "delete_post",
    async (msg) => {
      const result = JSON.parse(msg.content.toString());
      await Model.deleteMany({ postID: result.id });
      console.log("comments deleted for post " + result.title);
    },
    { noAck: true }
  );
};

const start = async () => {
  try {
    APP.connection = await amqplib.connect(process.env.RABBITMQ_URL);
    APP.ch2 = await APP.connection.createChannel();
    await connectDB(process.env.MONGO_URI);
    console.log("connected to db");
    removeCommentsForDeletedPost();

    app.listen(port, () => {
      console.log(`Lestining to port ${port}`);
    });
  } catch (error) {
    console.log("failed to connect to db " + error);
  }
};

start();
