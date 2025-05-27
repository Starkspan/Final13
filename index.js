const express = require("express");
const multer = require("multer");
const app = express();
const PORT = process.env.PORT || 10000;

const upload = multer({ dest: "uploads/" });

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Starkspan Backend läuft.");
});

app.post("/analyze", upload.single("file"), (req, res) => {
  console.log("Analyse gestartet");
  res.json({ message: "Analyse erfolgreich empfangen." });
});

app.listen(PORT, () => {
  console.log(`✅ Starkspan Backend läuft auf Port ${PORT}`);
});
