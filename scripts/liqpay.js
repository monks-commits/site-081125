// scripts/liqpay.js
import { supabase } from './db.js';

// === НАСТРОЙКИ ===
const PUBLIC_KEY = 'i69132711692';   // ваш LiqPay public_key
const CURRENCY   = 'UAH';             // валюта
const RESULT_URL = location.origin + '/thanks.html'; // куда вернётся браузер після оплати

// Edge Function (будет создавать подпись с private_key на стороне Supabase)
const SIGN_FN_URL = (/* тот же проект, где ваш Supabase URL */ () => {
  // Берём из того же домена, что в scripts/db.js (supabase.url)
  // supabase.restUrl имеет вид: https://<ref>.supabase.co/rest/v1
  const u = new URL(supabase.restUrl);
  return `https://${u.hostname}/functions/v1/liqpay-sign`;
})();

// helpers
function qs(id){ return document.getElementById(id); }
function badEmail(v){ return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

// читаем параметры из URL
const qp    = new URLSearchParams(location.search);
const show  = qp.get('show');   // napр. "shevchenko/ledi"
const seats = qp.get('seats');  // "Р1-М5,Р1-М6" или "1-5,1-6"
const sum   = Number(qp.get('sum') || 0);

const orderInfo = qs('orderInfo');
const form      = qs('payForm');
const okBox     = qs('ok');
const errBox    = qs('err');
const backToHall= qs('backToHall');

// рендер информации о заказе
(function renderInfo(){
  if (!show || !seats || !sum){
    orderInfo.innerHTML = '<p>❌ Помилка: неповні дані для оплати.</p>';
    form.style.display = 'none';
    return;
  }
  const prettyShow = show.split('/').join(' / ').replace(/-/g,' ');
  orderInfo.innerHTML = `
    <strong>Вистава:</strong> ${prettyShow}<br/>
    <strong>Місця:</strong> ${seats}<br/>
    <strong>Сума:</strong> ${sum} ${CURRENCY}
  `;
  backToHall.href = `spectacles/hall.html?show=${encodeURIComponent(show)}`;
})();

form?.addEventListener('submit', onSubmit);

async function onSubmit(e){
  e.preventDefault();
  errBox.style.display = 'none';
  okBox.style.display  = 'none';

  const buyer_name  = qs('buyer_name').value.trim();
  const buyer_phone = qs('buyer_phone').value.trim();
  const buyer_email = qs('buyer_email').value.trim();

  if (!buyer_name || !buyer_phone || !buyer_email){
    errBox.textContent = 'Заповніть всі поля, будь ласка.';
    errBox.style.display = 'block';
    return;
  }
  if (badEmail(buyer_email)){
    errBox.textContent = 'Невірний формат e-mail.';
    errBox.style.display = 'block';
    return;
  }
  if (!show || !seats || !sum){
    errBox.textContent = 'Некоректні параметри замовлення.';
    errBox.style.display = 'block';
    return;
  }

  try{
    // 1) создаём запись заказа (pending) в Supabase
    const orderPayload = {
      show_slug: show,
      seats: seats.split(',').map(s=>s.trim()),
      amount: sum,
      buyer_name,
      buyer_phone,
      buyer_email,
      payment_status: 'pending'
    };
    const { data: created, error: insErr } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('*')
      .limit(1)
      .single();

    if (insErr) throw insErr;
    const order_id = created.id; // uuid из базы

    okBox.style.display = 'block';

    // 2) готовим LiqPay payload
    const description = `Квитки: ${show} (${seats})`;
    const version = 3;

    const liqPayload = {
      public_key: PUBLIC_KEY,
      action: 'pay',
      version,
      amount: sum,
      currency: CURRENCY,
      description,
      order_id,               // связываем платеж с нашим заказом
      result_url: RESULT_URL, // после оплаты
      // server_url можно добавить позже для серверных нотификаций
      // sandbox: 1, // включите для тестов при необходимости
    };

    // 3) получаем подпись и base64 data с Edge Function
    const signResp = await fetch(SIGN_FN_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(liqPayload)
    });
    if (!signResp.ok){
      const t = await signResp.text();
      throw new Error('Помилка підпису: ' + t);
    }
    const { data, signature } = await signResp.json();

    // 4) запускаем виджет LiqPay
    // https://www.liqpay.ua/documentation/api/aquiring/checkout/doc
    // eslint-disable-next-line no-undef
    LiqPayCheckout.init({
      data,
      signature,
      embedTo: "#liqpay",
      mode: "embed" // или "popup"
    })
    .on("liqpay.callback", async function(res){
      // res.status: "success", "failure", "error", "sandbox", "cancelled", ...
      const status = res?.status || 'unknown';

      // обновим заказ в базе
      await supabase.from('orders')
        .update({ payment_status: status })
        .eq('id', order_id);

      if (status === 'success' || status === 'sandbox'){
        // редирект на thanks.html с параметрами
        const url = new URL(RESULT_URL);
        url.searchParams.set('order', order_id);
        url.searchParams.set('status', status);
        location.href = url.toString();
      } else if (status === 'cancelled') {
        errBox.textContent = 'Оплату скасовано. Ви можете повторити спробу.';
        errBox.style.display = 'block';
      } else {
        errBox.textContent = 'Помилка оплати: ' + status;
        errBox.style.display = 'block';
      }
    })
    .on("liqpay.ready", function(){ /* готово */ })
    .on("liqpay.close", function(){ /* закрито */ });

  } catch (err){
    console.error(err);
    errBox.textContent = 'Помилка: ' + (err.message || err);
    errBox.style.display = 'block';
  }
}
