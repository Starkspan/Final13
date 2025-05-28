
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(fileUpload());

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
    return +(gewicht_gramm / 1000).toFixed(5);
}

function berechneBearbeitungszeit(ocrtext) {
    const text = ocrtext || "";
    const bohrungen = (text.match(/[Ø⌀]\s?\d+/gi) || []).length;
    const gewinde = (text.match(/M\d+/gi) || []).length;
    const toleranzen = (text.match(/[±]\s?\d+[.,]?\d*/g) || []).length;
    const passungen = (text.match(/H7|H8|H9/gi) || []).length;
    const nuten = (text.match(/Nut|Tasche|Schlitz/gi) || []).length;
    const oberflächen = (text.match(/Rz|Ra|3\.2|6\.3/gi) || []).length;

    const minuten = bohrungen + 2 * gewinde + 2 * toleranzen + 2 * passungen + 4 * nuten + 2 * oberflächen;
    const laufzeit_h = +(minuten / 60).toFixed(2);
    const cnc_kosten = +(laufzeit_h * 35).toFixed(2);

    return {
        minuten,
        laufzeit_h,
        cnc_kosten,
        merkmale: { bohrungen, gewinde, toleranzen, passungen, nuten, oberflächen }
    };
}

app.post("/analyze", (req, res) => {
    const { material, length, width, height, quantity, ocrtext } = req.body;

    const d = parseFloat(width || 0);
    const l = parseFloat(length || 0);
    const q = parseInt(quantity || 1);
    const rohgewicht = berechneGewicht(material, d, l);
    const materialkosten = +(rohgewicht * (material === "Aluminium" ? 7 : material === "Edelstahl" ? 6.5 : 1.5)).toFixed(2);

    const analyse = berechneBearbeitungszeit(ocrtext || "");
    const rüstkosten = 60;
    const programmierkosten = 30;
    const cnc_kosten = analyse.cnc_kosten;

    const einzelpreis = +(rüstkosten + programmierkosten + (rohgewicht * 35) + cnc_kosten + materialkosten).toFixed(2);
    const gesamtpreis = +(einzelpreis * q).toFixed(2);

    res.json({
        material,
        rohgewicht_kg: rohgewicht,
        materialkosten,
        cnc_kosten,
        einzelpreis,
        stückzahl: q,
        gesamtpreis,
        bearbeitung_laufzeit_min: analyse.minuten,
        bearbeitungsmerkmale: analyse.merkmale
    });
});

app.listen(10000, () => {
    console.log("Server läuft auf Port 10000 mit OCR-Bearbeitungsanalyse");
});
