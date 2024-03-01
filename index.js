const express = require("express");
const Redis = require("ioredis");
const cron = require("node-cron");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();

const queue = require("./queues/product-queue");

const productCategories = [
  "Phones",
  "Fashion",
  "Electronics",
  "Groceries",
  "Beauty",
  "Home",
  "Sports",
  "Watches",
  "Kids",
  "Auto",
  "Computers",
  "Tools",
  "Stationery",
  "Toys",
  "Books",
  "Pets",
  "Islamic",
  "Travel",
  "Party",
  "Kitchen",
];

console.log("redis check ====>", process.env.REDIS_DB_NAME);
// Connect to MongoDB
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@my-cluster.wlkgtiv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,

    {
      //   urlencoded: true,
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log(`app connected with ${process.env.DB_NAME} database 🚀`);
  })
  .catch((err) => {
    console.error("MongoDB connection error: ", err);
  });

const redisOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USER_NAME,
  password: process.env.REDIS_PASSWORD,
};

const redis = new Redis(redisOptions);
// Check the connection status
redis.on("connect", () => {
  console.log("Connected to Redis database.");
});

// Check for errors during connection
redis.on("error", (err) => {
  console.error("Error connecting to Redis:", err);
});

const addToQueue = async () => {
  productCategories.map((category) => {
    const data = { category };
    queue.add(data, { removeOnComplete: true, removeOnFail: true });
  });
};

addToQueue();

// Schedule to add entries to the queue every 6 hours
cron.schedule("0 */3 * * *", () => {
  productCategories.map((category) => {
    const data = { category };
    queue.add(data, { removeOnComplete: true, removeOnFail: true });
  });
  console.log("Entries added to the queue.");
});
