const { youtubeApiUrl } = require("./config");
const axios = require("axios");

async function findChannelsByIds(rows) {
  let result = [];
  let promises = [];

  try {
    for (let i = 0; i < rows.length; i++) {
      let request = axios.get(
        `${youtubeApiUrl}/channels?key=${process.env.YOUTUBE_API_KEY}&part=snippet,statistics&id=${rows[i].platform_id}`
      );
      promises.push(request);
    }

    let result = await Promise.all(promises);

    for (let i = 0; i < rows.length; i++) {
      let response = mapResponseForChannels(result[i].data);
      rows[i].fullName = response?.fullName;
      rows[i].description = response?.description;
      rows[i].followersCount = response?.followersCount;
    }
  } catch (error) {
    console.error("Сталася помилка при отриманні даних:", error);
  }

  return rows;
}

async function findVideosByIds(rows) {
  let result = [];
  let promises = [];
  let videoData = [];
  try {
    for (let i = 0; i < rows.length; i++) {
      let request = axios.get(
        `${youtubeApiUrl}/search?key=${process.env.YOUTUBE_API_KEY}&part=snippet&channelId=${rows[i].platform_id}&publishedAfter=2023-05-01T00:00:00Z`
      );
      promises.push(request);
    }

    let result = await Promise.all(promises);

    for (let i = 0; i < rows.length; i++) {
      let responseById = mapResponseForVideos(result[i].data);

      for (let j = 0; j < responseById.length; j++) {
        let response = await axios.get(
          `${youtubeApiUrl}/videos?key=${process.env.YOUTUBE_API_KEY}&part=statistics&id=${responseById[j].id}`
        );

        responseById[j].likes_count =
          response.data.items[0]?.statistics?.likeCount;
        responseById[j].shares_count =
          response.data.items[0]?.statistics?.favoriteCount;
        responseById[j].comments_count =
          response.data.items[0]?.statistics?.commentCount;
        responseById[j].views_count =
          response.data.items[0]?.statistics?.viewCount;
        videoData.push(responseById[j]);
      }
    }
  } catch (error) {
    console.error("Сталася помилка при отриманні даних:", error);
  }

  return videoData;
}

function mapResponseForChannels(response) {
  return {
    fullName: response?.items[0]?.snippet?.title || null,
    description: response?.items[0]?.snippet?.description || null,
    followersCount: response?.items[0]?.statistics?.subscriberCount || null,
  };
}

function mapResponseForVideos(response) {
  let items = [];
  for (let i = 0; i < response.items.length; i++) {
    items.push({
      id: response.items[i].id.videoId,
      _platform: "YouTube",
      created_time: response.items[i].snippet.publishedAt,
      text_original: response.items[i].snippet.title,
    });
  }
  return items;
}
module.exports = { findChannelsByIds, findVideosByIds };
