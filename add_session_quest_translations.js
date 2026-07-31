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
  "lobby_title": "Welcome to SECCION",
  "lobby_sub": "A gamified welcome experience built on real psychology.",
  "lobby_p1": "Before we ask you for a username or password, we want to prove why SECCION is different. No endless swiping. No fake connections.",
  "lobby_p2": "Let's explore your vibe, build connection chemistry, and unlock moves. Right now. No account needed.",
  "lobby_cta": "Enter The Quest",
  "vibe_title": "What's Your Vibe?",
  "vibe_sub": "Choose your core archetype to shape your matching potential.",
  "chemistry_title": "The Chemistry Meter",
  "chemistry_sub": "Two-player co-op connection dynamics.",
  "synergy_title": "Predictive Matching",
  "synergy_sub": "Merging your Synergy Auras in real-time.",
  "hub_title": "Part 1 Complete!",
  "hub_p1": "You've selected your archetype and explored the Chemistry Meter. You can join SECCION now to activate your profile, or continue to Part 2 for a full platform simulation.",
  "hub_cta_signup": "Join SECCION Now",
  "hub_cta_continue": "Go Deeper (Part 2)",
  "quiz_title": "Insight Generator",
  "quiz_sub": "Reveal your digital habits to tune your Synergy Aura.",
  "secret_title": "The Pivot",
  "secret_p1": "Everything you've seen? That wasn't pre-saved. SECCION mapped it dynamically from your interactions.",
  "secret_p2": "This is the level of depth members get every day. We don't guess compatibility; we build it.",
  "secret_cta": "Claim Your SECCION Profile",
  "secret_cta_home": "Go Back to Home Page",
  "subtitles_active": "Subtitles Active",
  
  "speech_chemistry": "Observe the Chemistry Gauge. In SECCION, compatibility is calculated symmetrically using a harmonic mean. Both sides must invest to level up.",
  "speech_synergy": "Here is our Synergy Engine metrics engine. We analyze personality compatibility, recent momentum, and schedule opportunities.",
  "speech_dayInLife": "Let's simulate a typical day on SECCION. Observe how notifications, matchmaking sweeps, and conversational metrics flow.",
  "speech_quiz": "Answer these simple questions. We'll build a live archetype vector without making you fill an actual profile form.",
  
  "archetype_creative": "Creative Dreamer",
  "archetype_creative_desc": "Expressive, thoughtful, designs playlist-worthy connections.",
  "archetype_social": "Social Connector",
  "archetype_social_desc": "Autonomic helper, remembers names, builds supportive bridges.",
  "archetype_adrenaline": "Adrenaline Seeker",
  "archetype_adrenaline_desc": "Spontaneous, lives at full speed, plans adventures on the fly.",
  "archetype_analytical": "Analytical Builder",
  "archetype_analytical_desc": "Methodical thinker, values scheduling, builds solid structures.",
  "archetype_romantic": "Romantic Idealist",
  "archetype_romantic_desc": "Deep dreamer, writes by hand, values absolute relationships.",
  
  "quiz_q1": "On weekends, what fuels your battery the most?",
  "quiz_q1_opt1": "Designing or creating something quiet ??",
  "quiz_q1_opt2": "Hosting a dinner or gathering friends ??",
  "quiz_q1_opt3": "Booking a last-minute flight or road trip ??",
  
  "quiz_q2": "How do you handle disagreement in relationships?",
  "quiz_q2_opt1": "Discuss it immediately with direct honesty ??",
  "quiz_q2_opt2": "Take space to process before communicating ??",
  "quiz_q2_opt3": "Defuse tension with playfulness and humor ??",
  
  "quiz_q3": "What is your main investment driver in connection?",
  "quiz_q3_opt1": "Shared travel, events, and unique experiences ??",
  "quiz_q3_opt2": "Deep emotional validation and daily vulnerability ??",
  "quiz_q3_opt3": "Intellectual debate and collaborative projects ??"
};

const esNew = {
  "lobby_title": "Bienvenido a SECCION",
  "lobby_sub": "Una experiencia de bienvenida gamificada basada en psicología real.",
  "lobby_p1": "Antes de pedirte un usuario o contraseña, queremos demostrar por qué SECCION es diferente. Sin deslizamientos infinitos. Sin conexiones falsas.",
  "lobby_p2": "Exploremos tu estilo, construyamos química de conexión y desbloqueemos movimientos. Ahora mismo. Sin cuenta.",
  "lobby_cta": "Comenzar Búsqueda",
  "vibe_title": "¿Cuál es tu Estilo?",
  "vibe_sub": "Elige tu arquetipo para definir tu potencial de emparejamiento.",
  "chemistry_title": "El Medidor de Química",
  "chemistry_sub": "Dinámicas de conexión co-op para dos jugadores.",
  "synergy_title": "Emparejamiento Predictivo",
  "synergy_sub": "Fusión de tus Auras de Sinergia en tiempo real.",
  "hub_title": "¡Parte 1 Completada!",
  "hub_p1": "Has seleccionado tu arquetipo y explorado el Medidor de Química. Puedes unirte a SECCION ahora para activar tu perfil, o continuar a la Parte 2 para una simulación completa.",
  "hub_cta_signup": "Unirse a SECCION Ahora",
  "hub_cta_continue": "Ir más profundo (Parte 2)",
  "quiz_title": "Generador de Insights",
  "quiz_sub": "Revela tus hábitos digitales para sintonizar tu Aura.",
  "secret_title": "El Pivote",
  "secret_p1": "¿Todo lo que has visto? No estaba preguardado. SECCION lo mapeó dinámicamente a partir de tus interacciones.",
  "secret_p2": "Este es el nivel de profundidad que los miembros obtienen todos los días. No adivinamos la compatibilidad; la construimos.",
  "secret_cta": "Reclamar tu Perfil de SECCION",
  "secret_cta_home": "Volver a la Página de Inicio",
  "subtitles_active": "Subtítulos Activos",
  
  "speech_chemistry": "Observa el Medidor de Química. En SECCION, la compatibilidad se calcula simétricamente usando una media armónica. Ambos lados deben invertir para subir de nivel.",
  "speech_synergy": "Aquí está nuestro motor de métricas Synergy Engine. Analizamos la compatibilidad de personalidad, el impulso reciente y las oportunidades de horarios.",
  "speech_dayInLife": "Vamos a simular un día típico en SECCION. Observa cómo fluyen las notificaciones, los barridos de emparejamiento y las métricas conversacionales.",
  "speech_quiz": "Responde estas sencillas preguntas. Construiremos un vector de arquetipo en vivo sin obligarte a llenar un formulario de perfil real.",
  
  "archetype_creative": "Soñador Creativo",
  "archetype_creative_desc": "Expresivo, reflexivo, diseña conexiones dignas de una playlist.",
  "archetype_social": "Conector Social",
  "archetype_social_desc": "Ayudante autónomo, recuerda nombres, construye puentes de apoyo.",
  "archetype_adrenaline": "Buscador de Adrenalina",
  "archetype_adrenaline_desc": "Espontáneo, vive a toda velocidad, planea aventuras sobre la marcha.",
  "archetype_analytical": "Constructor Analítico",
  "archetype_analytical_desc": "Pensador metódico, valora la programación, construye estructuras sólidas.",
  "archetype_romantic": "Idealista Romántico",
  "archetype_romantic_desc": "Soñador profundo, escribe a mano, valora las relaciones absolutas.",
  
  "quiz_q1": "Los fines de semana, ¿qué recarga más tu batería?",
  "quiz_q1_opt1": "Diseñar o crear algo tranquilo ??",
  "quiz_q1_opt2": "Organizar una cena o reunir amigos ??",
  "quiz_q1_opt3": "Reservar un vuelo de última hora o viaje por carretera ??",
  
  "quiz_q2": "¿Cómo manejas los desacuerdos en las relaciones?",
  "quiz_q2_opt1": "Lo discuto de inmediato con honestidad directa ??",
  "quiz_q2_opt2": "Tomo espacio para procesar antes de comunicarme ??",
  "quiz_q2_opt3": "Desactivo la tensión con alegría y humor ??",
  
  "quiz_q3": "¿Cuál es tu principal motor de inversión en la conexión?",
  "quiz_q3_opt1": "Viajes compartidos, eventos y experiencias únicas ??",
  "quiz_q3_opt2": "Validación emocional profunda y vulnerabilidad diaria ??",
  "quiz_q3_opt3": "Debate intelectual y proyectos colaborativos ??"
};

updateLocales('sessionQuest', 'main', enNew, esNew);
