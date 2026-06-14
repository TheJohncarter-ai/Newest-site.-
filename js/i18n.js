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
    'hero.subtitle': 'Strategic Advisor · Investor Intelligence · LATAM Capital',
    'hero.description': "International business development and strategic advising for private capital funds and clean-energy ventures — building the investor relationships that institutional BD firms miss: LATAM family offices, emerging-market HNWIs, and conference-native capital networks across six countries.",
    'hero.cta': "Let's Talk",
    'hero.services': 'View Services',
    // Who This Is For
    'hero.fit.label': 'This is right for you if —',
    'hero.fit.1': 'You need a LATAM LP pipeline that goes deeper than cold email',
    'hero.fit.2': "You're raising capital and need warm introductions at the family office level",
    'hero.fit.3': 'You need investor intelligence infrastructure, not just a contact list',
    'hero.fit.4': 'You want a consultant who has been in the room — Monterrey, Bogotá, Miami',

    'hero.stat1': 'LP Intelligence Profiles Built',
    'hero.stat2': 'Active Family Office Contacts',
    'hero.stat3': 'Active Consulting Engagements',
    'hero.stat4': 'Markets Across the Americas',

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
    'about.badge': 'About',
    'about.title': 'Two Active Engagements. Six Markets. One Methodology.',
    'about.text1': 'Currently retained as Strategic Consultant at Firsthand Capital Management and Strategic Advisor at H2Unity (Accelerate Hydrogen Energy), providing international business development and strategic advising across private capital and clean-energy ventures.',
    'about.text2': 'The through-line across both: building investor intelligence infrastructure where none exists — translating raw conference data, warm introductions, and open-source research into actionable LP profiles, outreach sequences, and fundraising strategy.',
    'about.text3': "A decade of grounded sales and operational experience across banking, project management, international medtech sales, and multi-unit business operations brings an operator's perspective to work most advisors approach purely theoretically. Bilingual English/Spanish — available for retained consulting, advisory board positions, and international BD engagements across LATAM, Europe, and the Middle East.",
    'about.h1.title': 'LATAM Network',
    'about.h1.text': '60+ warm family office contacts · 218+ LP profiles built across six conferences — Monterrey, Bogotá, Miami, Mexico City, San Diego & Honduras',
    'about.h2.title': 'Investor Intelligence · Nexivant',
    'about.h2.text': 'Nexivant — a proprietary, purpose-built investor-intelligence platform: 218+ LP profiles with conflict screening, priority tiers & 60-day strike lists, deployed across current engagements',
    'about.h3.title': 'Certifications',
    'about.h3.text': 'Economics of Blockchain & Digital Assets — Wharton (2022) · Blockchain in Business — Columbia Business School (2022)',

    // Profile Section
    'profile.badge': 'Personal Profile',
    'profile.title': 'John Carter-Añez Powell',
    'profile.role': 'Strategic Advisor · Investor Intelligence · LATAM Capital',
    'profile.bioTitle': 'Biography',
    'profile.bio1': 'John Carter-Añez Powell is a bilingual (English/Spanish) strategic consultant and investor-intelligence architect. He is currently retained as Strategic Consultant at Firsthand Capital Management and Strategic Advisor at H2Unity (Accelerate Hydrogen Energy), having built family office relationships across six markets — Monterrey, Mexico City, Bogotá, Miami, San Diego, and Honduras.',
    'profile.bio2': 'With an active pipeline of 60+ warm family office contacts and 218+ LP intelligence profiles built, his approach is grounded in cultural fluency, patience, and genuine relationship-building — translating conference intelligence and open-source research into actionable fundraising strategy.',
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
    'markets.body': "Since late 2024 I've attended six major family office and private wealth conferences across the Americas — representing client firms, developing relationships, and cultivating a pipeline that is currently active and in development across all markets.",
    'markets.footprintLabel': 'Conference Presence 2024–2025',
    'markets.galleryLabel': 'In the Field',
    'markets.bilingualBadge': 'Bilingual: English / Spanish',

    // Opportunity Section
    'opportunity.badge': 'Engagement Types',
    'opportunity.title': 'How I Engage',
    'opportunity.quote': 'Not seeking employment. Selectively available to the right retained partners — for retained consulting, advisory positions, and project-based intelligence across LATAM, Europe, and the Middle East.',
    'opportunity.col1.label': 'Retained Consulting',
    'opportunity.col1.title': 'SOW or Monthly Retainer',
    'opportunity.col1.desc': 'Ongoing BD execution, investor intelligence, and LATAM relationship management. Currently active across two engagements.',
    'opportunity.col2.label': 'Advisory Board',
    'opportunity.col2.title': 'Strategic Advisory',
    'opportunity.col2.desc': 'Strategic advisory to investment firms, cleantech companies, or capital allocators building LATAM or international BD capability.',
    'opportunity.col3.label': 'Project-Based',
    'opportunity.col3.title': 'Investor Intelligence Builds',
    'opportunity.col3.desc': 'Discrete investor-intelligence builds — LP profiling, conference intelligence, conflict screening, outreach infrastructure — delivered as a complete platform.',

    // Contact Section
    'contact.badge': 'Get In Touch',
    'contact.title': "Let's Talk",
    'contact.description': "Whether you're an investment firm exploring LATAM, a fund building out your BD function, or someone looking to connect — I'd like to hear from you.",
    'contact.emailLabel': 'Email',
    'contact.phoneLabel': 'Phone',
    'contact.whatsappLabel': 'WhatsApp',
    'contact.whatsappLink': 'Message me on WhatsApp',
    'contact.qrScan': 'Scan to Chat',
    'contact.qrHint': 'Open WhatsApp camera and point at code',
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

    'close.headline': 'Selectively available to the right partners.',

    // Footer
    'footer.tagline': 'Strategic advisory · investor intelligence · LATAM capital.',
    'footer.navigation': 'Navigation',
    'footer.services': 'Services',
    'footer.connect': 'Connect',
    'footer.s1': 'LATAM Market Entry',
    'footer.s2': 'Family Office Access',
    'footer.s3': 'Strategic Consulting',

    // Arcana Panel
    'arcana.return': 'Return',
    'arcana.classification': 'Unfinished Transmissions · Works in Progress',
    'arcana.subtitle': 'Experiments. Concepts. Things not yet ready for the world.',
    'arcana.activeFiles': 'Active Files',
    'arcana.footer': '// End of current transmissions // More to follow //',
    'arcana.classified': 'Classified ⬡',
    'arcana.proceda.status': 'Live Prototype',
    'arcana.proceda.sub': 'Procedural Intelligence Platform',
    'arcana.proceda.hook': 'Every surgical procedure is a clinical event that vanishes the moment it ends. The device fires. The data disappears. No pattern. No intelligence. No record.\n\nPROCEDA captures the 80–200 real-world data fields generated at the point of execution — and turns them into a living dataset that compounds with every case. Faster adverse-event detection. Richer trial evidence. Device approvals cut by years.\n\nThe OR has always been the most data-rich room in medicine. It just never had a memory. Until now.',
    'arcana.proceda.s1.label': 'Addressable Market',
    'arcana.proceda.s1.desc': 'procedural device real-world evidence',
    'arcana.proceda.s2.label': 'Revenue Streams',
    'arcana.proceda.s2.desc': 'SaaS · data · trials · subscriptions',
    'arcana.proceda.s3.label': 'ARR at Exit',
    'arcana.proceda.s3.desc': 'target across 3–4 device verticals',
    'arcana.proceda.s4.label': 'Tier-1 Acquirer Profiles',
    'arcana.proceda.s4.desc': 'Owkin · Flatiron / Roche · Varian',
    'arcana.proceda.cta': 'Read the Intelligence Briefing',
    'arcana.lucreativity.status': 'Concept Stage',
    'arcana.lucreativity.sub': 'Community Infrastructure Finance Platform',
    'arcana.lucreativity.hook': 'Every $100 invested funds a building, earns a verified return, and creates a living impact record tracking every patient, every surgery, every life changed — forever. Exit whenever you want. Keep the certificate for life.',
    'arcana.lucreativity.s1.label': 'Addressable Market Entry Point',
    'arcana.lucreativity.s1.desc': 'Annual global diaspora remittances — currently directed to consumption, not investment',
    'arcana.lucreativity.s2.label': 'Revenue Streams',
    'arcana.lucreativity.s2.desc': 'Listing · origination · contribution fee · syndication · secondary market · Evergreen Fund spread',
    'arcana.lucreativity.s3.label': 'Fee Revenue Per Project',
    'arcana.lucreativity.s3.desc': 'Across both financing phases on a single $5M hospital — before Evergreen Fund AUM spread',
    'arcana.lucreativity.s4.label': 'Retail Liquidity Windows',
    'arcana.lucreativity.s4.desc': 'Secondary market · Evergreen Fund quarterly · milestone buyouts · bank completion buyout',
    'arcana.lucreativity.cta': 'Read the Intelligence Briefing',
    'arcana.status.progress': 'In Progress',
    'arcana.status.drafting': 'Drafting',
    'arcana.status.concept': 'Concept Stage',
    'arcana.status.research': 'Early Research',
    'arcana.status.forthcoming': 'Forthcoming',
    'arcana.card2.title': 'Family Office Network Map',
    'arcana.card2.desc': 'A visual intelligence layer for relationship mapping across six LATAM markets — charting the invisible architecture of private capital flows.',
    'arcana.card3.title': 'The Bilingual Pitch Protocol',
    'arcana.card3.desc': 'A structured system for translating investment narratives across cultural registers — not just EN/ES, but the unspoken language of trust.',
    'arcana.card4.title': 'Capital Access Protocol',
    'arcana.card4.desc': 'A field-tested framework for navigating warm introductions into closed-door networks. The architecture of the introduction that actually gets answered.',
    'arcana.card5.title': 'The Annex',
    'arcana.card5.desc': 'A long-form conversation series at the intersection of capital, culture, and language — for the people doing the work that never makes it into the pitch deck.',
    'arcana.card6.title': 'Colombia Venture Atlas',
    'arcana.card6.desc': 'Mapping the emerging startup and investment ecosystem across Bogotá, Medellín, and Cali — tracking the founders and capital pools forming outside the noise.',
    'arcana.placeholder.title': 'Transmission Pending',
    'arcana.placeholder.desc': 'Something is forming. Not ready to be named yet.',
    'arcana.tag.intelligence': 'Intelligence',
    'arcana.tag.methodology': 'Methodology',
    'arcana.tag.protocol': 'Protocol',
    'arcana.tag.series': 'Series',
    'arcana.tag.research': 'Research',
    'arcana.tag.unknown': 'Unknown',
    'arcana.gate.badge': 'CONFIDENTIAL BRIEFING',
    'arcana.gate.sub': 'Procedural Intelligence Platform · Standalone Business Model',
    'arcana.gate.text': 'This document contains proprietary business intelligence. Enter your email address to access the full briefing. Your access will be logged and the PROCEDA team will be notified.',
    'arcana.gate.cta': 'Access Briefing →'
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
    'hero.subtitle': 'Asesor Estratégico · Inteligencia de Inversionistas · Capital LATAM',
    'hero.description': 'Desarrollo de negocios internacional y asesoría estratégica para fondos de capital privado y empresas de energía limpia — construyendo las relaciones con inversionistas que las firmas institucionales de BD no alcanzan: family offices de LATAM, HNWIs de mercados emergentes y redes de capital nativas de conferencias en seis países.',
    'hero.cta': 'Hablemos',
    'hero.services': 'Ver Servicios',
    // Who This Is For (ES)
    'hero.fit.label': 'Esto es para ti si —',
    'hero.fit.1': 'Necesitas un pipeline de LPs en LATAM que vaya más allá del correo en frío',
    'hero.fit.2': 'Estás levantando capital y necesitas presentaciones cálidas a nivel de family office',
    'hero.fit.3': 'Necesitas infraestructura de inteligencia de inversionistas, no solo una lista de contactos',
    'hero.fit.4': 'Quieres un consultor que ha estado en la sala — Monterrey, Bogotá, Miami',

    'hero.stat1': 'Perfiles de Inteligencia de LPs Construidos',
    'hero.stat2': 'Contactos Activos de Family Office',
    'hero.stat3': 'Compromisos de Consultoría Activos',
    'hero.stat4': 'Mercados en las Américas',

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
    'about.badge': 'Acerca',
    'about.title': 'Dos Compromisos Activos. Seis Mercados. Una Metodología.',
    'about.text1': 'Actualmente contratado como Consultor Estratégico en Firsthand Capital Management y Asesor Estratégico en H2Unity (Accelerate Hydrogen Energy), brindando desarrollo de negocios internacional y asesoría estratégica en capital privado y energía limpia.',
    'about.text2': 'El hilo conductor en ambos: construir infraestructura de inteligencia de inversionistas donde no existe — convirtiendo datos crudos de conferencias, presentaciones cálidas e investigación de fuentes abiertas en perfiles accionables de LPs, secuencias de contacto y estrategia de recaudación.',
    'about.text3': 'Una década de experiencia comercial y operativa en banca, gestión de proyectos, ventas internacionales de tecnología médica y operaciones de negocios multiunidad aporta una perspectiva de operador a un trabajo que la mayoría de los asesores abordan de forma puramente teórica. Bilingüe inglés/español — disponible para consultoría por contrato, posiciones en juntas asesoras y compromisos de BD internacional en LATAM, Europa y Medio Oriente.',
    'about.h1.title': 'Red LATAM',
    'about.h1.text': '60+ contactos cálidos de family office · 218+ perfiles de LP construidos en seis conferencias — Monterrey, Bogotá, Miami, Ciudad de México, San Diego y Honduras',
    'about.h2.title': 'Inteligencia de Inversionistas · Nexivant',
    'about.h2.text': 'Nexivant — una plataforma propietaria de inteligencia de inversionistas, construida a medida: 218+ perfiles de LP con detección de conflictos, niveles de prioridad y listas de objetivos a 60 días, desplegada en los compromisos actuales',
    'about.h3.title': 'Certificaciones',
    'about.h3.text': 'Economics of Blockchain & Digital Assets — Wharton (2022) · Blockchain in Business — Columbia Business School (2022)',

    // Profile Section
    'profile.badge': 'Perfil Personal',
    'profile.title': 'John Carter-Añez Powell',
    'profile.role': 'Asesor Estratégico · Inteligencia de Inversionistas · Capital LATAM',
    'profile.bioTitle': 'Biografía',
    'profile.bio1': 'John Carter-Añez Powell es un consultor estratégico bilingüe (inglés/español) y arquitecto de inteligencia de inversionistas. Actualmente está contratado como Consultor Estratégico en Firsthand Capital Management y Asesor Estratégico en H2Unity (Accelerate Hydrogen Energy), habiendo construido relaciones con family offices en seis mercados — Monterrey, Ciudad de México, Bogotá, Miami, San Diego y Honduras.',
    'profile.bio2': 'Con un pipeline activo de más de 60 contactos cálidos de family office y más de 218 perfiles de inteligencia de LPs construidos, su enfoque se fundamenta en la fluidez cultural, la paciencia y la construcción genuina de relaciones — convirtiendo la inteligencia de conferencias y la investigación de fuentes abiertas en estrategia accionable de recaudación.',
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
    'markets.body': 'Desde finales de 2024 asistí a seis grandes conferencias de family offices y patrimonio privado en las Américas — representando a firmas cliente, desarrollando relaciones y cultivando un pipeline que actualmente se encuentra activo y en desarrollo en todos los mercados.',
    'markets.footprintLabel': 'Presencia en Conferencias 2024–2025',
    'markets.galleryLabel': 'En el Campo',
    'markets.bilingualBadge': 'Bilingüe: Inglés / Español',

    // Opportunity Section
    'opportunity.badge': 'Tipos de Compromiso',
    'opportunity.title': 'Cómo Colaboro',
    'opportunity.quote': 'No busco empleo. Disponible de forma selectiva para los socios adecuados bajo contrato — para consultoría por contrato, posiciones de asesoría e inteligencia por proyecto en LATAM, Europa y Medio Oriente.',
    'opportunity.col1.label': 'Consultoría por Contrato',
    'opportunity.col1.title': 'SOW o Retención Mensual',
    'opportunity.col1.desc': 'Ejecución continua de BD, inteligencia de inversionistas y gestión de relaciones en LATAM. Actualmente activo en dos compromisos.',
    'opportunity.col2.label': 'Junta Asesora',
    'opportunity.col2.title': 'Asesoría Estratégica',
    'opportunity.col2.desc': 'Asesoría estratégica a firmas de inversión, empresas cleantech o asignadores de capital que construyen capacidad de BD en LATAM o internacional.',
    'opportunity.col3.label': 'Por Proyecto',
    'opportunity.col3.title': 'Construcciones de Inteligencia de Inversionistas',
    'opportunity.col3.desc': 'Construcciones discretas de inteligencia de inversionistas — perfilado de LPs, inteligencia de conferencias, detección de conflictos, infraestructura de contacto — entregadas como una plataforma completa.',

    // Contact Section
    'contact.badge': 'Ponte en Contacto',
    'contact.title': 'Hablemos',
    'contact.description': 'Ya seas una firma de inversión explorando LATAM, un fondo que amplía su función de BD, o alguien que busca conectar — me gustaría escucharte.',
    'contact.emailLabel': 'Correo Electrónico',
    'contact.phoneLabel': 'Teléfono',
    'contact.whatsappLabel': 'WhatsApp',
    'contact.whatsappLink': 'Escríbeme por WhatsApp',
    'contact.qrScan': 'Escanear para Chatear',
    'contact.qrHint': 'Abre la cámara de WhatsApp y apunta al código',
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

    'close.headline': 'Disponible selectivamente para los socios adecuados.',

    // Footer
    'footer.tagline': 'Asesoría estratégica · inteligencia de inversionistas · capital LATAM.',
    'footer.navigation': 'Navegación',
    'footer.services': 'Servicios',
    'footer.connect': 'Conectar',
    'footer.s1': 'Entrada al Mercado LATAM',
    'footer.s2': 'Acceso a Family Offices',
    'footer.s3': 'Consultoría Estratégica',

    // Arcana Panel (ES)
    'arcana.return': 'Volver',
    'arcana.classification': 'Transmisiones sin Terminar · Obras en Progreso',
    'arcana.subtitle': 'Experimentos. Conceptos. Cosas que aún no están listas para el mundo.',
    'arcana.activeFiles': 'Archivos Activos',
    'arcana.footer': '// Fin de las transmisiones actuales // Más por venir //',
    'arcana.classified': 'Clasificado ⬡',
    'arcana.proceda.status': 'Prototipo en Vivo',
    'arcana.proceda.sub': 'Plataforma de Inteligencia Procedimental',
    'arcana.proceda.hook': 'Cada procedimiento de precisión genera 80–200 campos de datos en el momento en que se ejecuta. Esos datos nunca han sido capturados. Hasta ahora.',
    'arcana.proceda.s1.label': 'Mercado Objetivo',
    'arcana.proceda.s1.desc': 'evidencia del mundo real en dispositivos procedimentales',
    'arcana.proceda.s2.label': 'Fuentes de Ingreso',
    'arcana.proceda.s2.desc': 'SaaS · datos · ensayos · suscripciones',
    'arcana.proceda.s3.label': 'ARR al Salir',
    'arcana.proceda.s3.desc': 'objetivo en 3–4 verticales de dispositivos',
    'arcana.proceda.s4.label': 'Perfiles de Compradores Tier-1',
    'arcana.proceda.s4.desc': 'Owkin · Flatiron / Roche · Varian',
    'arcana.proceda.cta': 'Leer el Informe de Inteligencia',
    'arcana.lucreativity.status': 'Etapa Conceptual',
    'arcana.lucreativity.sub': 'Plataforma de Financiamiento de Infraestructura Comunitaria',
    'arcana.lucreativity.hook': 'Cada $100 invertido financia un edificio, genera un retorno verificado y crea un registro de impacto que rastrea cada paciente, cada cirugía, cada vida transformada — para siempre. Sal cuando quieras. Conserva el certificado de por vida.',
    'arcana.lucreativity.s1.label': 'Punto de Entrada al Mercado',
    'arcana.lucreativity.s1.desc': 'Remesas diaspóricas globales anuales — actualmente dirigidas al consumo, no a la inversión',
    'arcana.lucreativity.s2.label': 'Fuentes de Ingreso',
    'arcana.lucreativity.s2.desc': 'Listado · originación · tarifa de contribución · sindicación · mercado secundario · spread del Fondo Evergreen',
    'arcana.lucreativity.s3.label': 'Ingresos por Proyecto',
    'arcana.lucreativity.s3.desc': 'En ambas fases de financiamiento de un solo hospital de $5M — antes del spread AUM del Fondo Evergreen',
    'arcana.lucreativity.s4.label': 'Ventanas de Liquidez Retail',
    'arcana.lucreativity.s4.desc': 'Mercado secundario · Fondo Evergreen trimestral · compras por hito · compra bancaria al finalizar',
    'arcana.lucreativity.cta': 'Leer el Informe de Inteligencia',
    'arcana.status.progress': 'En Progreso',
    'arcana.status.drafting': 'En Borrador',
    'arcana.status.concept': 'Etapa Conceptual',
    'arcana.status.research': 'Investigación Inicial',
    'arcana.status.forthcoming': 'Próximamente',
    'arcana.card2.title': 'Mapa de Red de Family Offices',
    'arcana.card2.desc': 'Una capa de inteligencia visual para mapear relaciones en seis mercados LATAM — trazando la arquitectura invisible de los flujos de capital privado.',
    'arcana.card3.title': 'El Protocolo de Pitch Bilingüe',
    'arcana.card3.desc': 'Un sistema estructurado para traducir narrativas de inversión a través de registros culturales — no solo EN/ES, sino el lenguaje no dicho de la confianza.',
    'arcana.card4.title': 'Protocolo de Acceso al Capital',
    'arcana.card4.desc': 'Un marco probado en campo para navegar presentaciones cálidas en redes de puertas cerradas. La arquitectura de la introducción que realmente recibe respuesta.',
    'arcana.card5.title': 'El Anexo',
    'arcana.card5.desc': 'Una serie de conversaciones de largo aliento en la intersección del capital, la cultura y el lenguaje — para quienes hacen el trabajo que nunca llega al pitch deck.',
    'arcana.card6.title': 'Atlas Venture de Colombia',
    'arcana.card6.desc': 'Mapeando el ecosistema emergente de startups e inversión en Bogotá, Medellín y Cali — rastreando a los fundadores y pools de capital que se forman fuera del ruido.',
    'arcana.placeholder.title': 'Transmisión Pendiente',
    'arcana.placeholder.desc': 'Algo se está formando. Aún no está listo para ser nombrado.',
    'arcana.tag.intelligence': 'Inteligencia',
    'arcana.tag.methodology': 'Metodología',
    'arcana.tag.protocol': 'Protocolo',
    'arcana.tag.series': 'Serie',
    'arcana.tag.research': 'Investigación',
    'arcana.tag.unknown': 'Desconocido',
    'arcana.gate.badge': 'INFORME CONFIDENCIAL',
    'arcana.gate.sub': 'Plataforma de Inteligencia Procedimental · Modelo de Negocio',
    'arcana.gate.text': 'Este documento contiene inteligencia de negocio propietaria. Ingresa tu correo electrónico para acceder al informe completo. Tu acceso será registrado y el equipo de PROCEDA será notificado.',
    'arcana.gate.cta': 'Acceder al Informe →'
  }
};

// Language state
let currentLang = localStorage.getItem('lang') || 'en';

// Wire a single toggle element (navbar or Arcana)
function wireToggle(toggle, isArcana) {
  if (!toggle) return;

  const optionClass   = isArcana ? '.arcana-lang-option' : '.lang-option';
  const sliderClass   = isArcana ? '.arcana-lang-slider'  : '.lang-slider';
  const transitioning = isArcana ? 'arcana-transitioning' : 'transitioning';

  toggle.setAttribute('tabindex', '0');
  toggle.setAttribute('role', 'switch');
  toggle.setAttribute('aria-checked', currentLang === 'es');

  toggle.addEventListener('click', (e) => {
    const clicked = e.target.closest(optionClass);
    const newLang = clicked
      ? (clicked.dataset.lang !== currentLang ? clicked.dataset.lang : null)
      : (currentLang === 'en' ? 'es' : 'en');
    if (newLang) setLanguage(newLang);
  });

  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLanguage(currentLang === 'en' ? 'es' : 'en');
    }
  });
}

// Initialize i18n
function initI18n() {
  const langToggle = document.getElementById('langToggle');
  if (!langToggle) return;

  wireToggle(langToggle, false);
  // Arcana toggle may not exist yet — wire it once the portal is first opened
  const arcanaToggle = document.getElementById('arcanaLangToggle');
  if (arcanaToggle) wireToggle(arcanaToggle, true);

  // Set initial state (renders translations + syncs both toggles)
  setLanguage(currentLang);
}

// Update a single toggle element's visual state
function syncToggleUI(toggle, lang, isArcana, animate) {
  if (!toggle) return;
  const optionClass   = isArcana ? '.arcana-lang-option' : '.lang-option';
  const transitioning = isArcana ? 'arcana-transitioning' : 'transitioning';

  if (animate) {
    toggle.classList.add(transitioning);
    setTimeout(() => toggle.classList.remove(transitioning), 500);
  }

  toggle.dataset.lang = lang;
  toggle.setAttribute('aria-checked', lang === 'es');
  toggle.querySelectorAll(optionClass).forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === lang);
  });
}

// Set language and update UI
function setLanguage(lang, animate = true) {
  const previousLang = currentLang;
  currentLang = lang;
  localStorage.setItem('lang', lang);

  // Sync both toggles
  syncToggleUI(document.getElementById('langToggle'),       lang, false, animate && previousLang !== lang);
  syncToggleUI(document.getElementById('arcanaLangToggle'), lang, true,  animate && previousLang !== lang);

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
