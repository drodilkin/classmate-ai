import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Master keys (Read from environment variables)
const MISTRAL_KEY = process.env.MISTRAL_API_KEY;
const HF_TOKEN    = process.env.HF_TOKEN;



// ─── Health Endpoint ────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    features: ['photos', 'vision', 'multi_ai', 'no_vpn', 'russia_ready'],
    models: [
      { id: 'mistral/pixtral-12b-2409', name: 'Pixtral 12B (Vision)', provider: 'Mistral AI' },
      { id: 'hf/deepseek-r1-14b', name: 'DeepSeek R1 (14B)', provider: 'Hugging Face' },
      { id: 'hf/qwen-72b', name: 'Qwen 2.5 72B', provider: 'Hugging Face' },
      { id: 'mistral/codestral-latest', name: 'Codestral 25B', provider: 'Mistral AI' },
      { id: 'hf/llama-3.1-8b', name: 'Meta Llama 3.1 8B', provider: 'Hugging Face' },
      { id: 'mistral/ministral-8b-latest', name: 'Ministral 8B', provider: 'Mistral AI' }
    ]
  });
});

// ─── Stream Mistral AI (With Vision Support) ─────────────────────────────────
async function streamMistral(res, modelId, messages, images) {
  let targetModel = 'pixtral-12b-2409';
  if (modelId.includes('code') || modelId.includes('codestral')) {
    targetModel = 'codestral-latest';
  } else if (modelId.includes('mini') || modelId.includes('8b')) {
    targetModel = 'ministral-8b-latest';
  }

  // Format messages
  const formattedMessages = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const isLast = i === messages.length - 1;
    const role = msg.role === 'assistant' ? 'assistant' : (msg.role === 'system' ? 'system' : 'user');

    if (isLast && images && images.length > 0) {
      const contentParts = [];
      if (msg.content) contentParts.push({ type: 'text', text: msg.content });
      for (const img of images) {
        contentParts.push({ type: 'image_url', image_url: { url: img } });
      }
      formattedMessages.push({ role: 'user', content: contentParts });
    } else {
      formattedMessages.push({ role, content: msg.content || ' ' });
    }
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MISTRAL_KEY}`
    },
    body: JSON.stringify({
      model: targetModel,
      messages: formattedMessages,
      stream: true,
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || errorJson.error?.message || `Ошибка Mistral ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
        } catch {}
      }
    }
  }
}

// ─── Stream Hugging Face Models (Qwen 72B, DeepSeek R1, Llama 3.1) ──────────
async function streamHuggingFace(res, modelId, messages) {
  let targetModel = 'Qwen/Qwen2.5-72B-Instruct';
  if (modelId.includes('deepseek') || modelId.includes('r1')) {
    targetModel = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B';
  } else if (modelId.includes('llama')) {
    targetModel = 'meta-llama/Llama-3.1-8B-Instruct';
  }

  const formattedMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : (m.role === 'system' ? 'system' : 'user'),
    content: m.content || ' '
  }));

  const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${HF_TOKEN}`
    },
    body: JSON.stringify({
      model: targetModel,
      messages: formattedMessages,
      stream: true,
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || errorJson.error?.message || `Ошибка HuggingFace ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
        } catch {}
      }
    }
  }
}

// ─── Main Chat Endpoint ──────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const {
    model = 'mistral/pixtral-12b-2409',
    messages = [],
    images = []
  } = req.body;

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    if (model.startsWith('mistral/')) {
      await streamMistral(res, model, messages, images);
    } else if (model.startsWith('hf/')) {
      // If user uploaded an image but chose a non-vision model, inform or auto-switch
      if (images && images.length > 0) {
        // Send a note and route through Pixtral for vision
        res.write(`data: ${JSON.stringify({ content: "*(Анализ фото выполняется через модель Pixtral Vision)*\n\n" })}\n\n`);
        await streamMistral(res, 'mistral/pixtral-12b-2409', messages, images);
      } else {
        await streamHuggingFace(res, model, messages);
      }
    } else {
      await streamMistral(res, 'mistral/pixtral-12b-2409', messages, images);
    }

    if (!res.writableEnded) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (err) {
    console.error('Chat error:', err.message);
    const friendly = `⚠️ **Ошибка запроса:** ${err.message}`;
    for (const w of friendly.split(' ')) {
      await new Promise(r => setTimeout(r, 12));
      res.write(`data: ${JSON.stringify({ content: w + ' ' })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// ─── Static files (Frontend) ─────────────────────────────────────────────────
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

if (process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Multi-AI Hub запущен: http://localhost:${PORT}`);
    console.log(`   Mistral AI:   ✅ Активен (Pixtral 12B Vision, Codestral)`);
    console.log(`   Hugging Face: ✅ Активен (Qwen 2.5 72B, DeepSeek R1 14B, Llama 3.1)`);
    console.log(`   Режим:        Без VPN в РФ (прямое подключение)`);
  });
}

export default app;

