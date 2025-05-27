const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Starkspan Backend läuft.");
});

app.listen(PORT, () => {
  console.log(`✅ Starkspan Backend läuft auf Port ${PORT}`);
});
