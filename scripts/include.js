/**
 * Глобальная база сайта (папка GitHub Pages).
 * На GitHub Pages сайт живёт по /site-081125/ — поэтому все инклюды и ссылки
 * тянем по абсолютному пути от этой базы.
 */
const BASE = '/site-081125';

async function inject(selector, url) {
  try {
    const el = document.querySelector(selector);
    if (!el) return;

    // грузим фрагмент без кеша (чтобы правки были видны сразу)
    const r = await fetch(`${BASE}${url}`, { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
    const html = await r.text();
    el.innerHTML = html;

    // чиним относительные ссылки внутри вставленного куска
    el.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('http')) return;
      // делаем абсолютным относительно BASE
      a.setAttribute('href', `${BASE}/${href.replace(/^\/+/, '')}`);
    });
  } catch (e) {
    console.error('Include fail:', selector, url, e);
  }
}

// Вклеиваем шапку/подвал там, где есть контейнеры
window.addEventListener('DOMContentLoaded', () => {
  inject('#site-header', '/header.html');
  inject('#site-footer', '/footer.html');
});
