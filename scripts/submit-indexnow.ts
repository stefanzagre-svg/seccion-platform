import { submitToIndexNow } from './src/lib/indexnow';

const urls = [
  'https://seccion.ai/creator-hub/onlyfans-alternative',
  'https://seccion.ai/blog',
  'https://seccion.ai/blog/creator-platform-90-percent-payout-comparison-2026',
  'https://seccion.ai/blog/what-is-a-warm-paywall-creator-economy'
];

async function main() {
  console.log('Sending IndexNow payload for:', urls);
  try {
    const res = await submitToIndexNow(urls);
    console.log('IndexNow Response Status:', res.status);
    console.log('IndexNow Response Message:', res.message);
  } catch (err) {
    console.error('Error submitting to IndexNow:', err);
  }
}

main();
