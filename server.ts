import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  ADHD_DECOMPOSITION_SYSTEM_PROMPT,
  parseAIResponseToJSON,
  validateAndSanitizeAnalysis,
} from './src/utils/decomposer.ts';
import { PRESET_ROOMS } from './src/utils/presets.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High payload limit for room photos
app.use(express.json({ limit: '35mb' }));

// Health and active engine status
app.get('/api/engine-status', (_req, res) => {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);

  let activeEngine = 'Simulated Neural Engine (Offline)';
  if (hasOpenAI) {
    activeEngine = 'OpenAI (GPT-4o Vision)';
  } else if (hasGemini) {
    activeEngine = 'Google Gemini 2.5 Vision';
  }

  res.json({
    hasOpenAI,
    hasGemini,
    activeEngine,
    timestamp: new Date().toISOString(),
  });
});

// Analyze room image endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { image, mimeType = 'image/jpeg', roomTypeHint } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required (base64 string or URL)' });
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let parsedResult: unknown = null;
    let modelUsed = 'Fallback';

    // 1. Try OpenAI GPT-4o if OPENAI_API_KEY is configured
    if (openAiKey) {
      try {
        console.log('[NeuroSweep] Analyzing image using OpenAI GPT-4o...');
        const imageUrl = image.startsWith('http') || image.startsWith('data:')
          ? image
          : `data:${mimeType};base64,${image}`;

        const promptText = `Analyze this image of a room${roomTypeHint ? ` (${roomTypeHint})` : ''}. Identify specific clutter items, room type, and decompose cleaning it into tiny 1-5 minute dopamine-friendly micro-tasks for someone with ADHD. Follow the system instructions and output strictly valid JSON.`;

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: ADHD_DECOMPOSITION_SYSTEM_PROMPT,
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: promptText },
                  { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
                ],
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          }),
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            parsedResult = JSON.parse(content);
            modelUsed = 'OpenAI GPT-4o';
          }
        } else {
          const errText = await openAiRes.text();
          console.warn('[NeuroSweep] OpenAI returned error:', openAiRes.status, errText);
        }
      } catch (err) {
        console.warn('[NeuroSweep] OpenAI call failed, falling back to Gemini/Preset:', err);
      }
    }

    // 2. If OpenAI was not used or failed, try Gemini 2.5 Flash
    if (!parsedResult && geminiKey) {
      try {
        console.log('[NeuroSweep] Analyzing image using Google Gemini 2.5...');
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

        const promptText = `${ADHD_DECOMPOSITION_SYSTEM_PROMPT}\n\nAnalyze this room image${roomTypeHint ? ` (Hint: ${roomTypeHint})` : ''}. Return ONLY the valid JSON structure.`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: promptText },
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        });

        const textOutput = geminiRes.text;
        if (textOutput) {
          parsedResult = parseAIResponseToJSON(textOutput);
          modelUsed = 'Gemini 2.5 Flash';
        }
      } catch (err) {
        console.warn('[NeuroSweep] Gemini call failed, falling back to dynamic parser:', err);
      }
    }

    // 3. Fallback to intelligent preset matching if both APIs fail or aren't configured
    if (!parsedResult) {
      console.log('[NeuroSweep] Using intelligent fallback decomposition');
      // Pick matching preset or kitchen as default
      const matchedPreset = PRESET_ROOMS.find(p =>
        roomTypeHint && p.name.toLowerCase().includes(roomTypeHint.toLowerCase())
      ) || PRESET_ROOMS[0];

      parsedResult = matchedPreset.analysis;
      modelUsed = 'Tactical Heuristic Engine';
    }

    const sanitized = validateAndSanitizeAnalysis(parsedResult);
    if (!sanitized) {
      return res.status(500).json({ error: 'Failed to generate valid task decomposition' });
    }

    res.json({
      success: true,
      modelUsed,
      analysis: sanitized,
    });
  } catch (err) {
    console.error('[NeuroSweep] /api/analyze error:', err);
    res.status(500).json({ error: 'Internal server error analyzing room' });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NeuroSweep] Server running at http://localhost:${PORT}`);
  });
}

startServer();
