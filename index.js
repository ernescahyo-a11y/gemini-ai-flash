import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import multer from "multer";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";


const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.json());


const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = "gemini-2.5-flash";

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server berjalan di port ${PORT}`);
});

// Fungsi Helper
function extractText(resp) {
try {
    const text =
    resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
    resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
    resp?.response?.candidates?.[0]?.content?.text;

    return text ?? JSON.stringify(resp, null, 2);
} catch (err) {
    console.error("Error extracting text:", err);
    return JSON.stringify(resp, null, 2);
}
}

// 1. Endpoint untuk mengirimkan teks
app.post("/generate-text", async (req, res) => {
try {
    const { prompt } = req.body;

    if (!prompt) {
    return res.status(400).json({ error: "Tulis sebuah prompt!" });
    }

    const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

    const result = await model.generateContent({
    contents: [{ parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    res.json({ result: extractText(response) });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
}
});

// 2. Endpoint untuk mengirimkan gambar
app.post("/generate-from-image", upload.single("image"), async (req, res) => {
    const filePath = req.file?.path;
    try {
        const { prompt = "Deskripsikan Gambar Berikut:" } = req.body;
        
        if (!filePath) {
            return res.status(400).json({ error: "File Gambar Dibutuhkan!" });
        }

        const imageBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
        const model = ai.getGenerativeModel({ model: GEMINI_MODEL });
        
        const result = await model.generateContent({
            contents: [
                {
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: req.file.mimetype, data: imageBase64 } }
                    ]
                }
            ]
        });

        const response = await result.response;
        res.json({ result: extractText(response) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (filePath) {
            fs.unlinkSync(filePath);
        }
    }
});

// 3. Endpoint untuk mengirimkan dokumen
app.post("/generate-from-document", upload.single("document"), async (req, res) => {
    const filePath = req.file?.path;
    try {
        const { prompt = "Ringkaskan Dokumen Berikut:" } = req.body;
        
        if (!filePath) {
            return res.status(400).json({ error: "File Dokumen Dibutuhkan!" });
        }

        const documentBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
        const model = ai.getGenerativeModel({ model: GEMINI_MODEL });
        
        const result = await model.generateContent({
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inlineData: { mimeType: req.file.mimetype, data: documentBase64 }
                        }
                    ]
                }
            ]
        });

        const response = await result.response;
        res.json({ result: extractText(response) });
    } catch (err) {
        console.error("Document processing error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (filePath) {
            fs.unlinkSync(filePath);
        }
    }
});

// 4. Endpoint untuk mengirimkan audio
app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
    const filePath = req.file?.path;
    try {
        const { prompt = "Transkrip dan analisis audio berikut:" } = req.body;
        
        if (!filePath) {
            return res.status(400).json({ error: "File Audio Dibutuhkan!" });
        }

        const audioBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
        const model = ai.getGenerativeModel({ model: GEMINI_MODEL });
        
        const result = await model.generateContent({
            contents: [
                {
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: req.file.mimetype, data: audioBase64 } }
                    ]
                }
            ]
        });

        const response = await result.response;
        res.json({ result: extractText(response) });
    } catch (err) {
        console.error("Audio processing error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (filePath) {
            fs.unlinkSync(filePath);
        }
    }
});