const { Client } = require("pg");
const dbConfig = require("./dbConfig");

const { findChannelsByIds } = require("./callYoutubeAPI");
const { sendDataToSpreadSheet } = require("./sendDataToSpreadSheet");

async function updateDataAndSendToSpreadSheet() {
  let client;
  let channelsInfo = [];

  try {
    client = new Client(dbConfig);
    await client.connect();

    const sourceIdsQuery = "SELECT _id, platform_id FROM sources";
    const { rows } = await client.query(sourceIdsQuery);
    channelsInfo = await findChannelsByIds(rows);
    console.log("channelsInfo:", channelsInfo);

    for (let i = 0; i < channelsInfo.length; i++) {
      if (
        channelsInfo[i].fullName &&
        channelsInfo[i].description &&
        channelsInfo[i].followersCount &&
        channelsInfo[i]._id
      ) {
        const updateQuery = `
        UPDATE accounts
        SET full_name = '${channelsInfo[i].fullName}', description = '${channelsInfo[i].description}', followers_count = ${channelsInfo[i].followersCount}
        WHERE _source_id = ${channelsInfo[i]._id}
      `;
        await client.query(updateQuery);
      }
    }
    console.log('Дані успішно оновлені в таблиці "accounts".');
  } catch (error) {
    console.error("Сталася помилка при оновленні даних:", error);
  } finally {
    await client.end();
  }

  try {
    await sendDataToSpreadSheet(channelsInfo, 0);
  } catch (error) {
    console.log("Error while sending data to spreadSheet", error);
  }
}

module.exports = { updateDataAndSendToSpreadSheet };
