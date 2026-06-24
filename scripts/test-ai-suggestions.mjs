// Using native global fetch available in modern Node.js

async function runTest() {
  console.log('🧪 Starting AI Prediction Panel E2E Pipeline Test (BE-TST-001)');
  
  const payload = {
    user_id: 'val-001',
    context_data: {
      current_feed_view: 'all',
      last_5_interactions: ['liked_ele-002', 'viewed_sof-003'],
      quest_stage: 2,
      connection_points: 15
    }
  };

  const startTime = Date.now();
  
  try {
    const res = await fetch('http://localhost:3000/api/v2/suggestions/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    const duration = Date.now() - startTime;
    
    if (res.ok) {
      console.log('✅ Success! Pipeline returned predictions in', duration, 'ms');
      console.log('📦 Model Version:', data.model_version);
      console.log('✨ Predictions Count:', data.suggestions?.length || 0);
      
      if (data.suggestions && data.suggestions.length > 0) {
        console.log('\nTop Suggestion:');
        const top = data.suggestions[0];
        console.log(`- Username: ${top.username}`);
        console.log(`- Score: ${top.score}`);
        console.log(`- Category: ${top.category}`);
        console.log(`- Narrative Insight: ${top.narrative_insight}`);
        console.log(`- Suggested Action: ${top.suggested_action_id}`);
      }
    } else {
      console.error('❌ Failed! HTTP Status:', res.status, data);
    }
  } catch (error) {
    console.error('❌ Error hitting the endpoint:', error);
  }
}

runTest();
