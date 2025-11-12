// site-081125/scripts/liqpay.js

// 1) Конфиги (оставь свои значения, URL уже твой):
const SUPABASE_URL = "https://yqhzekifwxotizsmaeaf.supabase.co";
// Анонимный ключ (тот же, что ты уже используешь на hall.html для Supabase):
const SUPABASE_ANON_KEY = "sb_publishable_z1h_G-7K7HGCjOUtRZpI9Q_o1m9inZM";

// 2) URL Edge-функции (название у тебя v1/liqpay-init):
const FN_URL = `${SUPABASE_URL}/functions/v1/liqpay-init`;

// 3) Хелпер чтения query-параметров
function q(name, def=""){ const u=new URL(location.href); return u.searchParams.get(name) || def; }

// 4) Собираем данные заказа из URL
function getOrderPayload() {
  return {
    show:       q("show",""),
    seats:      q("seats",""),          // "P18-M8,P18-M9"
    amount:     Number(q("amount","0")),
    order_id:   q("order_id",""),
    name:       q("name",""),
    phone:      q("phone",""),
    email:      q("email",""),
    // Куда вернёт LiqPay после оплаты (страница «спасибо»):
    result_url: location.origin + "/site-081125/thankyou.html",
    // Куда LiqPay будет слать серверные нотификации (можно оставить как в функции)
    server_url: "" // если функция сама подставляет — можно пустую строку
  };
}

// 5) Вешаем обработчик на кнопку
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("pay-liqpay");
  const msgEl = document.getElementById("pay-error");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    msgEl && (msgEl.textContent = "");

    try {
      const payload = getOrderPayload();

      // ВАЖНО: только Authorization. Не добавляем 'apikey' — из-за CORS.
      const r = await fetch(FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + SUPABASE_ANON_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!r.ok) {
        const txt = await r.text().catch(()=> "");
        throw new Error(`HTTP ${r.status} ${r.statusText} ${txt}`);
      }

      const data = await r.json();

      // Два возможных сценария выдачи от функции:
      // 1) Вернёт прямой checkout_url — тогда просто редиректим:
      if (data.checkout_url) {
        location.href = data.checkout_url;
        return;
      }
      // 2) Вернёт форму (action + params data/signature) — создаём и сабмитим скрытую форму:
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

      throw new Error("Неожиданный ответ функции. Нет checkout_url / (action,data,signature).");
    } catch (e) {
      console.error(e);
      if (msgEl) {
        msgEl.textContent = "Помилка ініціалізації оплати: " + (e.message || e.toString());
      } else {
        alert("Помилка ініціалізації оплати: " + (e.message || e.toString()));
      }
    }
  });
});
