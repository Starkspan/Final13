
const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());

function berechneGewicht(material, durchmesser_mm, länge_mm) {
    const dichteTabelle = {
        "Stahl": 7.85,
        "Aluminium": 2.70,
        "Edelstahl": 8.00,
        "Messing": 8.40,
        "Kupfer": 8.96
    };
    const dichte = dichteTabelle[material] || 7.85;

    const radius_cm = (durchmesser_mm / 10) / 2;
    const länge_cm = länge_mm / 10;

    const volumen_cm3 = Math.PI * Math.pow(radius_cm, 2) * länge_cm;
    const gewicht_gramm = volumen_cm3 * dichte;
    const gewicht_kg = +(gewicht_gramm / 1000).toFixed(5);

    return gewicht_kg;
}

app.post("/analyze", upload.single("pdf"), (req, res) => {
    const { material, length, width, height, quantity } = req.body;

    const d = parseFloat(width || 0);
    const l = parseFloat(length || 0);
    const q = parseInt(quantity || 1);

    const rohgewicht = berechneGewicht(material, d, l);
    const materialkosten = +(rohgewicht * (material === "Aluminium" ? 7 : material === "Edelstahl" ? 6.5 : 1.5)).toFixed(2);
    const cnc_kosten = +(0.25).toFixed(2);
    const einzelpreis = +(60 + 30 + (rohgewicht * 35) + cnc_kosten + materialkosten).toFixed(2);
    const gesamtpreis = +(einzelpreis * q).toFixed(2);

    res.json({
        material,
        rohgewicht_kg: rohgewicht,
        materialkosten,
        cnc_kosten,
        einzelpreis,
        stückzahl: q,
        gesamtpreis
    });
});

app.listen(10000, () => {
    console.log("Server läuft auf Port 10000");
});
