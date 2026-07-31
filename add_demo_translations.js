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
  "day_in_life_badge": "Part 2: SECCION Day-In-The-Life",
  "day_in_life_title": "Experience a Day on SECCION",
  "synergy_badge": "Synergy Engine Analysis",
  "synergy_title": "Predictive Matchmaking",
  "revenue_badge": "Payout Math Comparison",
  "revenue_title": "Revenue Share Model",
  "stream_badge": "Studio Streaming Cockpit",
  "stream_title": "Stream Station & Privacy"
};

const esNew = {
  "day_in_life_badge": "Parte 2: Un Día en SECCION",
  "day_in_life_title": "Experimenta un Día en SECCION",
  "synergy_badge": "Análisis del Motor de Sinergia",
  "synergy_title": "Emparejamiento Predictivo",
  "revenue_badge": "Comparación de Matemáticas de Pago",
  "revenue_title": "Modelo de Reparto de Ingresos",
  "stream_badge": "Cabina de Streaming de Estudio",
  "stream_title": "Stream Station y Privacidad"
};

updateLocales('demos', 'main', enNew, esNew);
