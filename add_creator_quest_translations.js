const fs = require('fs');
const path = require('path');

function updateLocales(namespace, key, enData, esData) {
  const enPath = path.join(__dirname, 'src/locales/en.json');
  const esPath = path.join(__dirname, 'src/locales/es.json');
  
  let enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  let esJson = JSON.parse(fs.readFileSync(esPath, 'utf8'));
  
  if (!enJson[namespace]) enJson[namespace] = {};
  if (!esJson[namespace]) esJson[namespace] = {};
  
  enJson[namespace][key] = enData;
  esJson[namespace][key] = esData;
  
  fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2));
  fs.writeFileSync(esPath, JSON.stringify(esJson, null, 2));
  console.log('Locales updated successfully');
}

const enNew = {
  "lobby_title": "Welcome to SECCION Studio Tour",
  "lobby_sub": "A monetization-focused welcome experience built for professional creators.",
  "lobby_p1": "Before you sign up or configure anything, we want to prove how SECCION maximizes your revenue. No management agencies taking 40%. No commission traps.",
  "lobby_p2": "Let's explore your vibe, test our streaming cockpit, and review your 7 built-in revenue streams. Right now. No account needed.",
  "lobby_cta": "Enter The Studio Tour",
  "vibe_title": "Choose Your Mode",
  "vibe_sub": "Verify if you are here as a creator or member.",
  "hub_cta_creator": "Launch Creator Tour",
  "hub_cta_member": "Switch to Member Quest",
  "profile_title": "Profile & Portfolio Setup",
  "profile_sub": "Configure custom monetization tiers and privacy locks.",
  "profile_blur_label": "Face Blur Privacy Gate Enabled",
  "profile_cta": "Save and Go Live",
  "secret_title": "Studio Tour Complete",
  "secret_p1": "Everything you've seen is mapped dynamically to protect and monetize your audience. SECCION does the heavy lifting for you.",
  "secret_p2": "This is the level of automation and protection creators get every day. We don't guess your value; we unlock it.",
  "secret_cta": "Claim Your SECCION Studio",
  "secret_cta_home": "Go Back to Home Page",
  "subtitles_active": "Subtitles Active",
  
  "speech_revenue": "Look at our Revenue Payout Math. Most platforms or agencies take up to 40% or more. SECCION keeps it flat: you retain 80% of all earnings.",
  "speech_stream": "Observe the Stream Station cockpit. Monitor simulated viewers and check out our Face Blur privacy and ephemeral media gates.",
  "speech_monetization": "Review the 7 built-in streams. Additionally, see how our built-in AI Replacement Agent automates fan interactions 24/7.",
  
  "archetype_streamer": "Live Broadcaster",
  "archetype_streamer_desc": "Monetizes high-interaction streams and community goals.",
  "archetype_portfolio": "Exclusive Artist",
  "archetype_portfolio_desc": "Builds premium tiers, custom requests, and ephemeral catalogs.",
  "archetype_hybrid": "Hybrid Creator",
  "archetype_hybrid_desc": "Mixes free DMs, AI auto-upsells, and private consultations."
};

const esNew = {
  "lobby_title": "Bienvenido al SECCION Studio Tour",
  "lobby_sub": "Una experiencia de bienvenida enfocada en monetización para creadores profesionales.",
  "lobby_p1": "Antes de registrarte o configurar algo, queremos demostrar cómo SECCION maximiza tus ingresos. Sin agencias que se queden con el 40%. Sin trampas de comisión.",
  "lobby_p2": "Explora tu estilo, prueba la cabina de streaming y revisa tus 7 flujos de ingresos integrados. Ahora mismo. Sin cuenta.",
  "lobby_cta": "Iniciar Studio Tour",
  "vibe_title": "Elige tu Modo",
  "vibe_sub": "Confirma si estás aquí como creador o miembro.",
  "hub_cta_creator": "Iniciar Tour de Creador",
  "hub_cta_member": "Cambiar a Búsqueda de Miembro",
  "profile_title": "Configuración de Perfil y Portafolio",
  "profile_sub": "Configura niveles de monetización personalizados y bloqueos de privacidad.",
  "profile_blur_label": "Filtro de Privacidad Face Blur Activo",
  "profile_cta": "Guardar e Ir en Vivo",
  "secret_title": "Studio Tour Completado",
  "secret_p1": "Todo lo que has visto se mapea dinámicamente para proteger y monetizar tu audiencia. SECCION hace el trabajo pesado por ti.",
  "secret_p2": "Este es el nivel de automatización y protección que los creadores obtienen todos los días. No adivinamos tu valor; lo desbloqueamos.",
  "secret_cta": "Reclamar tu Estudio de SECCION",
  "secret_cta_home": "Volver a la Página de Inicio",
  "subtitles_active": "Subtítulos Activos",
  
  "speech_revenue": "Mira nuestras matemáticas de pago de ingresos. La mayoría de plataformas y agencias toman hasta el 40% o más. SECCION lo mantiene plano: retienes el 80% de todas las ganancias.",
  "speech_stream": "Observa la cabina Stream Station. Monitorea espectadores simulados y comprueba nuestras barreras de privacidad Face Blur y medios efímeros.",
  "speech_monetization": "Revisa los 7 flujos integrados. Además, mira cómo nuestro Agente IA de Reemplazo automatiza interacciones con fans 24/7.",
  
  "archetype_streamer": "Broadcaster en Vivo",
  "archetype_streamer_desc": "Monetiza streams de alta interacción y metas comunitarias.",
  "archetype_portfolio": "Artista Exclusivo",
  "archetype_portfolio_desc": "Construye niveles premium, peticiones personalizadas y catálogos efímeros.",
  "archetype_hybrid": "Creador Híbrido",
  "archetype_hybrid_desc": "Mezcla DMs gratis, autoventas de IA y consultas privadas."
};

updateLocales('creatorQuest', 'main', enNew, esNew);
