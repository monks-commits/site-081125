(function(){
 const pages=new Set(['','index.html','contacts.html','about.html','platform/index.html','platform/ticket-core.html','platform/gateway.html','platform/branding.html','platform/content-studio.html','platform/marketing.html','platform/director.html','platform/recovery.html','platform/messages.html','platform/offline-cash.html','platform/demo.html','platform/implementation.html','platform/modes.html','platform/platforms.html']);
 let pathname=decodeURIComponent(location.pathname).replace(/^\/+/, '');
 let current=(pathname.startsWith('en/')?'en':pathname.startsWith('ru/')?'ru':'ua');
 let sub=current==='ua'?pathname:pathname.slice(3); if(sub===''||sub.endsWith('/'))sub+='index.html';
 if(sub==='platform/')sub='platform/index.html';
 if(!pages.has(sub))return;
 const folder=(sub==='index.html'?'':'/'+sub).replace(/\/index\.html$/, '/');
 function link(target){ if(target==='ua')return sub==='index.html'?'/':'/'+sub; return '/'+target+'/'+sub; }
 function render(){
 const h=document.querySelector('#site-header header');if(!h||h.querySelector('.va-i18n-menu'))return false;
 const nav=h.querySelector('nav')||h.querySelector('.header-inner')||h;
 const items=['ua','ru','en'].map(l=>'<a href="'+link(l)+'" lang="'+l+'"'+(l===current?' aria-current="page"':'')+'>'+l.toUpperCase()+'</a>').join('');
 const el=document.createElement('div');el.className='va-i18n-menu';el.setAttribute('aria-label','Language / Мова / Язык');el.innerHTML=items;nav.appendChild(el);return true;
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
 function start(){if(render())return;const obs=new MutationObserver(()=>{if(render())obs.disconnect()});obs.observe(document.body,{childList:true,subtree:true});}
})();