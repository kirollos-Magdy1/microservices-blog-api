import connectDB from "./database.js";

import mongoose from "mongoose";

export default mongoose.model(
  "Comment",
  new mongoose.Schema({
    postID: {
      type: Number,
    },
    body: {
      type: String,
      required: true,
    },
  })
);
