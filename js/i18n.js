/* ============================================
   INTERNATIONALIZATION (i18n)
   Language switching for EN/ES
   ============================================ */

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.about': 'About',
    'nav.markets': 'Markets',
    'nav.contact': 'Contact',
    'nav.cta': 'Get in Touch',

    // Hero Section
    'hero.badge': 'LATAM · Family Office · Venture Capital',
    'hero.subtitle': 'Strategic Advisory & Business Development',
    'hero.description': "Connecting venture capital and private wealth firms with family office networks across Latin America's most active emerging markets. Fluent in the language, culture, and relationships that matter.",
    'hero.cta': "Let's Connect",
    'hero.services': 'View Services',
    // Who This Is For
    'hero.fit.label': 'This is right for you if —',
    'hero.fit.1': "You're a U.S. fund actively raising or deploying in LATAM",
    'hero.fit.2': "You've tried cold outreach into the region and hit a wall",
    'hero.fit.3': 'You need boots-on-the-ground in Colombia, Mexico, or Central America',

    'hero.stat1': 'Active Family Office Contacts',
    'hero.stat2': 'Markets Across the Americas',
    'hero.stat3': 'One-on-One Meetings Facilitated',

    // Services Section
    'services.badge': 'What I Offer',
    'services.title': 'Consulting Services',
    'services.description': 'Specialized advisory for investment firms and capital allocators seeking to build presence, pipeline, and relationships in Latin American markets.',
    'services.learnMore': 'Learn More',

    // Service Card 1
    'services.card1.badge': 'Core Service',
    'services.card1.title': 'LATAM Market Entry & Business Development',
    'services.card1.desc': 'For U.S.-based investment firms seeking to build presence and develop deal flow in Colombia, Mexico, and broader Latin America.',
    'services.card1.f1': 'On-the-ground market research and intelligence',
    'services.card1.f2': 'Family office and private wealth prospecting',
    'services.card1.f3': 'LP identification and pipeline building',

    // Service Card 2
    'services.card2.badge': 'High Demand',
    'services.card2.title': 'Family Office Network Access',
    'services.card2.desc': 'Warm introductions and relationship facilitation with active private wealth and family office networks across key LATAM and U.S. gateway markets.',
    'services.card2.f1': 'Conference representation and attendance',
    'services.card2.f2': 'Warm introductions to qualified contacts',
    'services.card2.f3': 'Relationship management and follow-through',

    // Service Card 3
    'services.card3.title': 'Strategic Consulting & Market Intelligence',
    'services.card3.desc': 'Actionable market intelligence, LP prospect identification, and strategic advisory for firms navigating emerging market expansion.',
    'services.card3.f1': 'Weekly progress reporting and debriefs',
    'services.card3.f2': 'Competitive landscape analysis',
    'services.card3.f3': 'Strategic positioning for emerging markets',

    // About Section
    'about.badge': 'About Me',
    'about.title': 'Eight Years. Six Markets. One Specialization.',
    'about.text1': "With over eight years of international business development experience, I specialize in one thing most consultants can't offer: genuine, on-the-ground relationships with family offices and private wealth networks across Latin America.",
    'about.text2': "Over the past year, I've completed multiple consulting engagements for U.S.-based investment firms focused on LATAM market expansion — conducting on-the-ground market research, developing family office relationships, and identifying LP prospects across Colombia, Mexico, and Central America.",
    'about.text3': "My approach is grounded in patience, cultural fluency, and a genuine understanding that relationships in this region are built over time — not forced. That's a feature, not a limitation.",
    'about.h1.title': 'Bilingual',
    'about.h1.text': 'Native-level English and Spanish — critical for authentic operation across LATAM markets',
    'about.h2.title': 'Blockchain & Digital Assets',
    'about.h2.text': 'Certifications from Wharton, Columbia Business School & University of Pennsylvania',
    'about.h3.title': 'Cross-Sector Track Record',
    'about.h3.text': '$6M+ sales pipeline generated across Central & South American markets',

    // Profile Section
    'profile.badge': 'Personal Profile',
    'profile.title': 'John Carter Powell',
    'profile.role': 'LATAM Business Development Consultant',
    'profile.bioTitle': 'Biography',
    'profile.bio1': 'John Carter Powell is a bilingual (English/Spanish) business development consultant specializing in LATAM family office and private wealth networks. He has completed multiple consulting engagements for U.S.-based investment firms — attending six major family office conferences across Monterrey, Mexico City, Bogotá, Miami, San Diego, and Honduras.',
    'profile.bio2': 'With an active pipeline of 60+ warm contacts and 24+ facilitated introductory meetings across multiple markets, his approach is grounded in cultural fluency, patience, and genuine relationship-building — not transaction-first outreach.',
    'profile.expertiseTitle': 'Areas of Expertise',
    'profile.tag1': 'LATAM Business Development',
    'profile.tag2': 'Family Office Relations',
    'profile.tag3': 'Private Wealth Networks',
    'profile.tag4': 'LP Prospecting',
    'profile.tag5': 'Venture Capital BD',
    'profile.tag6': 'Emerging Markets',
    'profile.tag7': 'Bilingual Advisory',
    'profile.tag8': 'Blockchain & Digital Assets',
    'profile.connectTitle': 'Connect With Me',

    // Markets Section
    'markets.badge': 'Track Record',
    'markets.title': 'In the Room Across Six Markets',
    'markets.description': "Family office relationships in Latin America are not built through cold email. They're built through physical presence, cultural trust, and consistent follow-through over time.",
    'markets.m1': 'Family Office Contacts Built',
    'markets.m2': 'One-on-One Meetings',
    'markets.m3': 'Conferences Attended',
    'markets.m4': 'Countries of Active Coverage',
    'markets.body': "Over the past year I've attended six major family office and private wealth conferences across the Americas — representing client firms, developing relationships, and cultivating a pipeline that is currently active and in development across all markets.",
    'markets.footprintLabel': 'Conference Presence 2024–2025',
    'markets.bilingualBadge': 'Bilingual: English / Spanish',

    // Opportunity Section
    'opportunity.badge': 'Availability',
    'opportunity.title': 'Available for the Right Opportunity',
    'opportunity.quote': "I'm fully focused on delivering for current consulting clients while also exploring what the right long-term role looks like. I'm building something durable in LATAM — and I'm open to doing that as a full-time member of the right firm, not just as an outside advisor.",
    'opportunity.col1.label': 'Available Now',
    'opportunity.col1.title': 'Independent Consulting Engagements',
    'opportunity.col1.desc': 'Available for project-based consulting with investment firms seeking LATAM business development, family office access, or market entry strategy. Proven SOW-based working model.',
    'opportunity.col2.label': 'Open To',
    'opportunity.col2.title': 'Full-Time BD or Venture Partner Role',
    'opportunity.col2.desc': 'Seeking a formalized role at a VC fund, family office, or investment firm where my active LATAM network and relationship pipeline become a permanent strategic asset.',

    // Contact Section
    'contact.badge': 'Get In Touch',
    'contact.title': "Let's Talk",
    'contact.description': "Whether you're an investment firm exploring LATAM, a fund building out your BD function, or someone looking to connect — I'd like to hear from you.",
    'contact.emailLabel': 'Email',
    'contact.phoneLabel': 'Phone',
    'contact.locationLabel': 'Location',
    'contact.tab.message': 'Send a Message',
    'contact.tab.schedule': 'Schedule a Call',
    'contact.form.name': 'Name',
    'contact.form.email': 'Email',
    'contact.form.orgType': 'Organization Type',
    'contact.form.orgPlaceholder': 'Select your organization type',
    'contact.form.org1': 'Venture Capital Fund',
    'contact.form.org2': 'Family Office',
    'contact.form.org3': 'Investment Bank',
    'contact.form.org4': 'Private Wealth Manager',
    'contact.form.org5': 'Other',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Send Message',

    // Footer
    'footer.tagline': 'LATAM business development & family office advisory.',
    'footer.navigation': 'Navigation',
    'footer.services': 'Services',
    'footer.connect': 'Connect',
    'footer.s1': 'LATAM Market Entry',
    'footer.s2': 'Family Office Access',
    'footer.s3': 'Strategic Consulting'
  },

  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.services': 'Servicios',
    'nav.about': 'Acerca',
    'nav.markets': 'Mercados',
    'nav.contact': 'Contacto',
    'nav.cta': 'Contáctame',

    // Hero Section
    'hero.badge': 'LATAM · Family Office · Capital de Riesgo',
    'hero.subtitle': 'Asesoría Estratégica y Desarrollo de Negocios',
    'hero.description': 'Conectando firmas de capital de riesgo y patrimonio privado con redes de family offices en los mercados emergentes más activos de América Latina. Fluido en el idioma, la cultura y las relaciones que importan.',
    'hero.cta': 'Conectemos',
    'hero.services': 'Ver Servicios',
    // Who This Is For (ES)
    'hero.fit.label': 'Esto es para ti si —',
    'hero.fit.1': 'Eres un fondo en EE.UU. que está levantando capital o invirtiendo en LATAM',
    'hero.fit.2': 'Has intentado contacto en frío en la región y no ha funcionado',
    'hero.fit.3': 'Necesitas presencia en terreno en Colombia, México o Centroamérica',

    'hero.stat1': 'Contactos Activos de Family Office',
    'hero.stat2': 'Mercados en las Américas',
    'hero.stat3': 'Reuniones Individuales Facilitadas',

    // Services Section
    'services.badge': 'Lo Que Ofrezco',
    'services.title': 'Servicios de Consultoría',
    'services.description': 'Asesoría especializada para firmas de inversión y asignadores de capital que buscan construir presencia, flujo de oportunidades y relaciones en los mercados latinoamericanos.',
    'services.learnMore': 'Más Información',

    // Service Card 1
    'services.card1.badge': 'Servicio Principal',
    'services.card1.title': 'Entrada al Mercado LATAM y Desarrollo de Negocios',
    'services.card1.desc': 'Para firmas de inversión con base en EE.UU. que buscan construir presencia y desarrollar flujo de operaciones en Colombia, México y América Latina en general.',
    'services.card1.f1': 'Investigación e inteligencia de mercado in situ',
    'services.card1.f2': 'Prospección de family offices y patrimonio privado',
    'services.card1.f3': 'Identificación de LPs y construcción de pipeline',

    // Service Card 2
    'services.card2.badge': 'Alta Demanda',
    'services.card2.title': 'Acceso a Redes de Family Office',
    'services.card2.desc': 'Presentaciones cálidas y facilitación de relaciones con redes activas de patrimonio privado y family offices en mercados clave de LATAM y gateway en EE.UU.',
    'services.card2.f1': 'Representación y asistencia a conferencias',
    'services.card2.f2': 'Presentaciones cálidas a contactos calificados',
    'services.card2.f3': 'Gestión de relaciones y seguimiento',

    // Service Card 3
    'services.card3.title': 'Consultoría Estratégica e Inteligencia de Mercado',
    'services.card3.desc': 'Inteligencia de mercado accionable, identificación de prospectos LP y asesoría estratégica para firmas que navegan la expansión en mercados emergentes.',
    'services.card3.f1': 'Reportes semanales de progreso y reuniones informativas',
    'services.card3.f2': 'Análisis del panorama competitivo',
    'services.card3.f3': 'Posicionamiento estratégico para mercados emergentes',

    // About Section
    'about.badge': 'Sobre Mí',
    'about.title': 'Ocho Años. Seis Mercados. Una Especialización.',
    'about.text1': 'Con más de ocho años de experiencia en desarrollo de negocios internacionales, me especializo en algo que la mayoría de los consultores no pueden ofrecer: relaciones genuinas y presenciales con family offices y redes de patrimonio privado en toda América Latina.',
    'about.text2': 'Durante el último año, completé múltiples compromisos de consultoría para firmas de inversión con base en EE.UU. enfocadas en la expansión al mercado LATAM — realizando investigación de mercado in situ, desarrollando relaciones con family offices e identificando prospectos LP en Colombia, México y América Central.',
    'about.text3': 'Mi enfoque se fundamenta en la paciencia, la fluidez cultural y una comprensión genuina de que las relaciones en esta región se construyen con el tiempo — no a la fuerza. Eso es una ventaja, no una limitación.',
    'about.h1.title': 'Bilingüe',
    'about.h1.text': 'Inglés y español a nivel nativo — fundamental para operar auténticamente en los mercados latinoamericanos',
    'about.h2.title': 'Blockchain y Activos Digitales',
    'about.h2.text': 'Certificaciones de Wharton, Columbia Business School y la Universidad de Pennsylvania',
    'about.h3.title': 'Trayectoria Multisectorial',
    'about.h3.text': 'Pipeline de ventas de más de $6M generado en mercados de Centro y Sudamérica',

    // Profile Section
    'profile.badge': 'Perfil Personal',
    'profile.title': 'John Carter Powell',
    'profile.role': 'Consultor de Desarrollo de Negocios en LATAM',
    'profile.bioTitle': 'Biografía',
    'profile.bio1': 'John Carter Powell es un consultor de desarrollo de negocios bilingüe (inglés/español) especializado en redes de family offices y patrimonio privado en LATAM. Ha completado múltiples compromisos de consultoría para firmas de inversión con base en EE.UU. — asistiendo a seis grandes conferencias de family offices en Monterrey, Ciudad de México, Bogotá, Miami, San Diego y Honduras.',
    'profile.bio2': 'Con un pipeline activo de más de 60 contactos cálidos y más de 24 reuniones introductorias facilitadas en múltiples mercados, su enfoque se fundamenta en la fluidez cultural, la paciencia y la construcción genuina de relaciones — no en el contacto transaccional.',
    'profile.expertiseTitle': 'Áreas de Especialización',
    'profile.tag1': 'Desarrollo de Negocios LATAM',
    'profile.tag2': 'Relaciones con Family Offices',
    'profile.tag3': 'Redes de Patrimonio Privado',
    'profile.tag4': 'Prospección de LPs',
    'profile.tag5': 'BD para Capital de Riesgo',
    'profile.tag6': 'Mercados Emergentes',
    'profile.tag7': 'Asesoría Bilingüe',
    'profile.tag8': 'Blockchain y Activos Digitales',
    'profile.connectTitle': 'Conéctate Conmigo',

    // Markets Section
    'markets.badge': 'Trayectoria',
    'markets.title': 'Presente en Seis Mercados',
    'markets.description': 'Las relaciones con family offices en América Latina no se construyen por correo electrónico en frío. Se construyen mediante presencia física, confianza cultural y seguimiento consistente a lo largo del tiempo.',
    'markets.m1': 'Contactos de Family Office Construidos',
    'markets.m2': 'Reuniones Individuales',
    'markets.m3': 'Conferencias Asistidas',
    'markets.m4': 'Países de Cobertura Activa',
    'markets.body': 'Durante el último año asistí a seis grandes conferencias de family offices y patrimonio privado en las Américas — representando a firmas cliente, desarrollando relaciones y cultivando un pipeline que actualmente se encuentra activo y en desarrollo en todos los mercados.',
    'markets.footprintLabel': 'Presencia en Conferencias 2024–2025',
    'markets.bilingualBadge': 'Bilingüe: Inglés / Español',

    // Opportunity Section
    'opportunity.badge': 'Disponibilidad',
    'opportunity.title': 'Disponible para la Oportunidad Correcta',
    'opportunity.quote': 'Estoy completamente enfocado en entregar resultados para mis clientes de consultoría actuales, mientras exploro cómo sería el rol a largo plazo correcto. Estoy construyendo algo duradero en LATAM — y estoy abierto a hacerlo como miembro de tiempo completo de la firma correcta, no solo como asesor externo.',
    'opportunity.col1.label': 'Disponible Ahora',
    'opportunity.col1.title': 'Compromisos de Consultoría Independiente',
    'opportunity.col1.desc': 'Disponible para consultoría por proyecto con firmas de inversión que buscan desarrollo de negocios en LATAM, acceso a family offices o estrategia de entrada al mercado. Modelo de trabajo basado en SOW comprobado.',
    'opportunity.col2.label': 'Abierto A',
    'opportunity.col2.title': 'Rol de Tiempo Completo en BD o Venture Partner',
    'opportunity.col2.desc': 'Busco un rol formalizado en un fondo de capital de riesgo, family office o firma de inversión donde mi red activa en LATAM y mi pipeline de relaciones se conviertan en un activo estratégico permanente.',

    // Contact Section
    'contact.badge': 'Ponte en Contacto',
    'contact.title': 'Hablemos',
    'contact.description': 'Ya seas una firma de inversión explorando LATAM, un fondo que amplía su función de BD, o alguien que busca conectar — me gustaría escucharte.',
    'contact.emailLabel': 'Correo Electrónico',
    'contact.phoneLabel': 'Teléfono',
    'contact.locationLabel': 'Ubicación',
    'contact.tab.message': 'Enviar Mensaje',
    'contact.tab.schedule': 'Agendar Llamada',
    'contact.form.name': 'Nombre',
    'contact.form.email': 'Correo',
    'contact.form.orgType': 'Tipo de Organización',
    'contact.form.orgPlaceholder': 'Selecciona tu tipo de organización',
    'contact.form.org1': 'Fondo de Capital de Riesgo',
    'contact.form.org2': 'Family Office',
    'contact.form.org3': 'Banco de Inversión',
    'contact.form.org4': 'Gestor de Patrimonio Privado',
    'contact.form.org5': 'Otro',
    'contact.form.message': 'Mensaje',
    'contact.form.submit': 'Enviar Mensaje',

    // Footer
    'footer.tagline': 'Desarrollo de negocios en LATAM y asesoría de family offices.',
    'footer.navigation': 'Navegación',
    'footer.services': 'Servicios',
    'footer.connect': 'Conectar',
    'footer.s1': 'Entrada al Mercado LATAM',
    'footer.s2': 'Acceso a Family Offices',
    'footer.s3': 'Consultoría Estratégica'
  }
};

// Language state
let currentLang = localStorage.getItem('lang') || 'en';

// Initialize i18n
function initI18n() {
  const langToggle = document.getElementById('langToggle');
  if (!langToggle) return;

  // Set initial state
  setLanguage(currentLang);

  // Click handler for the toggle
  langToggle.addEventListener('click', (e) => {
    const clickedOption = e.target.closest('.lang-option');
    if (clickedOption) {
      const newLang = clickedOption.dataset.lang;
      if (newLang && newLang !== currentLang) {
        setLanguage(newLang);
      }
    } else {
      // Toggle between languages when clicking the toggle itself
      const newLang = currentLang === 'en' ? 'es' : 'en';
      setLanguage(newLang);
    }
  });

  // Keyboard support
  langToggle.setAttribute('tabindex', '0');
  langToggle.setAttribute('role', 'switch');
  langToggle.setAttribute('aria-checked', currentLang === 'es');

  langToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const newLang = currentLang === 'en' ? 'es' : 'en';
      setLanguage(newLang);
    }
  });
}

// Set language and update UI
function setLanguage(lang, animate = true) {
  const previousLang = currentLang;
  currentLang = lang;
  localStorage.setItem('lang', lang);

  // Update toggle UI
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    if (animate && previousLang !== lang) {
      langToggle.classList.add('transitioning');
      setTimeout(() => {
        langToggle.classList.remove('transitioning');
      }, 500);
    }

    langToggle.dataset.lang = lang;
    langToggle.setAttribute('aria-checked', lang === 'es');

    langToggle.querySelectorAll('.lang-option').forEach(opt => {
      const isActive = opt.dataset.lang === lang;
      if (isActive) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  // Update all translatable elements with fade effect
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang] && translations[lang][key]) {
      el.style.transition = 'opacity 0.2s ease';
      el.style.opacity = '0.7';

      setTimeout(() => {
        el.textContent = translations[lang][key];
        el.style.opacity = '1';
      }, 100);
    }
  });

  // Update document language
  document.documentElement.lang = lang;

  // Dispatch custom event for other scripts
  window.dispatchEvent(new CustomEvent('languageChange', { detail: { lang } }));
}

// Get translation
function t(key) {
  return translations[currentLang]?.[key] || translations['en']?.[key] || key;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}

// Export for use in other scripts
window.i18n = {
  setLanguage,
  t,
  getCurrentLang: () => currentLang
};
