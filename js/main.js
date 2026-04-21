/* ═══════════════════════════════════════════════════════════════
   CONTRASTE ATELIER — main.js
   Edit the CONFIG blocks below to update content without touching HTML.
   Last updated: 2026-04-20
═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════
   ★ SITE CONFIG — UPDATE THESE VALUES
═══════════════════════════════════════ */
const SITE = {
  whatsapp:   '525530374167',
  instagram:  'contraste.tulum',
  email:      'contraste-atelier@gmail.com',
  mapsUrl:    'https://maps.google.com/?q=Tulum,Mexico',
};

/* ═══════════════════════════════════════
   ★ PRODUCTS — ADD / EDIT / REMOVE HERE
   Fields: name, material, price (MXN), category, badge, imageSrc
═══════════════════════════════════════ */
const PRODUCTS = [
  {
    name:     'Raw Stone Ring',
    material: 'Sterling Silver · Labradorite',
    price:    2400,
    category: 'rings',
    badge:    'New',
    imageSrc: '',  // ← 'assets/img/raw-stone-ring.webp'
    imgStyle: 'background:linear-gradient(145deg,#d8d3c6 0%,#b8b3a8 100%)',
  },
  {
    name:     'Hammered Band',
    material: 'Sterling Silver .925',
    price:    1800,
    category: 'rings',
    badge:    '',
    imageSrc: '',
    imgStyle: 'background:linear-gradient(145deg,#2a2722 0%,#1a1715 100%)',
  },
  {
    name:     'Cast Signet',
    material: 'Sterling Silver · Wax Cast',
    price:    2200,
    category: 'rings',
    badge:    '',
    imageSrc: '',
    imgStyle: 'background:linear-gradient(145deg,#4a4540 0%,#2a2520 100%)',
  },
  {
    name:     'Oxidized Chain',
    material: 'Oxidized Silver .925',
    price:    3400,
    category: 'necklaces',
    badge:    '',
    imageSrc: '',
    imgStyle: 'background:linear-gradient(145deg,#8a857a 0%,#6a6560 100%)',
  },
  {
    name:     'Stone Pendant',
    material: 'Sterling Silver · Turquoise',
    price:    2800,
    category: 'necklaces',
    badge:    'Limited',
    imageSrc: '',
    imgStyle: 'background:linear-gradient(145deg,#c8c4bc 0%,#a8a49c 100%)',
  },
  {
    name:     'Forged Cuff',
    material: 'Sterling Silver · Hammered',
    price:    3100,
    category: 'bracelets',
    badge:    '',
    imageSrc: '',
    imgStyle: 'background:linear-gradient(145deg,#2a2218 0%,#1a1510 100%)',
  },
];

/* ═══════════════════════════════════════
   ★ CLASSES — EDIT PRICES AND NAMES
═══════════════════════════════════════ */
const CLASSES = [
  {
    id:'private',  name:'Private',   nameEs:'Individual',
    detail:'1 person · 2 hours<br>All materials included',
    detailEs:'1 persona · 2 horas<br>Todo el material incluido',
    price:3000, priceLabel:'MXN 3,000', priceSub:'per person', priceSubEs:'por persona',
  },
  {
    id:'couples',  name:'Couples',   nameEs:'Parejas',
    detail:'2 people · 2.5 hours<br>Semi-precious stones included',
    detailEs:'2 personas · 2.5 horas<br>Piedras semi-preciosas incluidas',
    price:5000, priceLabel:'MXN 5,000', priceSub:'for two', priceSubEs:'para dos',
  },
  {
    id:'group',    name:'Group',     nameEs:'Grupo',
    detail:'Up to 6 people · 3 hours<br>Min. 3 participants',
    detailEs:'Hasta 6 personas · 3 horas<br>Mín. 3 participantes',
    price:0, priceLabel:'Contact us', priceSub:'', priceSubEs:'',
  },
  {
    id:'corporate',name:'Corporate', nameEs:'Corporativo',
    detail:'Custom groups · Full day<br>Team building · Private event',
    detailEs:'Grupos · Día completo<br>Team building · Evento privado',
    price:0, priceLabel:'On request', priceSub:'', priceSubEs:'',
  },
];

/* ═══════════════════════════════════════
   ★ COLABORADORES — EDIT BRANDS
   Fields: num, name, sub, desc, link, linkLabel
═══════════════════════════════════════ */
const COLABORADORES = [
  {
    num: '01',
    name: 'Sunset Seeker',
    sub: 'Silver Jewelry Brand',
    desc: 'Ocean-inspired fine silver jewelry designed for the free spirit. Sister brand of CONTRASTE — same craft, a different story.',
    link: 'https://instagram.com/sunsetseekker',
    linkLabel: '@sunsetseekker ↗',
  },
  {
    num: '02',
    name: 'Adrián Morejón',
    sub: 'Master Jeweler · Artesano',
    desc: 'The hands behind every piece made in this atelier. 12+ years crafting silver in Tulum. Also behind @a.morelafuente and @humans.',
    link: 'https://instagram.com/a.morelafuente',
    linkLabel: '@a.morelafuente ↗',
  },
];

/* ═══════════════════════════════════════
   ★ INSTAGRAM PROFILES — EDIT HANDLES + POST LINKS
   posts: array of 9 image paths (use screenshots of IG)
   If imageSrc is '', placeholder gradient shows instead.
═══════════════════════════════════════ */
const IG_PROFILES = [
  {
    id:     'ig-contraste',
    handle: '@contraste.tulum',
    bio:    'Joyería artesanal · Tulum, MX · Clases · Custom',
    link:   'https://instagram.com/contraste.tulum',
    initials: 'CA',
    posts:  ['','','','','','','','',''],
  },
  {
    id:     'ig-sunset',
    handle: '@sunsetseekker',
    bio:    'Ocean-inspired silver jewelry · Free spirit',
    link:   'https://instagram.com/sunsetseekker',
    initials: 'SS',
    posts:  ['','','','','','','','',''],
  },
  {
    id:     'ig-adrian',
    handle: '@a.morelafuente',
    bio:    'Adrián Morejón · Diseño de joyería · Tulum',
    link:   'https://instagram.com/a.morelafuente',
    initials: 'AM',
    posts:  ['','','','','','','','',''],
  },
];

/* ═══════════════════════════════════════
   ★ BILINGUAL CONTENT — EDIT TEXT HERE
═══════════════════════════════════════ */
const CONTENT = {
  en: {
    'hero-tag':       'Tulum, Mexico · Est. 2026',
    'hero-hl':        'Where<br>industrial<br>meets fine.',
    'hero-body':      "A jewelry atelier inside a former mechanic's workshop. Raw stones, hammered silver, wax-cast rings. The building used to fix engines. Now it holds something more delicate.",
    'hero-cta1':      'Shop the collection',
    'hero-cta2':      'Book a class →',
    'hero-meta':      'Sterling Silver .925<br>Raw &amp; Semi-precious Stones<br>Classes · Custom · Concept Store<br><br>Tulum, Mexico',
    'hero-scroll':    'Scroll to explore',
    'nav-shop':       'Shop',
    'nav-classes':    'Classes',
    'nav-espacio':    'Espacio',
    'nav-collabs':    'Collabs',
    'nav-contact':    'Contact',
    'about-label':    '01 — Atelier',
    'about-title':    'We are the contrast.',
    'about-pull':     'Between what this building was<br>and what it is now.',
    'about-body1':    "CONTRASTE ATELIER was built inside an old mechanic's workshop on the industrial edge of Tulum. Today, seven workshops share that space — metalwork, woodworking, laser engraving. We arrived to make jewelry. We stayed to make a point.",
    'about-body2':    'Not minimalism for its own sake. Not luxury for status. Intentional things, made by hand, in an unlikely place. Raw concrete. Silver. Fire. The contrast is the point.',
    'espacio-label':  '02 — The Space',
    'espacio-title':  'Built in a former workshop.',
    'espacio-sub':    'Seven crafts share one industrial building. Metalwork, carpentry, laser engraving, ceramics. We make jewelry. We fit right in.',
    'shop-label':     '03 — Shop',
    'shop-title':     'The Collection.',
    'fa':'All','fr':'Rings','fn':'Necklaces','fb':'Bracelets',
    'classes-label':  '04 — Classes',
    'classes-title':  'Make your own ring.',
    'classes-body':   'You choose a design from our collection of wax models. We cast it in silver — or the metal you want. No experience needed. You leave with a ring.',
    'wax-title':      'Choose a design.<br>Take your ring.',
    'wax-cta-title':  'The design is already done.<br>The price reflects that.',
    'wax-cta-body':   "Because you're choosing from existing wax models rather than commissioning a custom design from scratch, you pay significantly less — while still getting a one-of-one cast piece in real silver.",
    'wax-book':       'Book a session →',
    'stones-label':   '05 — Stones',
    'stones-title':   'Current inventory.',
    'stones-body':    'Semi and precious stones available for custom orders and class sessions. Stock changes. DM to confirm availability before ordering.',
    'colab-label':    '06 — Ecosystem',
    'colab-title':    'The brands in the room.',
    'colab-intro':    'CONTRASTE is not a solo project. These are the people and brands that share this space — physically and creatively.',
    'ig-label':       '07 — Follow',
    'ig-title':       'The feeds.',
    'booking-label':  '08 — Book a Class',
    'booking-title':  'Reserve your<br>session.',
    'booking-body':   'We confirm within 24 hours via WhatsApp. A 30% deposit is required to hold the spot. Full payment on the day.',
    'form-title':     'Book a session.',
    'fl-name':'Name','fl-email':'Email','fl-phone':'WhatsApp',
    'fl-class':'Format','fl-date':'Preferred date','fl-people':'People',
    'fl-notes':       'Notes (optional)',
    'fi-submit':      'Send booking request',
    'form-note':      "We'll confirm via WhatsApp within 24 hours. A 30% deposit holds your spot.",
    'success-title':  'Request sent.',
    'success-body':   "We'll reach out to confirm your session within 24 hours. Check your WhatsApp.",
    'contact-label':  '09 — Contact',
    'contact-title':  'Come find us.',
    'custom-cta':     'Custom order → WhatsApp',
    'stones-cta':     'Inquire about stones → WhatsApp',
    'footer-tagline': "A jewelry atelier inside a former mechanic's workshop. Tulum, Mexico. Est. 2026.",
    'nav-cart-label': 'Cart',
    'mm-shop':'Shop','mm-classes':'Classes','mm-espacio':'Espacio','mm-collabs':'Collabs','mm-contact':'Contact',
  },
  es: {
    'hero-tag':       'Tulum, México · Est. 2026',
    'hero-hl':        'Donde lo industrial<br>se encuentra<br>con lo fino.',
    'hero-body':      'Un taller de joyería dentro de un antiguo taller mecánico. Piedras crudas, plata martillada, anillos vaciados en cera. El edificio antes arreglaba motores. Ahora sostiene algo más delicado.',
    'hero-cta1':      'Ver la colección',
    'hero-cta2':      'Reservar una clase →',
    'hero-meta':      'Plata Sterling .925<br>Piedras Semi y Preciosas<br>Clases · Custom · Concept Store<br><br>Tulum, México',
    'hero-scroll':    'Scroll para explorar',
    'nav-shop':       'Tienda',
    'nav-classes':    'Clases',
    'nav-espacio':    'Espacio',
    'nav-collabs':    'Collabs',
    'nav-contact':    'Contacto',
    'about-label':    '01 — Atelier',
    'about-title':    'Somos el contraste.',
    'about-pull':     'Entre lo que este edificio fue<br>y lo que es ahora.',
    'about-body1':    'CONTRASTE ATELIER se construyó dentro de un antiguo taller mecánico en la zona industrial de Tulum. Hoy, siete talleres comparten ese espacio — herrería, carpintería, grabado láser. Llegamos a hacer joyería. Nos quedamos a demostrar algo.',
    'about-body2':    'No es minimalismo por el minimalismo. No es lujo por estatus. Cosas intencionales, hechas a mano, en un lugar improbable. Concreto crudo. Plata. Fuego. El contraste es el punto.',
    'espacio-label':  '02 — El Espacio',
    'espacio-title':  'Construido en un taller.',
    'espacio-sub':    'Siete oficios comparten un solo edificio industrial. Herrería, carpintería, grabado láser, cerámica. Nosotros hacemos joyería. Encajamos perfecto.',
    'shop-label':     '03 — Tienda',
    'shop-title':     'La Colección.',
    'fa':'Todo','fr':'Anillos','fn':'Collares','fb':'Pulseras',
    'classes-label':  '04 — Clases',
    'classes-title':  'Haz tu propio anillo.',
    'classes-body':   'Eliges un diseño de nuestra colección de modelos en cera. Lo vaciamos en plata — o el metal que quieras. Sin experiencia necesaria. Te vas con un anillo.',
    'wax-title':      'Elige un diseño.<br>Llévate tu anillo.',
    'wax-cta-title':  'El diseño ya está hecho.<br>El precio lo refleja.',
    'wax-cta-body':   'Porque eliges de modelos de cera existentes en lugar de encargar un diseño personalizado desde cero, pagas significativamente menos — y aun así te llevas una pieza única en plata real.',
    'wax-book':       'Reservar sesión →',
    'stones-label':   '05 — Piedras',
    'stones-title':   'Inventario actual.',
    'stones-body':    'Piedras semi y preciosas disponibles para pedidos personalizados y sesiones de clase. El stock cambia. Escríbenos para confirmar disponibilidad.',
    'colab-label':    '06 — Ecosistema',
    'colab-title':    'Las marcas en la sala.',
    'colab-intro':    'CONTRASTE no es un proyecto solo. Estas son las personas y marcas que comparten este espacio — física y creativamente.',
    'ig-label':       '07 — Síguenos',
    'ig-title':       'Los feeds.',
    'booking-label':  '08 — Reservar',
    'booking-title':  'Reserva tu<br>sesión.',
    'booking-body':   'Confirmamos en 24 horas por WhatsApp. Se requiere un depósito del 30% para apartar el lugar. Pago completo el día de la sesión.',
    'form-title':     'Reserva una sesión.',
    'fl-name':'Nombre','fl-email':'Email','fl-phone':'WhatsApp',
    'fl-class':'Formato','fl-date':'Fecha preferida','fl-people':'Personas',
    'fl-notes':       'Notas (opcional)',
    'fi-submit':      'Enviar solicitud',
    'form-note':      'Confirmamos por WhatsApp en 24 horas. Un depósito del 30% aparta tu lugar.',
    'success-title':  'Solicitud enviada.',
    'success-body':   'Nos comunicamos en 24 horas para confirmar tu sesión. Revisa tu WhatsApp.',
    'contact-label':  '09 — Contacto',
    'contact-title':  'Ven a encontrarnos.',
    'custom-cta':     'Pedido personalizado → WhatsApp',
    'stones-cta':     'Consultar piedras → WhatsApp',
    'footer-tagline': 'Un taller de joyería dentro de un antiguo taller mecánico. Tulum, México. Est. 2026.',
    'nav-cart-label': 'Carrito',
    'mm-shop':'Tienda','mm-classes':'Clases','mm-espacio':'Espacio','mm-collabs':'Collabs','mm-contact':'Contacto',
  }
};

/* ═══════════════════════════════════════
   INIT — wire site links
═══════════════════════════════════════ */
function initSiteLinks() {
  const wa = `https://wa.me/${SITE.whatsapp}`;
  document.getElementById('custom-cta').href        = `${wa}?text=${encodeURIComponent("Hi! I'd like to inquire about a custom order.")}`;
  document.getElementById('stones-cta').href        = `${wa}?text=${encodeURIComponent("Hi! I'd like to inquire about your stone inventory.")}`;
  document.getElementById('contact-wa-link').href   = `${wa}?text=${encodeURIComponent("Hi from the website!")}`;
  document.getElementById('contact-ig-link').href   = `https://instagram.com/${SITE.instagram}`;
  document.getElementById('contact-ig-handle').textContent = `@${SITE.instagram}`;
  document.getElementById('contact-maps-link').href = SITE.mapsUrl;
  document.getElementById('footer-ig-link').href    = `https://instagram.com/${SITE.instagram}`;
  document.getElementById('footer-ig-link').textContent = `@${SITE.instagram} ↗`;
}

/* ═══════════════════════════════════════
   RENDER PRODUCTS
═══════════════════════════════════════ */
function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="product-card" data-category="${p.category}" data-name="${p.name}" data-material="${p.material}" data-price="MXN ${p.price.toLocaleString()}">
      <div class="product-img" style="${p.imageSrc ? '' : p.imgStyle}">
        ${p.imageSrc
          ? `<img src="${p.imageSrc}" alt="${p.name}" loading="lazy">`
          : `<div class="product-img-label">Photo</div>`}
        ${p.badge ? `<div class="product-badge ${p.badge === 'New' ? 'new' : ''}">${p.badge}</div>` : ''}
        <button class="product-quick-add" onclick="addToCart(this)">Add to cart</button>
      </div>
      <div class="product-name">${p.name}</div>
      <div class="product-material">${p.material}</div>
      <div class="product-price">MXN ${p.price.toLocaleString()}</div>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════
   RENDER CLASSES
═══════════════════════════════════════ */
function renderClasses(lang = 'en') {
  const grid = document.getElementById('classesGrid');
  grid.innerHTML = CLASSES.map((c, i) => `
    <div class="class-card" onclick="document.getElementById('booking').scrollIntoView({behavior:'smooth'})">
      <div class="class-num">0${i+1}</div>
      <div class="class-name">${lang === 'es' ? c.nameEs : c.name}</div>
      <div class="class-detail">${lang === 'es' ? c.detailEs : c.detail}</div>
      <div class="class-price">
        ${c.priceLabel}
        ${(lang === 'es' ? c.priceSubEs : c.priceSub)
          ? `<span>${lang === 'es' ? c.priceSubEs : c.priceSub}</span>` : ''}
      </div>
    </div>
  `).join('');

  const flist = document.getElementById('bookingFormatList');
  flist.innerHTML = CLASSES.map(c => `
    <div class="booking-format">
      <span class="fname">${lang === 'es' ? c.nameEs : c.name}</span>
      <span class="fdetail">${(lang === 'es' ? c.detailEs : c.detail).replace('<br>',' · ').replace(/<[^>]+>/g,'')}</span>
      <span class="fprice">${c.priceLabel}</span>
    </div>
  `).join('');

  const sel = document.getElementById('fi-class');
  sel.innerHTML = `<option value="" disabled selected>${lang === 'es' ? 'Elige formato' : 'Choose format'}</option>` +
    CLASSES.map(c => `<option value="${c.id}">${lang === 'es' ? c.nameEs : c.name} ${c.priceLabel !== 'Contact us' && c.priceLabel !== 'On request' ? '· ' + c.priceLabel : ''}</option>`).join('');
}

/* ═══════════════════════════════════════
   RENDER COLABORADORES
═══════════════════════════════════════ */
function renderColaboradores() {
  const grid = document.getElementById('colabGrid');
  grid.innerHTML = COLABORADORES.map(b => `
    <div class="colab-card">
      <div class="colab-card-num">${b.num}</div>
      <div class="colab-logo-wrap">
        <div>
          <div class="colab-logo-text">${b.name}</div>
          <div class="colab-logo-sub">${b.sub}</div>
        </div>
      </div>
      <p class="colab-desc">${b.desc}</p>
      <a href="${b.link}" class="colab-link" target="_blank" rel="noopener">${b.linkLabel}</a>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════
   RENDER INSTAGRAM PROFILES
═══════════════════════════════════════ */
function renderInstagram() {
  const gradients = [
    'background:linear-gradient(145deg,#2a2722 0%,#1a1512 100%)',
    'background:linear-gradient(145deg,#3a3530 0%,#2a2522 100%)',
    'background:linear-gradient(145deg,#1e1c1a 0%,#141210 100%)',
    'background:linear-gradient(145deg,#4a4540 0%,#3a3530 100%)',
    'background:linear-gradient(145deg,#d8d3c6 0%,#b8b3a8 100%)',
    'background:linear-gradient(145deg,#2e2a25 0%,#1e1a15 100%)',
    'background:linear-gradient(145deg,#5a5550 0%,#4a4540 100%)',
    'background:linear-gradient(145deg,#c8c4bc 0%,#a8a49c 100%)',
    'background:linear-gradient(145deg,#1a1a2e 0%,#16213e 100%)',
  ];

  IG_PROFILES.forEach((profile, pi) => {
    const container = document.getElementById(profile.id);
    if (!container) return;

    // avatar
    container.querySelector('.ig-handle').textContent = profile.handle;
    container.querySelector('.ig-bio').textContent    = profile.bio;
    container.querySelector('.ig-avatar').textContent = profile.initials;
    container.querySelector('.ig-follow-link').href   = profile.link;

    // posts
    const grid = container.querySelector('.ig-grid');
    grid.innerHTML = profile.posts.map((src, i) => {
      const style = src ? `background:none` : gradients[i % gradients.length];
      return `
        <a class="ig-post" href="${profile.link}" target="_blank" rel="noopener" style="${style}">
          ${src ? `<img src="${src}" alt="Post ${i+1}" loading="lazy">` : `<div class="ig-post-label">Photo</div>`}
        </a>`;
    }).join('');
  });
}

/* ═══════════════════════════════════════
   INSTAGRAM TAB SWITCHER
═══════════════════════════════════════ */
function initIgTabs() {
  document.querySelectorAll('.ig-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ig-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.ig-profile').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });
}

/* ═══════════════════════════════════════
   CART
═══════════════════════════════════════ */
let cart = [];

function toggleCart() {
  const overlay = document.getElementById('cart-overlay');
  const drawer  = document.getElementById('cart-drawer');
  const isOpen  = drawer.classList.contains('open');
  overlay.classList.toggle('open', !isOpen);
  drawer.classList.toggle('open', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
}

function addToCart(btn) {
  const card     = btn.closest('.product-card');
  const name     = card.dataset.name;
  const material = card.dataset.material;
  const price    = card.dataset.price;
  const imgStyle = card.querySelector('.product-img')?.getAttribute('style') || '';
  const existing = cart.find(i => i.name === name);
  existing ? existing.qty++ : cart.push({ name, material, price, imgStyle, qty:1 });
  updateCart();
  showToast(`${name} added to cart`);
}

function removeFromCart(i) { cart.splice(i,1); updateCart(); }

function updateCart() {
  const count   = cart.reduce((s,i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent       = count;
  document.getElementById('cartHeaderCount').textContent = count;

  const itemsEl  = document.getElementById('cart-items');
  const emptyEl  = document.getElementById('cartEmpty');
  const footerEl = document.getElementById('cartFooter');

  if (!cart.length) {
    itemsEl.innerHTML = ''; itemsEl.appendChild(emptyEl);
    emptyEl.style.display = 'block'; footerEl.style.display = 'none';
  } else {
    emptyEl.style.display = 'none'; footerEl.style.display = 'block';
    itemsEl.querySelectorAll('.cart-item').forEach(e => e.remove());
    cart.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item-img" style="${item.imgStyle}"></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}${item.qty > 1 ? ` ×${item.qty}` : ''}</div>
          <div class="cart-item-material">${item.material}</div>
          <div class="cart-item-price">${item.price}</div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${idx})">✕</button>`;
      itemsEl.appendChild(el);
    });
    const total = cart.reduce((s,i) => s + parseInt(i.price.replace(/[^0-9]/g,'')) * i.qty, 0);
    document.getElementById('cartTotal').textContent = `MXN ${total.toLocaleString()}`;
    let msg = "Hi! I'd like to order:\n";
    cart.forEach(i => { msg += `- ${i.name} (${i.material})${i.qty>1?` x${i.qty}`:''}: ${i.price}\n`; });
    msg += `\nTotal: MXN ${total.toLocaleString()}`;
    document.getElementById('cartCheckoutBtn').href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
  }
}

/* ═══════════════════════════════════════
   PRODUCT FILTERS
═══════════════════════════════════════ */
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.product-card').forEach(c => {
        c.style.display = (f === 'all' || c.dataset.category === f) ? 'block' : 'none';
      });
    });
  });
}

/* ═══════════════════════════════════════
   BOOKING FORM
═══════════════════════════════════════ */
function submitBooking(e) {
  e.preventDefault();
  const name   = document.getElementById('fi-name').value;
  const phone  = document.getElementById('fi-phone').value;
  const format = document.getElementById('fi-class').value;
  const date   = document.getElementById('fi-date').value;
  const people = document.getElementById('fi-people').value;
  const notes  = document.getElementById('fi-notes').value;
  const msg = `Hi! I'd like to book a class at CONTRASTE ATELIER.\n\nName: ${name}\nFormat: ${format}\nDate: ${date}\nPeople: ${people}${notes ? `\nNotes: ${notes}` : ''}`;
  document.getElementById('success-wa').href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
  document.getElementById('bookingFormWrap').style.display = 'none';
  document.getElementById('form-success').style.display   = 'block';
  showToast('Booking request sent!');
}

/* ═══════════════════════════════════════
   TOAST
═══════════════════════════════════════ */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ═══════════════════════════════════════
   MOBILE MENU
═══════════════════════════════════════ */
function toggleMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
  document.body.style.overflow =
    document.getElementById('mobile-menu').classList.contains('open') ? 'hidden' : '';
}

/* ═══════════════════════════════════════
   SCROLL REVEAL (IntersectionObserver)
═══════════════════════════════════════ */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold:.08 });
  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════
   NAV HIDE ON SCROLL DOWN
═══════════════════════════════════════ */
function initNavScroll() {
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    document.getElementById('nav').style.transform = (y > lastY && y > 200) ? 'translateY(-100%)' : 'translateY(0)';
    lastY = y;
  }, { passive:true });
}

/* ═══════════════════════════════════════
   LANGUAGE TOGGLE
═══════════════════════════════════════ */
let currentLang = 'en';

function initLangToggle() {
  document.getElementById('langToggle').addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'es' : 'en';
    document.getElementById('langToggle').textContent = currentLang.toUpperCase();
    const t = CONTENT[currentLang];
    Object.entries(t).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = val;
    });
    renderClasses(currentLang);
  });
}

/* ═══════════════════════════════════════
   BOOT
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('fi-date').min = new Date().toISOString().split('T')[0];
  initSiteLinks();
  renderProducts();
  renderClasses('en');
  renderColaboradores();
  renderInstagram();
  initIgTabs();
  initFilters();
  initReveal();
  initNavScroll();
  initLangToggle();
});
