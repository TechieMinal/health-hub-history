const express = require("express");

const router = express.Router();

router.post("/", async (req, res) => {

  const { message } = req.body;

  let reply = "Sorry, I didn't understand.";

  if (message.toLowerCase().includes("upload")) {
    reply = "You can upload records from the dashboard using the upload button.";
  }

  if (message.toLowerCase().includes("appointment")) {
    reply = "Appointments can be booked in the appointments section.";
  }

  res.json({ reply });

});

module.exports = router;