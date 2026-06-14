/* CONTRASTE ATELIER — reservation engine
   Visitors pick experiences + a published date/time slot; on send, a complete
   summary lands directly in the owner's WhatsApp (or email). No backend.
   Owner edits available days/times in window.CA_AVAILABILITY (see the HTML head). */
(function () {
  'use strict';

  var CFG = window.CA_CONFIG || {};
  var WA = (CFG.waNumber || '').replace(/[^0-9]/g, '');
  var EMAIL = CFG.email || '';
  var KEY = 'ca_reservation_v1';
  var SKEY = 'ca_slot_v1';

  var cart = load();
  var slot = loadSlot();

  var WD_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MO_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function names() { var d = window.CA_DATENAMES && window.CA_DATENAMES[window.CA_LANG]; return d || { wd: WD_EN, mo: MO_EN }; }
  function T(k) { return window.CA_T ? window.CA_T(k) : k; }

  // ---------- storage ----------
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }
  function loadSlot() { try { return JSON.parse(localStorage.getItem(SKEY)) || null; } catch (e) { return null; } }
  function saveSlot() { try { localStorage.setItem(SKEY, JSON.stringify(slot)); } catch (e) {} }

  // ---------- helpers ----------
  function money(n) { return '$' + Number(n || 0).toLocaleString('en-US') + ' MXN'; }
  function count() { return cart.reduce(function (s, c) { return s + c.qty; }, 0); }
  function total() { return cart.reduce(function (s, c) { return s + c.price * c.qty; }, 0); }
  function hasFrom() { return cart.some(function (c) { return c.from; }); }
  function dparts(ds) { var p = ds.split('-'); return { m: +p[1], d: +p[2], dt: new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])) }; }
  function fmtLong(ds) { var p = dparts(ds), n = names(); return n.wd[p.dt.getUTCDay()] + ', ' + n.mo[p.m - 1] + ' ' + p.d; }
  function slotReady() { return !!(slot && slot.date && slot.time); }
  function $(id) { return document.getElementById(id); }

  // ---------- cart mutations ----------
  function add(item) {
    var ex = cart.filter(function (c) { return c.id === item.id; })[0];
    if (ex) ex.qty += 1;
    else cart.push({ id: item.id, title: item.title, price: item.price, from: !!item.from, qty: 1 });
    save(); render(); open();
  }
  function stepQty(id, d) {
    var c = cart.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    c.qty += d;
    if (c.qty < 1) cart = cart.filter(function (x) { return x.id !== id; });
    save(); render();
  }
  function removeItem(id) { cart = cart.filter(function (x) { return x.id !== id; }); save(); render(); }

  var el = {};

  // ---------- render: cart ----------
  function render() {
    var n = count();
    if (el.count) { el.count.textContent = n; el.count.setAttribute('data-empty', String(n === 0)); }
    if (!el.list) return;

    el.list.innerHTML = cart.map(function (c) {
      return '' +
        '<div class="ci" data-id="' + c.id + '">' +
          '<div class="ci__main">' +
            '<span class="ci__title">' + c.title + '</span>' +
            '<span class="ci__price">' + (c.from ? T('from') + ' ' : '') + money(c.price * c.qty) + '</span>' +
          '</div>' +
          '<div class="ci__ctrl">' +
            '<div class="qty">' +
              '<button type="button" class="qty__b" data-act="dec" aria-label="Remove one">\u2212</button>' +
              '<span class="qty__n">' + c.qty + '</span>' +
              '<button type="button" class="qty__b" data-act="inc" aria-label="Add one">+</button>' +
            '</div>' +
            '<button type="button" class="ci__rm" data-act="rm">' + T('remove') + '</button>' +
          '</div>' +
        '</div>';
    }).join('');

    var noItems = cart.length === 0;
    var canProceed = !noItems || slotReady();
    if (el.empty) el.empty.style.display = noItems ? 'block' : 'none';
    if (el.foot) el.foot.style.display = canProceed ? 'block' : 'none';
    if (el.next) el.next.disabled = !canProceed;
    if (el.total) el.total.textContent = money(total()) + (hasFrom() ? ' +' : '');
    renderSlotRow();
  }

  function renderSlotRow() {
    if (!el.slot) return;
    if (slotReady()) {
      el.slot.hidden = false;
      el.slot.querySelector('.cart__slot-val').textContent = fmtLong(slot.date) + ' \u00b7 ' + slot.time;
    } else {
      el.slot.hidden = true;
    }
  }

  // ---------- render: booking picker ----------
  function avail() { return window.CA_AVAILABILITY || []; }

  function renderBooking() {
    var datesEl = $('bookingDates');
    if (!datesEl) return;
    var list = avail();
    if (!list.length) {
      datesEl.innerHTML = '<span class="booking__hint">New dates published soon.</span>';
      return;
    }
    datesEl.innerHTML = list.map(function (a) {
      var p = dparts(a.date);
      var nm = names();
      var on = slot && slot.date === a.date ? ' is-sel' : '';
      return '<button type="button" class="bk-date' + on + '" data-date="' + a.date + '">' +
        '<span class="bk-date__wd">' + nm.wd[p.dt.getUTCDay()] + '</span>' +
        '<span class="bk-date__d">' + p.d + '</span>' +
        '<span class="bk-date__mo">' + nm.mo[p.m - 1] + '</span></button>';
    }).join('');
    renderTimes(slot ? slot.date : null);
    renderSel();
  }

  function renderTimes(date) {
    var timesEl = $('bookingTimes');
    if (!timesEl) return;
    var a = avail().filter(function (x) { return x.date === date; })[0];
    if (!a) { timesEl.innerHTML = '<span class="booking__hint">' + T('selectDay') + '</span>'; return; }
    timesEl.innerHTML = (a.slots || []).map(function (t) {
      var on = slot && slot.date === date && slot.time === t ? ' is-sel' : '';
      return '<button type="button" class="bk-time' + on + '" data-time="' + t + '">' + t + '</button>';
    }).join('');
  }

  function renderSel() {
    var selEl = $('bookingSel'), go = $('bookingGo');
    if (slotReady()) {
      if (selEl) selEl.textContent = fmtLong(slot.date) + ' \u00b7 ' + slot.time;
    } else if (slot && slot.date) {
      if (selEl) selEl.textContent = fmtLong(slot.date) + ' ' + T('chooseTime');
    } else {
      if (selEl) selEl.textContent = T('noDate');
    }
    if (go) go.disabled = !slotReady();
  }

  // ---------- summary ----------
  function summary(d) {
    var L = [];
    L.push('Nueva reservación — Contraste Atelier');
    L.push('—');
    if (d.name) L.push('Cliente: ' + d.name);
    if (d.phone) L.push('WhatsApp: ' + d.phone);
    if (d.email) L.push('Email: ' + d.email);
    if (slotReady()) L.push('Fecha: ' + fmtLong(slot.date) + ' a las ' + slot.time);
    if (d.people) L.push('Personas: ' + d.people);
    if (cart.length) {
      L.push('');
      L.push('Experiencias:');
      cart.forEach(function (c) {
        L.push('• ' + c.title + ' ×' + c.qty + ' — ' + (c.from ? 'desde ' : '') + money(c.price * c.qty));
      });
      L.push('');
      L.push('Total estimado: ' + money(total()) + (hasFrom() ? ' (algunas partidas se cotizan)' : ''));
    }
    if (d.notes) { L.push(''); L.push('Notas: ' + d.notes); }
    L.push('');
    L.push('Enviado desde el sitio de Contraste Atelier.');
    return L.join('\n');
  }
  function sendWhatsApp(text) {
    window.open((WA ? 'https://wa.me/' + WA : 'https://wa.me/') + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }
  function sendEmail(text) {
    window.location.href = 'mailto:' + encodeURIComponent(EMAIL) +
      '?subject=' + encodeURIComponent('Reservación — Contraste Atelier') +
      '&body=' + encodeURIComponent(text);
  }
  function formData() {
    var fd = new FormData(el.form);
    return { name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email'),
             people: fd.get('people'), notes: fd.get('notes') };
  }

  // ---------- drawer ----------
  function open() {
    renderSlotRow();
    el.cart.classList.add('is-open');
    el.backdrop.hidden = false;
    requestAnimationFrame(function () { el.backdrop.classList.add('is-on'); });
    el.cart.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('cart-open');
    showStep('items');
  }
  function close() {
    el.cart.classList.remove('is-open');
    el.backdrop.classList.remove('is-on');
    el.cart.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('cart-open');
    setTimeout(function () { if (!el.cart.classList.contains('is-open')) el.backdrop.hidden = true; }, 400);
  }
  function showStep(name) { el.items.hidden = name !== 'items'; el.form.hidden = name !== 'form'; }
  function scrollToReserve() {
    var r = document.getElementById('reserve');
    if (!r) return;
    window.scrollTo({ top: r.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' });
  }

  // ---------- init ----------
  function init() {
    el.cart = $('cart'); el.backdrop = $('cartBackdrop');
    el.count = $('cartCount'); el.list = $('cartList'); el.empty = $('cartEmpty');
    el.foot = $('cartFoot'); el.total = $('cartTotal'); el.next = $('cartNext');
    el.items = $('cartItems'); el.form = $('cartForm'); el.slot = $('cartSlot');
    if (!el.cart) return;

    // add-to-reservation buttons
    document.querySelectorAll('[data-add]').forEach(function (b) {
      var fire = function (e) {
        e.preventDefault();
        add({ id: b.getAttribute('data-id'), title: b.getAttribute('data-title'),
              price: Number(b.getAttribute('data-price')), from: b.getAttribute('data-from') === 'true' });
        b.classList.add('is-added');
        setTimeout(function () { b.classList.remove('is-added'); }, 1000);
      };
      b.addEventListener('click', fire);
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') fire(e); });
    });

    // open / close
    var cartBtn = $('cartBtn');
    if (cartBtn) cartBtn.addEventListener('click', open);
    $('cartClose').addEventListener('click', close);
    el.backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    // item controls
    el.list.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]'); if (!btn) return;
      var row = e.target.closest('.ci'); if (!row) return;
      var id = row.getAttribute('data-id'), act = btn.getAttribute('data-act');
      if (act === 'inc') stepQty(id, 1);
      else if (act === 'dec') stepQty(id, -1);
      else if (act === 'rm') removeItem(id);
    });

    // slot change link
    if (el.slot) {
      var ch = $('cartSlotChange');
      if (ch) ch.addEventListener('click', function () { close(); setTimeout(scrollToReserve, 320); });
    }

    // steps
    el.next.addEventListener('click', function () { if (cart.length || slotReady()) showStep('form'); });
    $('cartBack').addEventListener('click', function () { showStep('items'); });

    // submit
    el.form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!cart.length && !slotReady()) { showStep('items'); return; }
      sendWhatsApp(summary(formData()));
    });
    $('cartEmail').addEventListener('click', function () {
      if (!cart.length && !slotReady()) { showStep('items'); return; }
      sendEmail(summary(formData()));
    });

    // booking picker
    var datesEl = $('bookingDates');
    if (datesEl) {
      datesEl.addEventListener('click', function (e) {
        var b = e.target.closest('.bk-date'); if (!b) return;
        var date = b.getAttribute('data-date');
        slot = { date: date, time: (slot && slot.date === date) ? slot.time : null };
        saveSlot();
        datesEl.querySelectorAll('.bk-date').forEach(function (x) { x.classList.toggle('is-sel', x === b); });
        renderTimes(date); renderSel(); render();
      });
      var timesEl = $('bookingTimes');
      timesEl.addEventListener('click', function (e) {
        var b = e.target.closest('.bk-time'); if (!b || !slot) return;
        slot.time = b.getAttribute('data-time'); saveSlot();
        timesEl.querySelectorAll('.bk-time').forEach(function (x) { x.classList.toggle('is-sel', x === b); });
        renderSel(); render();
      });
      var go = $('bookingGo');
      if (go) go.addEventListener('click', function () { if (slotReady()) open(); });
      renderBooking();
    }

    // reserve section collapse toggle
    var rt = $('reserveToggle'), rsec = $('reserve');
    if (rt && rsec) {
      rt.addEventListener('click', function () {
        var openNow = rsec.classList.toggle('is-open');
        rt.setAttribute('aria-expanded', String(openNow));
      });
    }

    // re-render when language changes
    window.addEventListener('ca:lang', function () { renderBooking(); render(); });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
