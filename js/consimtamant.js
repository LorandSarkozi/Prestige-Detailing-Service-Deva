/* ==========================================================================
   Consimțământ + Google Analytics 4, comun tuturor paginilor.
   Fiecare pagină are în <head> blocul gtag('consent', 'default', ... 'denied'),
   apoi încarcă fișierul ăsta la finalul lui <body>.
   ========================================================================== */
(function () {
  'use strict';

  /* ID-ul de măsurare GA4. Cât timp e gol, Google Analytics nu se încarcă deloc. */
  var GA_ID = 'G-B7G4TJRCHC';
  var KEY = 'prd_consimtamant';   // alegerea se ține în localStorage: strict necesar, nu cere acord
  var VERSIUNE = 1;               // se crește când se schimbă ce cerem, ca bannerul să reapară

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }

  /* Bannerul: dacă pagina nu îl are deja în HTML, îl construim aici */
  var banner = document.getElementById('cookieBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.id = 'cookieBanner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie-uri');
    banner.hidden = true;
    banner.innerHTML =
      '<p>Folosim Google Analytics ca să vedem câți oameni intră pe site și ce îi interesează. Pornește doar dacă ești de acord. <a href="/confidentialitate.html">Detalii</a></p>' +
      '<div class="cookie-prefs" id="cookiePrefs" hidden>' +
        '<label><input type="checkbox" id="ckStat" /> <span>Statistici<small>Google Analytics: câte vizite, din ce surse, ce pagini.</small></span></label>' +
        '<label><input type="checkbox" id="ckAds" /> <span>Reclame<small>Măsurarea campaniilor Google Ads: ce reclamă a adus un apel sau un mesaj.</small></span></label>' +
      '</div>' +
      '<div class="cookie-actions">' +
        '<button type="button" class="btn-gold btn-sm" id="ckAccept">Accept</button>' +
        '<button type="button" class="btn-outline btn-sm" id="ckReject">Refuz</button>' +
        '<button type="button" class="link-btn" id="ckCustom">Aleg eu</button>' +
        '<button type="button" class="btn-outline btn-sm" id="ckSave" hidden>Salvez alegerea</button>' +
      '</div>';
    document.body.appendChild(banner);
  }

  var prefs   = document.getElementById('cookiePrefs');
  var ckStat  = document.getElementById('ckStat');
  var ckAds   = document.getElementById('ckAds');
  var btnSave = document.getElementById('ckSave');
  var gaIncarcat = false;
  var stare = null;

  function citeste() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      return (s && s.v === VERSIUNE) ? s : null;
    } catch (e) { return null; }
  }

  function stergeCookieGA() {
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var nume = c.split('=')[0].trim();
      if (/^_ga|^_gcl|^_gid/.test(nume)) {
        ['', host, '.' + host].forEach(function (d) {
          document.cookie = nume + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  function incarcaGA() {
    if (gaIncarcat || !GA_ID) return;
    gaIncarcat = true;
    // Pe localhost și în previzualizări, evenimentele rămân doar în dataLayer: nu ajung în GA
    if (!/(^|\.)prestigedetailing\.ro$/.test(location.hostname)) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function aplica(s) {
    stare = s;
    gtag('consent', 'update', {
      analytics_storage:  s.stat ? 'granted' : 'denied',
      ad_storage:         s.ads  ? 'granted' : 'denied',
      ad_user_data:       s.ads  ? 'granted' : 'denied',
      ad_personalization: s.ads  ? 'granted' : 'denied'
    });
    if (s.stat || s.ads) incarcaGA();
  }

  function salveaza(stat, ads) {
    var s = { v: VERSIUNE, stat: !!stat, ads: !!ads, data: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    banner.hidden = true;
    // Refuz sau retragere: ștergem orice cookie Google rămas; dacă scriptul rula deja, reîncărcăm pagina
    if (!s.stat && !s.ads) {
      stergeCookieGA();
      if (gaIncarcat) { location.reload(); return; }
    }
    aplica(s);
  }

  function arataBanner(cuSetari) {
    ckStat.checked = !!(stare && stare.stat);
    ckAds.checked  = !!(stare && stare.ads);
    prefs.hidden = !cuSetari;
    btnSave.hidden = !cuSetari;
    banner.hidden = false;
  }

  document.getElementById('ckAccept').addEventListener('click', function () { salveaza(true, true); });
  document.getElementById('ckReject').addEventListener('click', function () { salveaza(false, false); });
  document.getElementById('ckCustom').addEventListener('click', function () { arataBanner(true); });
  btnSave.addEventListener('click', function () { salveaza(ckStat.checked, ckAds.checked); });
  var linkSetari = document.getElementById('cookieSettings');
  if (linkSetari) linkSetari.addEventListener('click', function () { arataBanner(true); });

  var salvat = citeste();
  if (salvat) aplica(salvat); else arataBanner(false);

  /* ---- Evenimente de conversie: pleacă doar cu acord la statistici ---- */
  window.prdTrack = function (nume, parametri) {
    if (stare && stare.stat && gaIncarcat) gtag('event', nume, parametri || {});
  };

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    var unde = a.closest('footer') ? 'footer' : (a.closest('nav') ? 'meniu' : 'pagina');
    if (href.indexOf('tel:') === 0) {
      window.prdTrack('apel_telefon', { numar: href.replace('tel:', ''), locatie: unde });
    } else if (href.indexOf('https://wa.me/') === 0) {
      window.prdTrack('click_whatsapp', { locatie: unde });
    } else if (href.indexOf('mailto:') === 0) {
      window.prdTrack('click_email', { locatie: unde });
    } else if (/facebook\.com|instagram\.com|tiktok\.com/.test(href)) {
      window.prdTrack('click_social', { retea: (href.match(/(facebook|instagram|tiktok)/) || [])[1], locatie: unde });
    } else if (a.id === 'mapOpen') {
      window.prdTrack('deschide_harta', { locatie: unde });
    }
  });
})();
