
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const app = express();
const PORT = 10000;

app.use(cors());
app.use(fileUpload());
app.use(express.json());

app.post("/analyze", (req, res) => {
  const { material, length, width, height, quantity } = req.body;
  const l = parseFloat(length);
  const w = parseFloat(width);
  const h = parseFloat(height || width);
  const qty = parseInt(quantity || "1");

  const rohvolumen = (l * w * h) / 1_000_000;
  const rohgewicht = rohvolumen * 7.85;
  const matkosten = rohgewicht * 1.5;
  const cnc = rohgewicht * 35;
  const einzelpreis = (matkosten + cnc + 60 + 30) * 1.15;
  const gesamt = einzelpreis * qty;

  res.json({
    material,
    rohgewicht_kg: rohgewicht.toFixed(5),
    materialkosten: matkosten.toFixed(2),
    cnc_kosten: cnc.toFixed(2),
    einzelpreis: einzelpreis.toFixed(2),
    stückzahl: qty,
    gesamtpreis: gesamt.toFixed(2)
  });
});

app.listen(PORT, () => {
  console.log("✅ Backend läuft auf Port " + PORT);
});
