import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('src/locales');
const files = ['es.json', 'en.json', 'fr.json', 'pt.json', 'uk.json', 'ro.json', 'ar.json'];

const translations = {
  es: {
    landing: {
      fusionTitle: "Plataforma de Fusión",
      dating: "Citas",
      liveStreaming: "Transmisiones en Vivo",
      contentCreators: "Creadores de Contenido",
      swipeToSignUp: "DESLIZA PARA REGISTRARTE EN",
      memberQuestTab: "Misión de Miembro (Vibe Check)",
      creatorFusionTab: "Fusión de Creador (Biz-in-a-Box)",
      memberFeature1Title: "Sincronía de Sinergia 100% Gratis",
      memberFeature1Desc: "Sin muros de pago para conectar. Deslizar y hacer match es completamente gratis, financiado por nuestro ecosistema de creadores.",
      memberFeature2Title: "El Medidor de Química",
      memberFeature2Desc: "Un rastreador de sinergia estilo RPG de 8 niveles que muestra exactamente dónde estás. Evita el limbo relacional.",
      memberFeature3Title: "Árbol de Habilidades Relacionales",
      memberFeature3Desc: "Desbloquea 60+ movimientos de sugerencia: desde Toques Digitales en Nivel 2 hasta Citas de Café en Nivel 4 y Viajes en Nivel 6.",
      memberFeature4Title: "Coach AI Wingman",
      memberFeature4Desc: "Mide la Gravedad de la Conversación en tiempo real, ofreciéndote sugerencias e rompehielos cuando el chat se detiene.",
      memberFeature5Title: "Misión de Registro de 3 Min",
      memberFeature5Desc: "Selecciona tu arquetipo de personalidad para autocompletar 15 campos y empezar a vibrar con conexiones reales en menos de 3 minutos.",
      memberFeature6Title: "Motor de Sinergia Gemini AI",
      memberFeature6Desc: "Analiza tu vibración entre 9 arquetipos, estado de ánimo y momento, ofreciendo una explicación visceral de tu Aura de Sinergia.",
      creatorFeature1Title: "Reparto de Ingresos 80/20",
      creatorFeature1Desc: "Conserva el 80% de suscripciones y propinas. El match mutuo desbloquea suscripciones, reduciendo la deserción.",
      creatorFeature2Title: "Agente de Operaciones IA Gratis",
      creatorFeature2Desc: "Año 1 gratis. Reemplaza agencias: ejecuta chats 24/7 en tu voz, calcula impuestos y programa promociones multi-plataforma.",
      creatorFeature3Title: "Encriptado de Desenfoque de Rostro",
      creatorFeature3Desc: "Oculta tu rostro en feeds públicos, desencriptándolo solo para Suscriptores Master o conexiones de Química Nivel 4+.",
      creatorFeature4Title: "HUD de Transmisión & Match",
      creatorFeature4Desc: "Cockpit de transmisión con un HUD de Sinergia en vivo para ver el nivel de concordancia de los espectadores en tiempo real.",
      creatorFeature5Title: "Rastreador Web DRM",
      creatorFeature5Desc: "Rastrea filtraciones en la web y envía notificaciones de eliminación automáticas para proteger tu contenido.",
      creatorFeature6Title: "Escáner de Contratos NLP",
      creatorFeature6Desc: "Escanea contratos de marcas en segundos: detecta comisiones abusivas y cesiones no autorizadas antes de firmar."
    }
  },
  en: {
    landing: {
      fusionTitle: "Fusion Platform",
      dating: "Dating",
      liveStreaming: "Live Streaming",
      contentCreators: "Content Creators",
      swipeToSignUp: "SWIPE TO SIGN UP TO",
      memberQuestTab: "Member Quest (Vibe Check)",
      creatorFusionTab: "Creator Fusion (Biz-in-a-Box)",
      memberFeature1Title: "100% Free Synergy Sync",
      memberFeature1Desc: "No paywalls to connect. Swiping and matching is completely free, funded by our creator ecosystem.",
      memberFeature2Title: "The Chemistry Meter",
      memberFeature2Desc: "An 8-level RPG-style synergy tracker showing exactly where you stand. Skip the situationship limbo.",
      memberFeature3Title: "Relationship Skill Tree",
      memberFeature3Desc: "Unlock 60+ suggestion moves—from Level 2 Digital Pokes, to Level 4 Coffee Quests, up to Level 6 trips.",
      memberFeature4Title: "AI Wingman Coach",
      memberFeature4Desc: "Tracks Conversation Gravity in real-time, feeding you custom prompts and icebreakers when chats run dry.",
      memberFeature5Title: "3-Min Onboarding Quest",
      memberFeature5Desc: "Select your core personality archetype to auto-populate 15 fields and start vibing with real connections in under 3 minutes.",
      memberFeature6Title: "Gemini AI Synergy Engine",
      memberFeature6Desc: "Reads your vibe across 9 archetypes, mood, and momentum, giving a visceral Synergy Aura explanation.",
      creatorFeature1Title: "80/20 Revenue Split",
      creatorFeature1Desc: "Keep 80% of subscription and tip coin. Mutual match is required to unlock subscriptions—slashing churn.",
      creatorFeature2Title: "Free AI Operations Agent",
      creatorFeature2Desc: "Free Year 1. Replaces MCNs: runs 24/7 chat in your voice, forecasts taxes, and schedules multi-platform promos.",
      creatorFeature3Title: "Face Blur Encryption",
      creatorFeature3Desc: "Obscures your face on public feeds, lifting only for Master Subscribers or Chemistry Level 4+ connections.",
      creatorFeature4Title: "Broadcasting Match HUD",
      creatorFeature4Desc: "Broadcasting cockpit featuring a live Audience Match HUD to see viewers' Synergy Sync levels in real-time.",
      creatorFeature5Title: "DRM Web Sweeper",
      creatorFeature5Desc: "Hunts down leaks across the web and auto-fires takedowns so your content stays yours.",
      creatorFeature6Title: "NLP Contract Scanner",
      creatorFeature6Desc: "Scans your brand contracts in seconds — flags shady sunset commissions and unauthorized likeness grabs before you sign."
    }
  },
  fr: {
    landing: {
      fusionTitle: "Plateforme de Fusion",
      dating: "Rencontres",
      liveStreaming: "Streaming en Direct",
      contentCreators: "Créateurs de Contenu",
      swipeToSignUp: "GLISSEZ POUR VOUS INSCRIRE À",
      memberQuestTab: "Quête de Membre (Vibe Check)",
      creatorFusionTab: "Fusion Créateur (Biz-in-a-Box)",
      memberFeature1Title: "Synchro de Synergie 100% Gratuite",
      memberFeature1Desc: "Aucun paywall pour se connecter. Matcher est 100% gratuit, financé par l'écosystème de nos créateurs.",
      memberFeature2Title: "Le Compteur de Chimie",
      memberFeature2Desc: "Un suivi de synergie à 8 niveaux style RPG montrant exactement votre progression. Évitez les limbes relationnels.",
      memberFeature3Title: "Arbre de Compétences Relationnelles",
      memberFeature3Desc: "Débloquez 60+ suggestions: des Pokes virtuels au niveau 2 aux rendez-vous café au niveau 4 et voyages au niveau 6.",
      memberFeature4Title: "Coach AI Wingman",
      memberFeature4Desc: "Mesure la gravité de la conversation en temps réel et propose des relances personnalisées quand le chat faiblit.",
      memberFeature5Title: "Quête d'Inscription 3-Min",
      memberFeature5Desc: "Sélectionnez votre archétype de personnalité pour pré-remplir 15 champs et vous connecter en moins de 3 minutes.",
      memberFeature6Title: "Moteur de Synergie Gemini AI",
      memberFeature6Desc: "Analyse votre vibe parmi 9 archétypes et humeurs, offrant une explication viscérale de votre Aura de Synergie.",
      creatorFeature1Title: "Partage de Revenus 80/20",
      creatorFeature1Desc: "Conservez 80% des abonnements et pourboires. Le match mutuel débloque les abonnements, réduisant le désengagement.",
      creatorFeature2Title: "Agent d'Opérations IA Gratuit",
      creatorFeature2Desc: "1ère année gratuite. Remplace les agences: gère le chat 24/7 avec votre voix, calcule vos taxes et gère vos promos.",
      creatorFeature3Title: "Chiffrement du Flou de Visage",
      creatorFeature3Desc: "Floute votre visage sur les flux publics, levé uniquement pour les Abonnés Master ou les connexions de Niveau 4+.",
      creatorFeature4Title: "HUD de Match en Direct",
      creatorFeature4Desc: "Cockpit de diffusion avec un HUD en temps réel indiquant le niveau de synchronisation des spectateurs.",
      creatorFeature5Title: "Scanner Web DRM",
      creatorFeature5Desc: "Traque les fuites sur le web et déclenche des demandes de suppression automatiques pour protéger vos contenus.",
      creatorFeature6Title: "Scanner de Contrats NLP",
      creatorFeature6Desc: "Analyse vos contrats de marque en quelques secondes — signale les clauses abusives avant signature."
    }
  },
  pt: {
    landing: {
      fusionTitle: "Plataforma de Fusão",
      dating: "Encontros",
      liveStreaming: "Transmissões ao Vivo",
      contentCreators: "Criadores de Conteúdo",
      swipeToSignUp: "DESLIZE PARA CADASTRAR-SE NA",
      memberQuestTab: "Missão do Membro (Vibe Check)",
      creatorFusionTab: "Fusão do Criador (Biz-in-a-Box)",
      memberFeature1Title: "Sincronia de Sinergia 100% Grátis",
      memberFeature1Desc: "Sem paywalls para conectar. Conectar e fazer match é 100% gratuito, financiado pelo ecossistema de criadores.",
      memberFeature2Title: "O Medidor de Química",
      memberFeature2Desc: "Um rastreador de sinergia de 8 níveis em estilo RPG mostrando exatamente sua evolução.",
      memberFeature3Title: "Árvore de Habilidades de Relacionamento",
      memberFeature3Desc: "Desbloqueie 60+ movimentos de sugestão: de Toques Digitais no Nível 2 a Encontros de Café no Nível 4 e Viagens no Nível 6.",
      memberFeature4Title: "Coach AI Wingman",
      memberFeature4Desc: "Mede a gravidade da conversa em tempo real, sugerindo dinâmicas quando o chat esfria.",
      memberFeature5Title: "Missão de Início de 3 Min",
      memberFeature5Desc: "Escolha seu arquétipo de personalidade para preencher 15 campos e conectar em menos de 3 minutos.",
      memberFeature6Title: "Motor de Sinergia Gemini AI",
      memberFeature6Desc: "Analisa sua vibe em 9 arquétipos e momentos, fornecendo uma explicação visceral da sua Aura de Sinergia.",
      creatorFeature1Title: "Divisão de Receita 80/20",
      creatorFeature1Desc: "Fique com 80% das assinaturas e gorjetas. O match mútuo é necessário para liberar assinaturas.",
      creatorFeature2Title: "Agente de Operações IA Grátis",
      creatorFeature2Desc: "Ano 1 grátis. Substitui agências: opera chats 24/7 com sua voz, calcula impostos e agenda promoções.",
      creatorFeature3Title: "Criptografia de Desfoque de Rosto",
      creatorFeature3Desc: "Oculta seu rosto em feeds públicos, liberando apenas para Assinantes Master ou conexões de Nível 4+.",
      creatorFeature4Title: "HUD de Transmissão & Match",
      creatorFeature4Desc: "Painel de transmissão com HUD em tempo real exibindo os níveis de sincronia dos espectadores.",
      creatorFeature5Title: "Rastreador Web DRM",
      creatorFeature5Desc: "Encontra vazamentos pela web e dispara remoções automáticas para proteger seu conteúdo.",
      creatorFeature6Title: "Escâner de Contratos NLP",
      creatorFeature6Desc: "Escaneia contratos de marcas em segundos — identifica cláusulas abusivas antes de você assinar."
    }
  },
  uk: {
    landing: {
      fusionTitle: "Платформа Фюжн",
      dating: "Знайомства",
      liveStreaming: "Прямі Трансляції",
      contentCreators: "Творці Контенту",
      swipeToSignUp: "СВАЙПНІТЬ ДЛЯ РЕЄСТРАЦІЇ В",
      memberQuestTab: "Квест Учасника (Vibe Check)",
      creatorFusionTab: "Фюжн Творця (Biz-in-a-Box)",
      memberFeature1Title: "100% Безкоштовна Синхронізація",
      memberFeature1Desc: "Без пейволів для знайомств. Свайпи та метчі абсолютно безкоштовні завдяки екосистемі творців.",
      memberFeature2Title: "Лічильник Хімії",
      memberFeature2Desc: "8-рівневий RPG-трекер синергії, що показує ваш точний статус у стосунках.",
      memberFeature3Title: "Дерево Навичок Стосунків",
      memberFeature3Desc: "Розблокуйте 60+ пропозицій: від цифрових знаків уваги 2-го рівня до побачень за кавою 4-го рівня та подорожей 6-го рівня.",
      memberFeature4Title: "ШІ-Тренер Wingman",
      memberFeature4Desc: "Відстежує динаміку розмови в реальному часі та пропонує теми, коли чат затихає.",
      memberFeature5Title: "3-Хвилинний Квест Реєстрації",
      memberFeature5Desc: "Оберіть свій архетип особистості для автозаповнення 15 полів і починайте спілкування за 3 хвилини.",
      memberFeature6Title: "Двигун Синергії Gemini AI",
      memberFeature6Desc: "Аналізує ваш вайб серед 9 архетипів і надає вісцеральне пояснення вашої Аури Синергії.",
      creatorFeature1Title: "Розподіл Доходу 80/20",
      creatorFeature1Desc: "Отримуйте 80% від підписок і чайових. Взаємний метч необхідний для відкриття підписок.",
      creatorFeature2Title: "Безкоштовний ШІ-Оператор",
      creatorFeature2Desc: "1-й рік безкоштовно. Замінює агентства: веде чати 24/7 вашим голосом, розраховує податки та планує промо.",
      creatorFeature3Title: "Шифрування Розмиття Обличчя",
      creatorFeature3Desc: "Приховує обличчя у публічній стрічці, відкриваючи його лише для Master-підписників або контактів 4+ рівня.",
      creatorFeature4Title: "HUD Трансляцій та Метчів",
      creatorFeature4Desc: "Панель трансляції з живим HUD для перегляду рівня синергії глядачів у реальному часі.",
      creatorFeature5Title: "DRM-Сканер Мережі",
      creatorFeature5Desc: "Знаходить витоки контенту в мережі та автоматично надсилає скарги для їх видалення.",
      creatorFeature6Title: "NLP-Сканер Контрактів",
      creatorFeature6Desc: "Сканує брендові контракти за секунди — виявляє приховані комісії та невигідні умови перед підписанням."
    }
  },
  ro: {
    landing: {
      fusionTitle: "Platformă de Fuziune",
      dating: "Întâlniri",
      liveStreaming: "Transmisiuni în Direct",
      contentCreators: "Creatori de Conținut",
      swipeToSignUp: "GLISEAZĂ PENTRU ÎNREGISTRARE PE",
      memberQuestTab: "Misiunea Membrului (Vibe Check)",
      creatorFusionTab: "Fuziunea Creatorului (Biz-in-a-Box)",
      memberFeature1Title: "Sincronizare de Sinergie 100% Gratuită",
      memberFeature1Desc: "Fără taxe pentru a conecta. Glisarea și potrivirea sunt 100% gratuite, finanțate de ecosistemul creatorilor.",
      memberFeature2Title: "Contorul de Chimie",
      memberFeature2Desc: "Un tracker de sinergie pe 8 niveluri în stil RPG care arată exact unde vă aflați.",
      memberFeature3Title: "Arborele de Abilități Relaționale",
      memberFeature3Desc: "Deblochează 60+ sugestii: de la atenții digitale la Nivelul 2, la cafea la Nivelul 4 și călătorii la Nivelul 6.",
      memberFeature4Title: "Antrenor AI Wingman",
      memberFeature4Desc: "Măsoară gravitatea conversației în timp real și oferă idei de deschidere când chatul încetinește.",
      memberFeature5Title: "Misiune de Înregistrare de 3 Min",
      memberFeature5Desc: "Alege-ți arhetipul de personalitate pentru a completa 15 câmpuri și conectează-te în mai puțin de 3 minute.",
      memberFeature6Title: "Motorul de Sinergie Gemini AI",
      memberFeature6Desc: "Analizează vibe-ul tău prin 9 arhetipuri și stări, oferind o explicație viscerală a Aurei tale de Sinergie.",
      creatorFeature1Title: "Imparțire Venituri 80/20",
      creatorFeature1Desc: "Păstrează 80% din abonamente și bacșișuri. Potrivirea reciprocă este necesară pentru a debloca abonamentele.",
      creatorFeature2Title: "Agent de Operațiuni IA Gratuit",
      creatorFeature2Desc: "Anul 1 gratuit. Înlocuiește agențiile: gestionează chatul 24/7 cu vocea ta, calculează taxe și programează promoții.",
      creatorFeature3Title: "Criptarea Blurării Feței",
      creatorFeature3Desc: "Ascunde fața pe fluxurile publice, deblocând-o doar pentru Abonații Master sau conexiunile de Nivel 4+.",
      creatorFeature4Title: "HUD de Transmisiune & Match",
      creatorFeature4Desc: "Panou de difuzare cu HUD în timp real care arată nivelul de potrivire al spectatorilor.",
      creatorFeature5Title: "Scannere Web DRM",
      creatorFeature5Desc: "Caută scurgerile de conținut pe web și trimite notificări de ștergere automate.",
      creatorFeature6Title: "Scanner de Contracte NLP",
      creatorFeature6Desc: "Scanează contractele de brand în câteva secunde — identifică clauzele abuzive înainte de a semna."
    }
  },
  ar: {
    landing: {
      fusionTitle: "منصة الاندماج",
      dating: "التعارف",
      liveStreaming: "البث المباشر",
      contentCreators: "صناع المحتوى",
      swipeToSignUp: "اسحب للتسجيل في",
      memberQuestTab: "مهمة العضو (اختبار الفايب)",
      creatorFusionTab: "اندماج الصانع (Biz-in-a-Box)",
      memberFeature1Title: "تزامن مجاني 100%",
      memberFeature1Desc: "بدون رسوم للتواصل. التمرير والمطابقة مجانيان بالكامل بفضل منظومة صناع المحتوى.",
      memberFeature2Title: "مقياس الكيمياء",
      memberFeature2Desc: "متبع تآلف من 8 مستويات بأسلوب RPG يوضح موقعك بالضبط في العلاقة.",
      memberFeature3Title: "شجرة مهارات العلاقات",
      memberFeature3Desc: "افتح أكثر من 60 اقتراحاً: من الإشارات الرقمية في المستوى 2 إلى موعد القهوة في المستوى 4 والرحلات في المستوى 6.",
      memberFeature4Title: "مساعد الذكاء الاصطناعي Wingman",
      memberFeature4Desc: "يقيس جاذبية المحادثة في الوقت الفعلي ويقترح أفكاراً للمحادثة عند توقفها.",
      memberFeature5Title: "مهمة تسجيل في 3 دقائق",
      memberFeature5Desc: "اختر نمط شخصيتك لملء 15 حقلاً تلقائياً وابدأ التفاعل في أقل من 3 دقائق.",
      memberFeature6Title: "محرك التآلف Gemini AI",
      memberFeature6Desc: "يحلل طاقك عبر 9 أنماط وحالات مزاجية ويقدم شرحاً عميقاً لهالة التآلف الخاصة بك.",
      creatorFeature1Title: "تقاسم أرباح 80/20",
      creatorFeature1Desc: "احتفظ بـ 80% من الاشتراكات والإكراميات. التوافق المتبادل مطلوب لفتح الاشتراكات.",
      creatorFeature2Title: "وكيل عمليات ذكاء اصطناعي مجاني",
      creatorFeature2Desc: "السنة الأولى مجاناً. يستبدل الوكالات: يدير الدردشة 24/7 بصوتك ويحسب الضرائب ويجدول الحملات.",
      creatorFeature3Title: "تشفير ضبابية الوجه",
      creatorFeature3Desc: "يخفي وجهك في التغذية العامة، ويفتحه فقط للمشتركين المميزين أو اتصالات المستوى 4+.",
      creatorFeature4Title: "شاشة HUD للبث والمطابقة",
      creatorFeature4Desc: "لوحة بث مباشر تحتوي على شاشة HUD لمتابعة مستوى تآلف المشاهدين في الوقت الفعلي.",
      creatorFeature5Title: "ماسح DRM لحماية المحتوى",
      creatorFeature5Desc: "يتتبع التسريبات على شبكة الإنترنت ويرسل طلبات إزالة تلقائية لحماية محتواك.",
      creatorFeature6Title: "ماسح العقود الذكي NLP",
      creatorFeature6Desc: "يفحص عقود العلامات التجارية في ثوانٍ — ويكتشف الشروط المجحفة قبل التوقيع."
    }
  }
};

for (const lang of files) {
  const codeKey = lang.replace('.json', '');
  const filePath = path.join(localesDir, lang);
  let json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Add landing translations
  if (translations[codeKey]) {
    json.landing = translations[codeKey].landing;
  }

  // Convert all SECCION strings to SECCIØN with slashed Ø across all dictionary values
  function replaceBrandInObj(obj) {
    for (const k in obj) {
      if (typeof obj[k] === 'string') {
        obj[k] = obj[k].replace(/SECCION/g, 'SECCIØN');
      } else if (typeof obj[k] === 'object' && obj[k] !== null) {
        replaceBrandInObj(obj[k]);
      }
    }
  }

  replaceBrandInObj(json);

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8');
  console.log(`[UPDATED] ${lang} with landing i18n keys and SECCIØN branding.`);
}
