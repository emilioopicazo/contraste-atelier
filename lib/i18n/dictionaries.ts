import type { Locale } from "./locales";

/* All customer-facing copy, EN + ES. Content reflects current operating
   reality (spec §4–§7): one public workshop — Wax Ring Workshop — Monday +
   Thursday, 5:00–8:00 PM, brass casting included, silver/gold quoted
   separately. No prices are hardcoded here. */

const en = {
  meta: {
    homeTitle: "Contraste Atelier — Jewelry Workshop & Creative Studio · La Veleta, Tulum",
    homeDescription:
      "An experimental jewelry atelier in La Veleta, Tulum. Design and build a ring in wax inside a real workshop — small group sessions, Monday and Thursday evenings.",
    workshopTitle: "Wax Ring Workshop — Contraste Atelier · Tulum",
    workshopDescription:
      "Design and build a ring from wax inside Contraste Atelier in La Veleta, Tulum. Monday + Thursday, 5:00–8:00 PM. Small groups, standard casting in brass.",
    shopTitle: "Shop — Contraste Atelier",
    shopDescription:
      "Objects made inside the atelier. Handmade jewelry from Contraste Atelier, La Veleta, Tulum.",
  },
  nav: {
    workshop: "Workshop",
    shop: "Shop",
    gallery: "Gallery",
    visit: "Visit",
    instagram: "Instagram",
    reserve: "Book",
    cart: "Cart",
    openCart: "Open cart",
    home: "Contraste Atelier home",
  },
  hero: {
    headline: "Experimental jewelry, made by hand.",
    ctaWorkshop: "Book a workshop",
    ctaShop: "Shop the collection",
  },
  stats: [
    { n: "MON + THU", l: "Workshop days", s: "New sessions each week" },
    { n: "5–8 PM", l: "One evening", s: "3-hour session · America/Cancun" },
    { n: "4", l: "People per session", s: "Small group format" },
    { n: "BRASS", l: "Casting included", s: "Silver & gold quoted separately" },
  ],
  about: {
    heading: "Not a class. An entrance to the workshop.",
    tag: "La Veleta · Tulum",
    lead: "CONTRASTE ATELIER is a jewelry workshop and creative studio built around process, material and the hand.",
    body: "We work with wax, silver, fire and tools to make pieces from scratch — and we open that process to anyone who wants to experience jewelry from the inside. The result isn't only an object. It's the time, heat and decisions that built it.",
    keys: [
      "A real workshop in La Veleta, Tulum — not a tourist activity.",
      "Small group sessions, by reservation.",
      "Artisanal process: wax modeling, lost-wax, handmade pieces.",
      "No previous experience required — the workshop guides you.",
    ],
  },
  workshop: {
    kicker: "Workshops",
    title: "Wax Ring Workshop",
    intro:
      "Design and build a ring from wax inside CONTRASTE Atelier. Work directly with the material, tools and process used to develop a piece from scratch.",
    facts: {
      days: "MON + THU",
      time: "5:00 — 8:00 PM",
      place: "LA VELETA · TULUM",
      group: "4 PEOPLE PER SESSION",
    },
    factLabels: { days: "Days", time: "Time", place: "Where", group: "Group" },
    metal:
      "Standard casting in brass. Silver and gold available under separate quote.",
    continuation: "Some pieces may require a second studio session the following day.",
    flow: [
      { t: "Concept", d: "Your ring idea, on the bench." },
      { t: "Wax & sizing", d: "Choose the wax and set the size." },
      { t: "Construction", d: "Carve, build and sculpt the form." },
      { t: "Refinement", d: "Adjust until the piece reads right." },
      { t: "Final wax", d: "The ring, finished in wax." },
      { t: "Casting", d: "The piece is subsequently cast in metal." },
    ],
    priceFrom: "Session",
    cta: "Book a session",
    seeDates: "See available dates",
  },
  booking: {
    heading: "Available dates",
    subheading: "Choose a published session — every reservation is confirmed by hand.",
    monthLabel: "SEP",
    spots: (n: number) => `${n} spots available`,
    spotsShort: (n: number) => `${n} SPOTS`,
    onlyLeft: "Only 2 spots left",
    onlyLeftShort: "ONLY 2 LEFT",
    lastSpot: "Last spot",
    lastSpotShort: "LAST SPOT",
    soldOut: "Sold out",
    soldOutShort: "SOLD OUT",
    viewers: (n: number) => `${n} people are viewing this date`,
    selectDate: "Select a date to continue.",
    partySize: "People",
    form: {
      name: "Name",
      email: "Email",
      phone: "WhatsApp / phone",
      metal: "Desired final metal",
      notes: "Notes (optional)",
      metalOptions: {
        brass: "Brass — included",
        silver_quote: "Silver — quoted separately",
        gold_quote: "Gold — quoted separately",
        undecided: "Not sure yet",
      },
      consent:
        "We use your contact details only to confirm and coordinate your reservation.",
      submit: "Confirm reservation",
      submitting: "Confirming…",
    },
    confirmation: {
      title: "Your session is booked",
      participants: (n: number) => (n === 1 ? "1 participant" : `${n} participants`),
      reference: "Reference",
      metalNote:
        "Standard casting in brass is included. If you chose silver or gold, we'll send a separate quote based on your finished design.",
      continuationNote:
        "Some pieces may require a second studio session the following day — we'll coordinate it with you if needed.",
      addToCalendar: "Add to calendar",
      directions: "Directions",
      whatsapp: "WhatsApp us",
    },
    errors: {
      soldOut: "This session has just sold out.",
      nextAvailable: "Next available session",
      bookNext: "Book this date",
      partyTooLarge: (n: number) =>
        n === 1 ? "Only 1 spot remains for this session." : `Only ${n} spots remain for this session.`,
      unavailable: "This date is no longer available.",
      network: "We couldn't complete the reservation. No booking was created.",
      invalid: "Please review the highlighted fields.",
    },
    fallback: {
      note: "Online booking is being prepared. Reserve directly by WhatsApp — we confirm every session by hand.",
      cta: "Reserve by WhatsApp",
      waMessage:
        "Hi! I'd like to book the Wax Ring Workshop at Contraste Atelier. Which dates are available?",
    },
    noSessions: "New dates are published soon.",
  },
  process: {
    heading: "Before it was jewelry, it was material, fire and time.",
    lead: "Each piece starts in the hand: it's modeled, adjusted, transformed and takes shape inside the workshop. You don't just leave with an object — you live the process that builds it.",
    steps: [
      { t: "Wax", d: "Raw material on the bench. The starting point of every piece." },
      { t: "Modeling", d: "Shaping by hand — carving, building and refining the form." },
      { t: "Tools", d: "Workshop tools, technique and the marks of the process." },
      { t: "Casting", d: "Lost-wax: fire turns wax into metal. Transformation." },
      { t: "Finishing", d: "Filing, texture and detail. The hand of the maker stays visible." },
      { t: "The piece", d: "An object made from scratch — yours, built in the workshop." },
    ],
  },
  gallery: {
    caption: "Built by hand in the workshop.",
  },
  instagram: {
    kicker: "Instagram",
    follow: "Follow the workshop",
  },
  shop: {
    kicker: "First Collection",
    heading: "Objects made inside the atelier.",
    viewCollection: "View collection",
    viewShop: "View shop",
    comingSoon: "First Collection — Soon",
    comingSoonBody: "Workshop pieces, soon available to take home.",
    soldOut: "Sold out",
    oneOfOne: "One of one",
    lastPiece: "Last piece",
    onlyLeft: (n: number) => `Only ${n} left`,
    addToCart: "Add to cart",
    adding: "Adding…",
    unavailable: "Unavailable",
    cart: "Your cart",
    cartEmpty: "Your cart is empty.",
    close: "Close",
    errNetwork: "Network error — try again.",
    errStore: "Something changed in the store — refresh and try again.",
    subtotal: "Subtotal",
    checkout: "Checkout",
    checkoutNote: "Taxes and shipping calculated at checkout.",
    remove: "Remove",
    quantity: "Quantity",
    continueShopping: "Continue shopping",
    pickupNote: "Ships from the atelier in Tulum. Local pickup available at checkout when configured.",
    makeYourOwn: "Make your own ring in the workshop",
    exploreShop: "Explore pieces from the atelier",
    material: "Material",
    dimensions: "Dimensions",
    finish: "Finish",
    edition: "Edition",
    care: "Care",
  },
  visit: {
    kicker: "Visit",
    heading: "The atelier",
    reservationOnly: "By reservation only",
    openMaps: "Open in Maps",
    whatsapp: "WhatsApp",
    whatsappMessage:
      "Hi! I found Contraste Atelier and I'd like to ask about visiting the workshop.",
  },
  footer: {
    tagline:
      "Jewelry Workshop & Creative Studio. Real workshop, artisanal process, lost wax, brass, silver and the human experience of making.",
    workshop: "Workshop",
    waxRing: "Wax Ring Workshop",
    bookSession: "Book a session",
    shopCol: "Shop",
    visitCol: "Visit",
    connectCol: "Connect",
    rights: "Contraste Atelier ®",
  },
  notFound: {
    title: "Page not found",
    body: "The page you're looking for doesn't exist.",
    back: "Back to the atelier",
  },
};

export type Dictionary = typeof en;

const es: Dictionary = {
  meta: {
    homeTitle: "Contraste Atelier — Taller de joyería y estudio creativo · La Veleta, Tulum",
    homeDescription:
      "Un atelier de joyería experimental en La Veleta, Tulum. Diseña y construye un anillo en cera dentro de un taller real — grupos pequeños, lunes y jueves por la tarde.",
    workshopTitle: "Wax Ring Workshop — Contraste Atelier · Tulum",
    workshopDescription:
      "Diseña y construye un anillo desde la cera dentro de Contraste Atelier en La Veleta, Tulum. Lunes + jueves, 5:00–8:00 PM. Grupos pequeños, fundición estándar en latón.",
    shopTitle: "Tienda — Contraste Atelier",
    shopDescription:
      "Objetos hechos dentro del atelier. Joyería hecha a mano de Contraste Atelier, La Veleta, Tulum.",
  },
  nav: {
    workshop: "Taller",
    shop: "Tienda",
    gallery: "Galería",
    visit: "Visita",
    instagram: "Instagram",
    reserve: "Reservar",
    cart: "Carrito",
    openCart: "Abrir carrito",
    home: "Inicio de Contraste Atelier",
  },
  hero: {
    headline: "Joyería experimental, hecha a mano.",
    ctaWorkshop: "Reserva un taller",
    ctaShop: "Compra la colección",
  },
  stats: [
    { n: "LUN + JUE", l: "Días de taller", s: "Sesiones nuevas cada semana" },
    { n: "5–8 PM", l: "Una tarde", s: "Sesión de 3 horas · America/Cancún" },
    { n: "4", l: "Personas por sesión", s: "Formato de grupo pequeño" },
    { n: "LATÓN", l: "Fundición incluida", s: "Plata y oro se cotizan aparte" },
  ],
  about: {
    heading: "No es una clase. Una entrada al taller.",
    tag: "La Veleta · Tulum",
    lead: "CONTRASTE ATELIER es un taller de joyería y estudio creativo, construido en torno al proceso, el material y la mano.",
    body: "Trabajamos con cera, plata, fuego y herramientas para crear piezas desde cero — y abrimos ese proceso a quien quiera vivir la joyería desde adentro. El resultado no es solo un objeto. Es el tiempo, el calor y las decisiones que lo formaron.",
    keys: [
      "Un taller real en La Veleta, Tulum — no una actividad turística.",
      "Sesiones en grupos pequeños, con reservación.",
      "Proceso artesanal: modelado en cera, cera perdida, piezas hechas a mano.",
      "Sin experiencia previa — el taller te guía.",
    ],
  },
  workshop: {
    kicker: "Talleres",
    title: "Wax Ring Workshop",
    intro:
      "Diseña y construye un anillo desde la cera dentro de CONTRASTE Atelier. Trabaja directamente con el material, las herramientas y el proceso con el que se desarrolla una pieza desde cero.",
    facts: {
      days: "LUN + JUE",
      time: "5:00 — 8:00 PM",
      place: "LA VELETA · TULUM",
      group: "4 PERSONAS POR SESIÓN",
    },
    factLabels: { days: "Días", time: "Horario", place: "Dónde", group: "Grupo" },
    metal:
      "Fundición estándar en latón. Plata y oro disponibles bajo cotización aparte.",
    continuation: "Algunas piezas pueden requerir una segunda sesión en el taller al día siguiente.",
    flow: [
      { t: "Concepto", d: "Tu idea de anillo, sobre la mesa." },
      { t: "Cera y talla", d: "Elige la cera y define la talla." },
      { t: "Construcción", d: "Talla, construye y esculpe la forma." },
      { t: "Refinamiento", d: "Ajusta hasta que la pieza se lea bien." },
      { t: "Cera final", d: "El anillo, terminado en cera." },
      { t: "Fundición", d: "La pieza se funde después en metal." },
    ],
    priceFrom: "Sesión",
    cta: "Reservar una sesión",
    seeDates: "Ver fechas disponibles",
  },
  booking: {
    heading: "Fechas disponibles",
    subheading: "Elige una sesión publicada — cada reservación se confirma a mano.",
    monthLabel: "SEP",
    spots: (n: number) => `${n} lugares disponibles`,
    spotsShort: (n: number) => `${n} LUGARES`,
    onlyLeft: "Solo quedan 2 lugares",
    onlyLeftShort: "SOLO 2",
    lastSpot: "Último lugar",
    lastSpotShort: "ÚLTIMO LUGAR",
    soldOut: "Agotado",
    soldOutShort: "AGOTADO",
    viewers: (n: number) => `${n} personas están viendo esta fecha`,
    selectDate: "Selecciona una fecha para continuar.",
    partySize: "Personas",
    form: {
      name: "Nombre",
      email: "Correo",
      phone: "WhatsApp / teléfono",
      metal: "Metal final deseado",
      notes: "Notas (opcional)",
      metalOptions: {
        brass: "Latón — incluido",
        silver_quote: "Plata — se cotiza aparte",
        gold_quote: "Oro — se cotiza aparte",
        undecided: "Aún no lo sé",
      },
      consent:
        "Usamos tus datos de contacto únicamente para confirmar y coordinar tu reservación.",
      submit: "Confirmar reservación",
      submitting: "Confirmando…",
    },
    confirmation: {
      title: "Tu sesión está reservada",
      participants: (n: number) => (n === 1 ? "1 participante" : `${n} participantes`),
      reference: "Referencia",
      metalNote:
        "La fundición estándar en latón está incluida. Si elegiste plata u oro, te enviaremos una cotización aparte según tu diseño final.",
      continuationNote:
        "Algunas piezas pueden requerir una segunda sesión al día siguiente — la coordinamos contigo si hace falta.",
      addToCalendar: "Agregar al calendario",
      directions: "Cómo llegar",
      whatsapp: "Escríbenos por WhatsApp",
    },
    errors: {
      soldOut: "Esta sesión se acaba de agotar.",
      nextAvailable: "Próxima sesión disponible",
      bookNext: "Reservar esta fecha",
      partyTooLarge: (n: number) =>
        n === 1 ? "Solo queda 1 lugar para esta sesión." : `Solo quedan ${n} lugares para esta sesión.`,
      unavailable: "Esta fecha ya no está disponible.",
      network: "No pudimos completar la reservación. No se creó ninguna reserva.",
      invalid: "Revisa los campos marcados.",
    },
    fallback: {
      note: "La reservación en línea está en preparación. Reserva directo por WhatsApp — confirmamos cada sesión a mano.",
      cta: "Reservar por WhatsApp",
      waMessage:
        "¡Hola! Quiero reservar el Wax Ring Workshop en Contraste Atelier. ¿Qué fechas tienen disponibles?",
    },
    noSessions: "Pronto se publican nuevas fechas.",
  },
  process: {
    heading: "Antes de ser joyería, fue material, fuego y tiempo.",
    lead: "Cada pieza empieza en la mano: se modela, se ajusta, se transforma y toma forma dentro del taller. No solo te llevas un objeto — vives el proceso que lo construye.",
    steps: [
      { t: "Cera", d: "Material en bruto sobre la mesa. El punto de partida de cada pieza." },
      { t: "Modelado", d: "Dar forma a mano — tallar, construir y refinar la forma." },
      { t: "Herramientas", d: "Herramientas del taller, técnica y las marcas del proceso." },
      { t: "Fundición", d: "Cera perdida: el fuego convierte la cera en metal. Transformación." },
      { t: "Acabado", d: "Limado, textura y detalle. La mano de quien lo hace permanece visible." },
      { t: "La pieza", d: "Un objeto hecho desde cero — tuyo, construido en el taller." },
    ],
  },
  gallery: {
    caption: "Hecho a mano en el taller.",
  },
  instagram: {
    kicker: "Instagram",
    follow: "Sigue el taller",
  },
  shop: {
    kicker: "First Collection",
    heading: "Objetos hechos dentro del atelier.",
    viewCollection: "Ver colección",
    viewShop: "Ver tienda",
    comingSoon: "First Collection — Próximamente",
    comingSoonBody: "Piezas del taller, pronto disponibles para llevar.",
    soldOut: "Agotado",
    oneOfOne: "Pieza única",
    lastPiece: "Última pieza",
    onlyLeft: (n: number) => `Solo quedan ${n}`,
    addToCart: "Agregar al carrito",
    adding: "Agregando…",
    unavailable: "No disponible",
    cart: "Tu carrito",
    cartEmpty: "Tu carrito está vacío.",
    close: "Cerrar",
    errNetwork: "Error de red — inténtalo de nuevo.",
    errStore: "Algo cambió en la tienda — actualiza e inténtalo de nuevo.",
    subtotal: "Subtotal",
    checkout: "Pagar",
    checkoutNote: "Impuestos y envío se calculan al pagar.",
    remove: "Quitar",
    quantity: "Cantidad",
    continueShopping: "Seguir viendo",
    pickupNote: "Se envía desde el atelier en Tulum. Recolección local disponible al pagar cuando esté configurada.",
    makeYourOwn: "Haz tu propio anillo en el taller",
    exploreShop: "Explora piezas del atelier",
    material: "Material",
    dimensions: "Dimensiones",
    finish: "Acabado",
    edition: "Edición",
    care: "Cuidado",
  },
  visit: {
    kicker: "Visita",
    heading: "El atelier",
    reservationOnly: "Solo con reservación",
    openMaps: "Abrir en Maps",
    whatsapp: "WhatsApp",
    whatsappMessage:
      "¡Hola! Encontré Contraste Atelier y me gustaría preguntar por una visita al taller.",
  },
  footer: {
    tagline:
      "Taller de joyería y estudio creativo. Taller real, proceso artesanal, cera perdida, latón, plata y la experiencia humana de crear.",
    workshop: "Taller",
    waxRing: "Wax Ring Workshop",
    bookSession: "Reservar una sesión",
    shopCol: "Tienda",
    visitCol: "Visita",
    connectCol: "Conecta",
    rights: "Contraste Atelier ®",
  },
  notFound: {
    title: "Página no encontrada",
    body: "La página que buscas no existe.",
    back: "Volver al atelier",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
