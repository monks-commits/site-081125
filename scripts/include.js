<script>
/**
 * Глобальная база сайта (папка GitHub Pages).
 * На GitHub Pages страница живет по /site-081125/ — поэтому все инклюды и ссылки
 * тянем по абсолютному пути от этой базы.
 */
const BASE = '/site-081125';

async function inject(selector, url) {
  try {
    const el = document.querySelector(selector);
    if (!el) return;
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
    el.innerHTML = await r.text();

    // правим относительные ссылки внутри инклюдов
    el.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('http')) return;
      // если ссылка относительная — делаем абсолютной от BASE
      if (!href.startsWith('/')) a.setAttribute('href', BASE + '/' + href.replace(/^\.\//,''));
    });

    el.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (!src) return;
      if (src.startsWith('http')) return;
      if (!src.startsWith('/')) img.setAttribute('src', BASE + '/' + src.replace(/^\.\//,''));
    });

  } catch (e) {
    console.warn('include failed', url, e);
  }
}

// Шапка и подвал всегда тянутся из корня сайта
inject('#site-header', `${BASE}/header.html`);
inject('#site-footer', `${BASE}/footer.html`);
</script>
