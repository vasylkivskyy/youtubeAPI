const { Client } = require("pg");
const dbConfig = require("./dbConfig");
const { findVideosByIds } = require("./callYoutubeAPI");
const { sendDataToSpreadSheet } = require("./sendDataToSpreadSheet");

async function getPostsAndSendToSpreadSheat() {
  let client;
  let rows = {};
  try {
    client = new Client(dbConfig);
    await client.connect();

    const sourceIdsQuery = "SELECT _id, platform_id FROM sources";
    let data = await client.query(sourceIdsQuery);
    rows = data.rows;
  } catch (error) {
    console.error("Сталася помилка при отриманні даних:", error);
  } finally {
    await client.end();
  }

  const data = await findVideosByIds(rows);
  console.log("data:", JSON.stringify(data));

  try {
    await sendDataToSpreadSheet(data, 1);
  } catch (error) {
    console.log("Error while sending data to spreadSheet", error);
  }
}

module.exports = { getPostsAndSendToSpreadSheat };
