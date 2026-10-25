(function(){
 let language=location.pathname.startsWith('/en/')?'en':'ru';
 async function inject(selector,url){try{const el=document.querySelector(selector);if(!el)return;const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);el.innerHTML=await r.text();}catch(e){console.error('VA language include:',selector,url,e);}}
 function analytics(){if(document.getElementById('va-cloudflare-analytics'))return;const script=document.createElement('script');script.id='va-cloudflare-analytics';script.type='module';script.src='https://static.cloudflareinsights.com/beacon.min.js';script.setAttribute('data-cf-beacon',JSON.stringify({token:'ed847c1eea644244bd7b9e86817bdb9a'}));document.body.appendChild(script);}
 window.addEventListener('DOMContentLoaded',()=>{inject('#site-header','/i18n/'+language+'/header.html');inject('#site-footer','/i18n/'+language+'/footer.html');analytics()});
})();