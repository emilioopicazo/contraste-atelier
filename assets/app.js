/* CONTRASTE ATELIER — interactions
   Implementation note: set WA_NUMBER to the real WhatsApp number (international, digits only). */
(function () {
  'use strict';

  // ----- preloader: hold ~3s, then reveal the site + trigger hero entrance -----
  (function preloader() {
    var root = document.documentElement;
    var reveal = function () { root.classList.add('loaded'); };
    setTimeout(reveal, 3000);        // ~3s splash
    setTimeout(reveal, 6000);        // hard safety net
  })();

  // ----- WhatsApp wiring -----
  var CFG = window.CA_CONFIG || {};
  var WA_NUMBER = (CFG.waNumber || '5219840000000').replace(/[^0-9]/g, ''); // set in CA_CONFIG
  var WA_DEFAULT = 'Hi! I found Contraste Atelier and I\u2019d like to ask about availability and booking an experience.';
  function waLink(msg) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg || WA_DEFAULT);
  }
  document.querySelectorAll('[data-wa]').forEach(function (el) {
    el.setAttribute('href', waLink(el.getAttribute('data-msg')));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  // ----- Instagram wiring -----
  var IG_URL = 'https://www.instagram.com/contraste_atelier/';
  document.querySelectorAll('[data-ig]').forEach(function (el) {
    el.setAttribute('href', IG_URL);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  // ----- videos: autoplay reliably, then play only while in view (perf + battery) -----
  var vids = document.querySelectorAll('video');
  function tryPlay(v) {
    // re-assert these as JS properties — some mobile browsers ignore the
    // HTML attributes alone and silently block playback otherwise
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {
      // not enough data yet, or autoplay still blocked — retry once ready
      v.addEventListener('loadeddata', function () { tryPlay(v); }, { once: true });
    });
  }
  if (vids.length) {
    vids.forEach(function (v) {
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      tryPlay(v);
    });

    if ('IntersectionObserver' in window) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) tryPlay(en.target);
          else en.target.pause();
        });
      }, { threshold: 0.01, rootMargin: '200px 0px' });
      vids.forEach(function (v) { vio.observe(v); });
    }

    // some mobile browsers only allow play() once the user has interacted
    // with the page — resume any still-paused, in-view videos on first touch
    var resumeVideos = function () {
      vids.forEach(function (v) { if (v.paused && inView(v)) tryPlay(v); });
    };
    ['touchstart', 'click', 'scroll', 'keydown'].forEach(function (evt) {
      document.addEventListener(evt, resumeVideos, { passive: true, once: true });
    });
  }

  // ----- sticky header state -----
  var head = document.getElementById('head');
  function onScroll() {
    head.setAttribute('data-scrolled', String(window.scrollY > 24));
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ----- smooth anchor scroll -----
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  // ----- reveal on scroll -----
  var revealEls = document.querySelectorAll('.reveal');
  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.top < (window.innerHeight || 800) * 0.95 && r.bottom > 0;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(function (el) {
    if (inView(el)) el.classList.add('in'); // paint above-the-fold immediately
    else io.observe(el);
  });
  // safety: never leave content permanently hidden (offscreen/embedded contexts)
  setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('in'); }); }, 3000);

  // ----- FAQ: single-open accordion -----
  var faqs = document.querySelectorAll('.faq details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
