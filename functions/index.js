const functions = require("firebase-functions");
const fetch = require("node-fetch");

const LINE_ACCESS_TOKEN = "＜あなたのLINEアクセストークン＞";
const LINE_GROUP_ID = "＜あなたのグループID＞";

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
