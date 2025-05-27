const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const PORT = 10000;

app.use(fileUpload());
app.use(express.json());

app.post("/analyze", (req, res) => {
  const { material, length, width, height, quantity } = req.body;
  const weight = Number(length) * Number(width) * (Number(height) || 1) * 0.00000785;
  const cnc = (weight * 35).toFixed(2);
  const matCost = (weight * 1.5).toFixed(2);
  const price = (Number(cnc) + Number(matCost)).toFixed(2);
  const total = (price * Number(quantity)).toFixed(2);
  res.json({ material, weight: weight.toFixed(5), matCost, cnc, pricePerPiece: price, quantity, total });
});

app.listen(PORT, () => {
  console.log("✅ Backend läuft auf Port", PORT);
});