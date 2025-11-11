async function inject(sel, url) {
  const host = document.querySelector(sel);
  if (!host) return;
  const res = await fetch(url);
  if (res.ok) host.innerHTML = await res.text();
}

// Если фрагменты лежат в папке partials:
inject('#site-header', './partials/header.html');
inject('#site-footer', './partials/footer.html');

// Если у тебя header/footer лежат в корне — замени пути на:
// inject('#site-header', './header.html');
// inject('#site-footer', './footer.html');
