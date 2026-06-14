/* CONTRASTE ATELIER — language toggle (EN / ES). Prices always shown in MXN. */
(function () {
  'use strict';
  var KEY = 'ca_lang';
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  var lang = (stored === 'es' || stored === 'en') ? stored : 'en';
  window.CA_LANG = lang;

  /* dynamic strings used by JS (cart + booking picker) */
  var STR = {
    en: { selectDay: 'Select a day first.', noDate: 'No date selected yet',
          chooseTime: '\u2014 choose a time', remove: 'Remove', from: 'from' },
    es: { selectDay: 'Primero elige un d\u00eda.', noDate: 'Sin fecha seleccionada',
          chooseTime: '\u2014 elige una hora', remove: 'Quitar', from: 'desde' }
  };
  window.CA_T = function (k) { return (STR[window.CA_LANG] || STR.en)[k] || STR.en[k] || k; };

  /* localized day/month abbreviations for the booking picker */
  window.CA_DATENAMES = {
    en: { wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          mo: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
    es: { wd: ['Dom', 'Lun', 'Mar', 'Mi\u00e9', 'Jue', 'Vie', 'S\u00e1b'],
          mo: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] }
  };

  function swap(l) {
    var nodes = document.querySelectorAll('[data-es]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el.hasAttribute('data-en')) el.setAttribute('data-en', el.innerHTML);
      el.innerHTML = (l === 'es') ? el.getAttribute('data-es') : el.getAttribute('data-en');
    }
  }
  function mark(l) {
    var os = document.querySelectorAll('#langToggle .lang-toggle__o');
    for (var i = 0; i < os.length; i++) {
      os[i].classList.toggle('is-on', os[i].getAttribute('data-lang') === l);
    }
  }
  function setLang(l) {
    l = (l === 'es') ? 'es' : 'en';
    window.CA_LANG = l;
    document.documentElement.setAttribute('lang', l);
    try { localStorage.setItem(KEY, l); } catch (e) {}
    swap(l); mark(l);
    window.dispatchEvent(new CustomEvent('ca:lang', { detail: l }));
  }
  window.CA_setLang = setLang;

  function init() {
    var btn = document.getElementById('langToggle');
    if (btn) {
      btn.addEventListener('click', function (e) {
        var o = e.target && e.target.closest ? e.target.closest('.lang-toggle__o') : null;
        setLang(o ? o.getAttribute('data-lang') : (window.CA_LANG === 'es' ? 'en' : 'es'));
      });
    }
    setLang(window.CA_LANG);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
