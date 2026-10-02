import { marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked with highlight.js
marked.setOptions({
  gfm: true,
  breaks: true,
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {}
    }
    try {
      return hljs.highlightAuto(code).value;
    } catch (err) {}
    return code;
  }
});

// Custom renderer to add copy buttons and language badges to code blocks
const renderer = new marked.Renderer();

renderer.code = function ({ text, lang }) {
  const language = lang || 'code';
  let highlighted = text;
  
  if (language && hljs.getLanguage(language)) {
    try {
      highlighted = hljs.highlight(text, { language }).value;
    } catch (e) {}
  } else {
    try {
      highlighted = hljs.highlightAuto(text).value;
    } catch (e) {}
  }

  const encodedCode = encodeURIComponent(text);

  return `
    <div class="code-block-wrapper my-3 rounded-lg overflow-hidden border border-slate-800 bg-[#0d1117]">
      <div class="code-header flex items-center justify-between px-3.5 py-1.5 bg-[#161b22] border-b border-slate-800 text-xs text-slate-400">
        <span class="font-mono uppercase font-semibold text-slate-300 tracking-wider">${language}</span>
        <button 
          onclick="window.__copyCode(this, '${encodedCode}')" 
          class="copy-btn flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors text-xs font-sans cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Копировать</span>
        </button>
      </div>
      <pre class="!m-0 !p-4 !bg-transparent overflow-x-auto"><code class="hljs language-${language} !p-0 !bg-transparent text-sm font-mono">${highlighted}</code></pre>
    </div>
  `;
};

marked.use({ renderer });

// Global copy helper for buttons inserted in markdown HTML
if (typeof window !== 'undefined') {
  window.__copyCode = function (button, encodedCode) {
    try {
      const code = decodeURIComponent(encodedCode);
      navigator.clipboard.writeText(code).then(() => {
        const span = button.querySelector('span');
        const orig = span ? span.innerText : 'Копировать';
        if (span) span.innerText = 'Скопировано! ✓';
        button.classList.add('text-emerald-400');
        setTimeout(() => {
          if (span) span.innerText = orig;
          button.classList.remove('text-emerald-400');
        }, 2000);
      });
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };
}

export function parseMarkdown(content) {
  if (!content) return '';
  try {
    return marked.parse(content);
  } catch (err) {
    console.error('Markdown parse error:', err);
    return content;
  }
}
