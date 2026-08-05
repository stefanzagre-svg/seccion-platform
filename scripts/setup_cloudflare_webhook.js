require('dotenv').config({ path: '.env.local' });

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
// We use a placeholder URL for now. 
// When you deploy to production, change this to your actual domain.
const webhookUrl = 'https://example.com/api/v2/cloudflare/webhook';

async function setupWebhook() {
  if (!accountId || !token) {
    console.error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN in .env.local");
    return;
  }

  console.log("Attempting to generate Webhook Secret via Cloudflare API...");

  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/webhook`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notificationUrl: webhookUrl })
    });
    
    const data = await res.json();
    
    if (data.success) {
      console.log("\n✅ SUCCESS! Your Webhook Secret is:");
      console.log("--------------------------------------------------");
      console.log(data.result.secret);
      console.log("--------------------------------------------------");
      console.log("Copy the secret above and paste it into .env.local as CLOUDFLARE_WEBHOOK_SECRET");
    } else {
      console.error("\n❌ FAILED to generate Webhook:");
      console.error(JSON.stringify(data.errors, null, 2));
      
      if (data.errors[0]?.code === 10000) {
        console.log("\n💡 NOTE: This 'Authentication error' means your current API Token is invalid or doesn't have Stream permissions.");
      }
    }
  } catch (error) {
    console.error(error);
  }
}

setupWebhook();
