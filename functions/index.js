const functions = require("firebase-functions");
const fetch = require("node-fetch");

const LINE_ACCESS_TOKEN = "IR54C6+5BAgTTgnZiAwh8kGuCi+3zqzw5jCm4jknpBHz22WPtUp1xXVWnrkDf/NijNoWMwecM3YGT+qvz84Vaau8XdHSD6SXA/JrGIOu7WSQC+xGhAnQcGV5a6rg7lcyzjNZypS0Bn4A9LxLq2uOUgdB04t89/1O/w1cDnyilFU=";
const LINE_GROUP_ID = "Cf22d3ef700a771c636ff04120cc57fbc";

exports.sendLineMessage = functions.https.onRequest(async (req, res) => {
  const message = req.body.message || "水やり完了の記録がありました！";

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LINE_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: LINE_GROUP_ID,
      messages: [{ type: "text", text: message }],
    }),
  });

  const result = await response.json();
  res.status(200).send(result);
});
