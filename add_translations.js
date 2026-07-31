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
  "buildIdentity": "Build Your Identity",
  "setupProfile": "Set up your vibe profile.",
  "profileSetup": "Profile Setup",
  "done": "{progress}% Done",
  "tabPhoto": "1. Photo",
  "tabBio": "2. Bio",
  "tabMatch": "3. Match",
  "selectPhoto": "Select Profile Photo",
  "uploadOption1": "Option 1: Upload from Computer or Phone Folder",
  "uploadingFile": "Uploading Image File...",
  "chooseFile": "Choose File from Computer / Folder",
  "option2": "Option 2: Use Built-in Mock Avatars (Testing)",
  "livenessCheck": "Liveness Verification Required",
  "livenessDesc": "To keep SECCION 100% human and catfish-free, verify you match your photo via a quick 3-sec camera scan.",
  "livenessLock": "No ID documents stored. Face data is deleted immediately.",
  "startCheck": "Start Verification Check",
  "connectingCamera": "Connecting Camera...",
  "nextStep": "Next: Bio Prompts",
  "bioPrompts": "Relational Bio Prompts",
  "bioDesc": "Help our AI Synergy Engine understand your vibe. Answer 2 prompts below.",
  "promptStep": "Prompt {step} of 2",
  "selectCategory": "Select a vibe category",
  "selectPrompt": "Select a prompt question",
  "answerPlaceholder": "Write your honest answer here (min 10 chars)...",
  "saving": "Saving & Analyzing Vibe...",
  "saveNext": "Save & Next",
  "matchPreferences": "Match & Synergy Preferences",
  "matchDesc": "Set your baseline filters so the AI Wingman knows exactly who to put on your radar.",
  "languageTitle": "Vibe Languages",
  "languageDesc": "What languages do you speak? (Our S2S translator covers the rest)",
  "sexPrefTitle": "Sexual Preference",
  "relGoalTitle": "Relationship Goal",
  "relTypeTitle": "Relationship Type",
  "finalize": "Finalize Profile"
};

const esNew = {
  "buildIdentity": "Forja tu Identidad",
  "setupProfile": "Configura tu perfil de radar.",
  "profileSetup": "Configuración de Perfil",
  "done": "{progress}% Completado",
  "tabPhoto": "1. Foto",
  "tabBio": "2. Bio",
  "tabMatch": "3. Match",
  "selectPhoto": "Selecciona tu Foto",
  "uploadOption1": "Opción 1: Subir desde PC o Galería",
  "uploadingFile": "Subiendo Imagen...",
  "chooseFile": "Elegir archivo local",
  "option2": "Opción 2: Usar Avatares de Prueba",
  "livenessCheck": "Verificación de Biometría",
  "livenessDesc": "Para mantener SECCION libre de perfiles falsos, verifica que eres tú con un escaneo rápido de 3 segundos.",
  "livenessLock": "No guardamos tu DNI. Los datos faciales se eliminan al instante.",
  "startCheck": "Iniciar Verificación",
  "connectingCamera": "Conectando Cámara...",
  "nextStep": "Siguiente: Prompts de Bio",
  "bioPrompts": "Prompts Relacionales",
  "bioDesc": "Ayuda a nuestro Motor de Sinergia a leer tu vibra. Responde 2 preguntas.",
  "promptStep": "Prompt {step} de 2",
  "selectCategory": "Elige una categoría",
  "selectPrompt": "Elige una pregunta",
  "answerPlaceholder": "Escribe tu respuesta sincera (mín 10 caracteres)...",
  "saving": "Guardando y Analizando Vibra...",
  "saveNext": "Guardar y Siguiente",
  "matchPreferences": "Preferencias de Sinergia",
  "matchDesc": "Ajusta tus filtros para que el Wingman sepa exactamente a quién poner en tu radar.",
  "languageTitle": "Idiomas de Vibra",
  "languageDesc": "¿Qué idiomas hablas? (Nuestro traductor S2S cubre el resto)",
  "sexPrefTitle": "Preferencia Sexual",
  "relGoalTitle": "Objetivo de Relación",
  "relTypeTitle": "Tipo de Relación",
  "finalize": "Finalizar Perfil"
};

updateLocales('onboarding', 'main', enNew, esNew);
