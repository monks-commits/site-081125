async function inject(sel, url) {
  const el = document.querySelector(sel);
  if (!el) return;
  const r = await fetch(url);
  if (r.ok) el.innerHTML = await r.text();
}
inject('#site-header', './header.html');
inject('#site-footer', './footer.html');


// Если у тебя header/footer лежат в корне — замени пути на:
// inject('#site-header', './header.html');
// inject('#site-footer', './footer.html');
