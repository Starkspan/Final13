
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());
app.use(express.json());

const werkstoffe = {
  aluminium: 2.7,
  stahl: 7.85,
  edelstahl: 8.0,
  messing: 8.4,
  kupfer: 8.96,
};

function berechneRohmasse(laenge, durchmesser) {
  const rohLaenge = laenge <= 100 ? laenge + 5 : laenge + 10;

  let rohDurchmesser;
  if (durchmesser <= 50) rohDurchmesser = durchmesser + 2;
  else if (durchmesser <= 100) rohDurchmesser = Math.ceil(durchmesser / 5) * 5;
  else rohDurchmesser = Math.ceil(durchmesser / 10) * 10;

  return { rohLaenge, rohDurchmesser };
}

app.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    const { material, length, width, height } = req.body;
    const selectedMaterial = material.toLowerCase();
    const density = werkstoffe[selectedMaterial] || 2.0;

    const parsedLength = parseFloat(length.toString().replace(",", "."));
    const parsedWidth = parseFloat(width.toString().replace(",", "."));

    const { rohLaenge, rohDurchmesser } = berechneRohmasse(parsedLength, parsedWidth);

    const radius = rohDurchmesser / 2;
    const volume_mm3 = Math.PI * Math.pow(radius, 2) * rohLaenge;
    const volume_cm3 = volume_mm3 / 1000;
    const calculatedWeight = (volume_cm3 * density) / 1000;

    const materialCost = calculatedWeight * 1.5;
    const cncZeitMin = 10;
    const cncKosten = (cncZeitMin / 60) * 35;
    const programm = 30;
    const kostenNetto = materialCost + cncKosten + programm;
    const preisBrutto = kostenNetto * 1.15;

    res.json({
      material: selectedMaterial,
      rohgewicht_kg: calculatedWeight.toFixed(5),
      materialkosten: materialCost.toFixed(2),
      cncKosten: cncKosten.toFixed(2),
      gesamtpreis: preisBrutto.toFixed(2)
    });

    fs.unlinkSync(req.file.path);
  } catch (err) {
    res.status(500).json({ error: "Analysefehler: " + err.message });
  }
});

app.listen(10000, () => {
  console.log("✅ Starkspan Backend läuft auf Port 10000");
});
