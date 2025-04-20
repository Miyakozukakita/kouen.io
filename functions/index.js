const functions = require("firebase-functions");
const fetch = require("node-fetch");

const LINE_TOKEN = functions.config().line.token; // `firebase functions:config:set line.token="..."`

exports.notifyLine = functions.https.onRequest(async (req, res) => {
  const message = req.body.message || "水やりしました🌱";

  try {
    const result = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LINE_TOKEN}`
      },
      body: JSON.stringify({
        to: "YOUR_GROUP_ID",
        messages: [{ type: "text", text: message }]
      })
    });

    const responseData = await result.json();
    res.status(200).send(responseData);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});
