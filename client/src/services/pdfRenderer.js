import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set worker source to bundled local worker with fallback
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker || `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

const pdfCache = new Map();

export async function getPdfDocument(fileUrl) {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
  const fullUrl = fileUrl.startsWith('http')
    ? fileUrl
    : new URL(cleanBase + cleanPath, window.location.href).href;

  if (pdfCache.has(fullUrl)) {
    return pdfCache.get(fullUrl);
  }

  const loadingTask = pdfjsLib.getDocument({
    url: fullUrl,
    withCredentials: false,
  });
  const pdf = await loadingTask.promise;
  pdfCache.set(fullUrl, pdf);
  return pdf;
}

export async function renderPdfPageToDataUrl(fileUrl, pageNumber = 1, scale = 1.4) {
  try {
    const pdf = await getPdfDocument(fileUrl);
    const validPageNum = Math.max(1, Math.min(pageNumber, pdf.numPages));
    const page = await pdf.getPage(validPageNum);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.85),
      totalPages: pdf.numPages,
      currentPage: validPageNum
    };
  } catch (err) {
    console.error('Failed to render PDF page:', err);
    throw err;
  }
}
