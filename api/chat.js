// Vercel Serverless Function for /api/chat

const MISTRAL_KEY = process.env.MISTRAL_API_KEY;
const HF_TOKEN    = process.env.HF_TOKEN;


export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    model = 'mistral/pixtral-12b-2409',
    messages = [],
    images = []
  } = req.body || {};

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');


  try {
    if (model.startsWith('mistral/')) {
      let targetModel = 'pixtral-12b-2409';
      if (model.includes('code') || model.includes('codestral')) {
        targetModel = 'codestral-latest';
      } else if (model.includes('mini') || model.includes('8b')) {
        targetModel = 'ministral-8b-latest';
      }

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
    } else {
      // Hugging Face models
      let targetModel = 'Qwen/Qwen2.5-72B-Instruct';
      if (model.includes('deepseek') || model.includes('r1')) {
        targetModel = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B';
      } else if (model.includes('llama')) {
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

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat error:', err.message);
    const friendly = `⚠️ Ошибка: ${err.message}`;
    for (const w of friendly.split(' ')) {
      await new Promise(r => setTimeout(r, 12));
      res.write(`data: ${JSON.stringify({ content: w + ' ' })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }
}
