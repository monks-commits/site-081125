// scripts/liqpay.js

// ---- Конфиг ----
const SUPABASE_URL = "https://yqhzekifwxotizsmaeaf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_z1h_G-7K7HGCjOUtRZpI9Q_o1m9inZM";
const FN_URL = `${SUPABASE_URL}/functions/v1/liqpay-init`;

// ---- helpers ----
function qp(name, def = "") {
  const u = new URL(location.href);
  return u.searchParams.get(name) || def;
}

function getOrderPayload() {
  return {
    show:     qp("show",""),
    seats:    qp("seats",""),
    amount:   Number(qp("amount","0")),
    order_id: qp("order_id",""),
    name:     qp("name",""),
    phone:    qp("phone",""),
    email:    qp("email",""),
    result_url: location.origin + "/thankyou.html",
    server_url: "" // якщо сервер сам підставляє — лишаємо порожнім
  };
}

async function callEdge(payload) {
  // Перший варіант — прямий fetch із двома заголовками
  let r = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Дві опції — щоб підійшло до будь-якої перевірки в функції
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY
    },
    body: JSON.stringify(payload),
    // важливо: НІЯКОГО 'no-cors'
    credentials: "omit",
    cache: "no-store"
  });

  // Якщо функція повернула редирект (307/308) — довантажимо по Location
  if (r.status >= 300 && r.status < 400 && r.headers.get("Location")) {
    r = await fetch(r.headers.get("Location"), { cache: "no-store" });
  }
  return r;
}

// ---- main ----
document.addEventListener("DOMContentLoaded", () => {
  const btn  = document.getElementById("pay-liqpay");
  const msg  = document.getElementById("pay-error");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    msg && (msg.textContent = "");
    btn.disabled = true;

    try {
      const payload = getOrderPayload();
      const res = await callEdge(payload);

      if (!res.ok) {
        const txt = await res.text().catch(()=> "");
        throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
      }

      const data = await res.json();

      // Вариант А: функция отдала пряму ссылку на LiqPay
      if (data.checkout_url) {
        location.href = data.checkout_url;
        return;
      }

      // Вариант Б: функция отдала action + {data, signature}
      if (data.action && data.data && data.signature) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.action;
        form.style.display = "none";

        const f1 = document.createElement("input");
        f1.name = "data"; f1.value = data.data; form.appendChild(f1);
        const f2 = document.createElement("input");
        f2.name = "signature"; f2.value = data.signature; form.appendChild(f2);

        document.body.appendChild(form);
        form.submit();
        return;
      }

      throw new Error("Неожиданный ответ функции: нет checkout_url и нет action/data/signature.");
    } catch (e) {
      console.error(e);
      msg && (msg.textContent = "Помилка ініціалізації оплати: " + (e.message || e));
    } finally {
      btn.disabled = false;
    }
  });
});
