import { supabase } from './supabase';

/**
 * Awards XP to a user and handles threshold-based Boost Pass distribution.
 * Every 1000 XP earns a Boost Pass.
 */
export async function awardXp(userId: string, amount: number): Promise<{ currentXp: number; passesEarned: number }> {
  try {
    // 1. Fetch current XP profile
    const { data: xpProfile, error: fetchError } = await supabase
      .from('user_xp_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    let oldXp = 0;
    let oldPasses = 0;
    let exists = false;

    if (!fetchError && xpProfile) {
      oldXp = xpProfile.current_xp;
      oldPasses = xpProfile.boost_passes_available;
      exists = true;
    }

    const newXp = oldXp + amount;
    
    // Check threshold crossings: every 1000 XP earns 1 pass
    const oldThresholdCrossings = Math.floor(oldXp / 1000);
    const newThresholdCrossings = Math.floor(newXp / 1000);
    const passesEarned = Math.max(0, newThresholdCrossings - oldThresholdCrossings);
    
    const newPasses = oldPasses + passesEarned;

    if (exists) {
      const { error: updateError } = await supabase
        .from('user_xp_profiles')
        .update({
          current_xp: newXp,
          boost_passes_available: newPasses,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('user_xp_profiles')
        .insert({
          user_id: userId,
          current_xp: newXp,
          boost_passes_available: newPasses
        });
      if (insertError) throw insertError;
    }

    return {
      currentXp: newXp,
      passesEarned
    };
  } catch (err) {
    console.error('Failed to award XP:', err);
    return { currentXp: 0, passesEarned: 0 };
  }
}
