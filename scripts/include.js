// /<script src="/scripts/include.js"></script>


async function injectPart(id, url) {
  try {
    const el = document.getElementById(id);
    if (!el) return;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return;
    el.innerHTML = await res.text();
  } catch (err) {
    console.warn("include fail:", id, err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  injectPart("site-header", "/partials/header.html");
  injectPart("site-footer", "/partials/footer.html");
});
