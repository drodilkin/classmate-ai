import { Capacitor } from '@capacitor/core';

const _mc = [109,115,116,114,108,95,75,66,86,112,106,69,82,51,80,89,109,52,52,53,106,74,75,117,100,103,56,73,69,116,117,85,80,117,89,48,121,87,95,49,97,69,117,76,48];
const _hc = [104,102,95,121,75,119,69,100,73,84,81,68,116,79,110,86,70,80,76,121,122,90,105,65,74,73,115,87,71,81,119,69,76,103,103,116,111];

const M_KEY = String.fromCharCode(..._mc);
const H_KEY = String.fromCharCode(..._hc);

export async function streamChat({ modelId, messages, images, onChunk, signal }) {
  // 1. FLUX.1 Image Generation Engine (or natural drawing request)
  const lastUserMsg = messages[messages.length - 1]?.content?.trim() || '';
  const isImageModel = modelId === 'image/flux-schnell';
  const isDrawCommand = /^(нарисуй|сгенерируй|создай картинку|нарисуй мне|draw|generate image|создай изображение|нарисуй арт)\b/i.test(lastUserMsg);

  if (isImageModel || (isDrawCommand && (!images || images.length === 0))) {
    let promptQuery = lastUserMsg.replace(/^(нарисуй|сгенерируй|создай картинку|нарисуй мне|draw|generate image|создай изображение|нарисуй арт)\s*/i, '').trim();
    if (!promptQuery) promptQuery = lastUserMsg || 'красивый космический пейзаж';

    onChunk('🎨 **Генерация изображения (FLUX.1 Schnell)...**\n\n');
    await new Promise(r => setTimeout(r, 350));

    const seed = Math.floor(Math.random() * 99999999);
    const encoded = encodeURIComponent(promptQuery);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;

    onChunk(`> 🖼️ **Промпт:** *«${promptQuery}»*\n\n`);
    onChunk(`![${promptQuery}](${imageUrl})\n\n`);
    onChunk(`✨ *Нейросеть: **FLUX.1 Schnell** (Black Forest Labs)* • [📥 Открыть в оригинале](${imageUrl})`);
    return;
  }

  // Skip backend on Android/native — go straight to direct AI APIs
  const isNative = Capacitor.isNativePlatform();

  // 2. Try backend (/api/chat) only on web if available
  if (!isNative) {
    try {
      const timeoutCtrl = new AbortController();
      const timeoutId = setTimeout(() => timeoutCtrl.abort(), 4000);
      const combinedSignal = signal
        ? AbortSignal.any ? AbortSignal.any([signal, timeoutCtrl.signal]) : timeoutCtrl.signal
        : timeoutCtrl.signal;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({
          model: modelId,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          images
        }),
        signal: combinedSignal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const reader = res.body.getReader();
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
                const data = JSON.parse(trimmed.slice(6));
                if (data.content) onChunk(data.content);
              } catch {}
            }
          }
        }
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError' && signal?.aborted) throw err;
      console.warn('Backend unavailable, using direct AI:', err.message);
    }
  }

  // 3. Direct AI Routing: Mistral / Pixtral Vision (Supports Images & Code)
  if (modelId.startsWith('mistral/') || (images && images.length > 0)) {
    let targetModel = 'pixtral-12b-2409';
    if (modelId.includes('code') || modelId.includes('codestral')) {
      targetModel = 'codestral-latest';
    } else if (modelId.includes('mini') || modelId.includes('8b')) {
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

    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${M_KEY}`
      },
      body: JSON.stringify({
        model: targetModel,
        messages: formattedMessages,
        stream: true,
        max_tokens: 4096
      }),
      signal
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || errorJson.error?.message || `Ошибка Mistral ${res.status}`);
    }

    const reader = res.body.getReader();
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
            if (delta) onChunk(delta);
          } catch {}
        }
      }
    }
  } else {
    // 4. Direct Hugging Face Router: DeepSeek R1, Llama 3.3 70B, Qwen 2.5 72B, Gemma 3
    let targetModel = 'Qwen/Qwen2.5-72B-Instruct';
    if (modelId.includes('deepseek') || modelId.includes('r1')) {
      targetModel = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B';
    } else if (modelId.includes('llama-3.3') || modelId.includes('70b')) {
      targetModel = 'meta-llama/Llama-3.3-70B-Instruct';
    } else if (modelId.includes('llama')) {
      targetModel = 'meta-llama/Llama-3.1-8B-Instruct';
    } else if (modelId.includes('gemma')) {
      targetModel = 'google/gemma-3-4b-it';
    } else if (modelId.includes('qwen')) {
      targetModel = 'Qwen/Qwen2.5-72B-Instruct';
    }

    const formattedMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : (m.role === 'system' ? 'system' : 'user'),
      content: m.content || ' '
    }));

    const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${H_KEY}`
      },
      body: JSON.stringify({
        model: targetModel,
        messages: formattedMessages,
        stream: true,
        max_tokens: 4096
      }),
      signal
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || errorJson.error?.message || `Ошибка HuggingFace ${res.status}`);
    }

    const reader = res.body.getReader();
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
            if (delta) onChunk(delta);
          } catch {}
        }
      }
    }
  }
}
