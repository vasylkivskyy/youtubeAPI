const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const { findChannelsByIds } = require("./callYoutubeAPI");
const {
  updateDataAndSendToSpreadSheet,
} = require("./updateDataAndSendToSpreadSheet");
const {
  getPostsAndSendToSpreadSheat,
} = require("./getPostsAndSendToSpreadSheat");

const app = express();
const PORT = 3000;

dotenv.config();

app.post("/accounts", async (req, res) => {
  await updateDataAndSendToSpreadSheet();
  res.json({ message: "Data is updated and send to Google SpreadSheet" });
});

app.post("/posts", async (req, res) => {
  await getPostsAndSendToSpreadSheat();
  res.json({ message: "Posts are sent to Google SpreadSheet" });
});

app.listen(PORT, () => {
  console.log("Server is running on port: ", PORT);
});
