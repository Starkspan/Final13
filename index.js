import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import sharp from "sharp";
import vision from "@google-cloud/vision";
import { PDFDocument } from "pdf-lib";
import path from "path";

const app = express();
const upload = multer({ dest: "uploads/" });
const client = new vision.ImageAnnotatorClient();
app.use(cors());
app.use(express.json());

const werkstoffe = JSON.parse(fs.readFileSync("./werkstoffe.json", "utf-8"));

function extractMaterial(text) {
  for (const key in werkstoffe) {
    if (text.includes(key)) return { nummer: key, bezeichnung: werkstoffe[key] };
  }
  return { nummer: "Unbekannt", bezeichnung: "Nicht erkannt" };
}

async function convertPdfToPng(pdfPath, outputPath) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(0);
  const pngBuffer = await sharp(Buffer.from(await page.embedPng())).png().toBuffer();
  fs.writeFileSync(outputPath, pngBuffer);
}

app.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    const pdfPath = req.file.path;
    const imagePath = pdfPath + ".png";

    await convertPdfToPng(pdfPath, imagePath);

    const [result] = await client.textDetection(imagePath);
    const detections = result.textAnnotations;
    const text = detections.length > 0 ? detections[0].description : "";

    const material = extractMaterial(text);
    const preis = 60 + 30 + 35 * 0.5;
    const endpreis = Math.round(preis * 1.15 * 100) / 100;

    res.json({
      material,
      text,
      preis: endpreis
    });

    fs.unlinkSync(pdfPath);
    fs.unlinkSync(imagePath);
  } catch (err) {
    console.error("Fehler bei Analyse:", err);
    res.status(500).json({ error: "Analyse fehlgeschlagen." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));