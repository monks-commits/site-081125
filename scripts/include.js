/**
 * Глобальная база сайта (папка GitHub Pages).
 * На GitHub Pages сайт живёт по / — поэтому все инклюды и ссылки
 * тянем по абсолютному пути от этой базы.
 */
const BASE = '';

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


/**
 * Cloudflare Web Analytics
 *
 * Подключаем счётчик централизованно через общий include.js,
 * чтобы не вставлять код вручную в каждую HTML-страницу.
 */
function initCloudflareAnalytics() {
  // Защита от повторного подключения
  if (document.getElementById('va-cloudflare-analytics')) return;

  const script = document.createElement('script');

  script.id = 'va-cloudflare-analytics';
  script.type = 'module';
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';

  script.setAttribute(
    'data-cf-beacon',
    JSON.stringify({
      token: 'ed847c1eea644244bd7b9e86817bdb9a'
    })
  );

  document.body.appendChild(script);
}


// Вклеиваем шапку/подвал и запускаем аналитику
window.addEventListener('DOMContentLoaded', () => {
  inject('#site-header', '/header.html');
  inject('#site-footer', '/footer.html');

  initCloudflareAnalytics();
});
