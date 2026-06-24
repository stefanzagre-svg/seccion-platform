'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Crown, Heart, Star, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

// Mock data fallback if Supabase is not fully connected yet
const MOCK_MEMBERS = [
  { member_id: '1', username: 'AlexTheWhale', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', pulse_engagement: 98, match_depth: 8, support_tier: 'Diamond' },
  { member_id: '2', username: 'CryptoKing', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80', pulse_engagement: 85, match_depth: 6, support_tier: 'Platinum' },
  { member_id: '3', username: 'SarahV', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80', pulse_engagement: 92, match_depth: 7, support_tier: 'Platinum' },
  { member_id: '4', username: 'MysticFalcon', avatar_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=800&q=80', pulse_engagement: 70, match_depth: 4, support_tier: 'Gold' },
  { member_id: '5', username: 'NeonDreamer', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', pulse_engagement: 65, match_depth: 5, support_tier: 'Silver' },
];

const MOCK_CREATORS = [
  { creator_id: 'c1', username: 'ValentinaV', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', rating_score: 19.8, volume_tier: 'Diamond', sales_quantity: 1250 },
  { creator_id: 'c2', username: 'ElenaStark', avatar_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=800&q=80', rating_score: 18.5, volume_tier: 'Platinum', sales_quantity: 890 },
  { creator_id: 'c3', username: 'SofiaLore', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80', rating_score: 17.2, volume_tier: 'Gold', sales_quantity: 450 },
];

export default function TopProfilePage() {
  const [activeTab, setActiveTab] = useState<'members' | 'creators'>('members');
  const [members, setMembers] = useState<any[]>(MOCK_MEMBERS);
  const [creators, setCreators] = useState<any[]>(MOCK_CREATORS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTopProfiles() {
      setIsLoading(true);
      try {
        // Fetch Members
        const { data: memberData } = await supabase.rpc('get_best_members', { limit_count: 10 });
        if (memberData && memberData.length > 0) {
          // Map exact financial amount to a hidden tier representation for UI
          const mappedMembers = memberData.map((m: any) => ({
            ...m,
            support_tier: m.total_spent > 10000 ? 'Diamond' : m.total_spent > 5000 ? 'Platinum' : m.total_spent > 1000 ? 'Gold' : 'Silver'
          }));
          setMembers(mappedMembers);
        }

        // Fetch Creators
        const { data: creatorData } = await supabase.rpc('get_best_creators', { limit_count: 10 });
        if (creatorData && creatorData.length > 0) {
          // Map exact financial amount to a hidden tier representation for UI
          const mappedCreators = creatorData.map((c: any) => ({
            ...c,
            volume_tier: c.total_sales_amount > 50000 ? 'Diamond' : c.total_sales_amount > 20000 ? 'Platinum' : c.total_sales_amount > 5000 ? 'Gold' : 'Silver',
            rating_score: c.rating_score || 10.00
          }));
          setCreators(mappedCreators);
        }
      } catch (error) {
        console.error('Error fetching top profiles:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white pt-20 px-4 md:px-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ffd700]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-[#ffd700]/10 rounded-full mb-4 border border-[#ffd700]/30">
            <Crown className="w-12 h-12 text-[#ffd700]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-glow mb-4 tracking-tighter">TOP PROFILE</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-xs uppercase font-bold tracking-widest opacity-60">
            {activeTab === 'members' 
              ? 'Rank is calculated dynamically based on Support Volume, Pulse Engagement, and Match-Depth Levels.'
              : 'Rank is calculated dynamically based on Volume Tier, Subscription Velocity, and Community Rating.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-1 flex">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'members' ? 'bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700]/30 shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              Top Members
            </button>
            <button
              onClick={() => setActiveTab('creators')}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'creators' ? 'bg-[#ffabf3]/20 text-[#ffabf3] border border-[#ffabf3]/30 shadow-[0_0_15px_rgba(255,171,243,0.2)]' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              Top Creators
            </button>
          </div>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden min-h-[400px]">
          {isLoading ? (
            <div className="w-full h-[400px] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === 'members' ? (
            <>
              {/* MEMBERS LIST HEADER */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-[10px] sm:text-xs font-bold tracking-wider text-muted-foreground uppercase">
                <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                <div className="col-span-6 md:col-span-5">Member</div>
                <div className="col-span-4 md:col-span-3 text-right">Support Level</div>
                <div className="hidden md:block md:col-span-2 text-right">Engagement</div>
                <div className="hidden md:block md:col-span-1 text-right">Match</div>
              </div>

              {/* MEMBERS LIST */}
              <div className="divide-y divide-white/5">
                {members.map((member: any, index) => {
                  const isTop3 = index < 3;
                  return (
                    <div 
                      key={member.member_id} 
                      className={`grid grid-cols-12 gap-4 p-4 items-center transition hover:bg-white/5 ${isTop3 ? 'bg-white/[0.02]' : ''}`}
                    >
                      <div className="col-span-2 md:col-span-1 text-center">
                        <span className={`text-xl sm:text-2xl font-black ${
                          index === 0 ? 'text-[#ffd700]' : 
                          index === 1 ? 'text-[#c0c0c0]' : 
                          index === 2 ? 'text-[#cd7f32]' : 'text-white/50'
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                      
                      <div className="col-span-6 md:col-span-5 flex items-center gap-3 sm:gap-4">
                        <div className="relative shrink-0">
                          <img 
                            src={member.avatar_url} 
                            alt={member.username} 
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 ${isTop3 ? 'border-[#ffd700]' : 'border-white/10'}`}
                          />
                          {isTop3 && (
                            <div className="absolute -top-2 -right-2 bg-[#ffd700] p-1 rounded-full text-black">
                              <Crown className="w-2 h-2 sm:w-3 sm:h-3" />
                            </div>
                          )}
                        </div>
                        <Link href={`/profile/member/${member.member_id}`} className="font-bold text-sm sm:text-lg hover:text-primary transition tracking-tight truncate">
                          @{member.username}
                        </Link>
                      </div>

                      <div className="col-span-4 md:col-span-3 text-right flex flex-col justify-center items-end">
                        <div className={`flex items-center gap-1 font-black text-xs sm:text-sm ${
                          member.support_tier === 'Diamond' ? 'text-[#00ffff] drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]' :
                          member.support_tier === 'Platinum' ? 'text-[#e5e4e2]' :
                          member.support_tier === 'Gold' ? 'text-[#ffd700]' : 'text-white/70'
                        }`}>
                          {member.support_tier}
                        </div>
                        <span className="text-[8px] sm:text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-40">Tier</span>
                      </div>

                      <div className="hidden md:flex md:col-span-2 text-right flex-col justify-center items-end">
                        <div className="flex items-center gap-1 text-accent font-black">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {member.pulse_engagement}%
                        </div>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-40">Pulse</span>
                      </div>

                      <div className="hidden md:flex md:col-span-1 text-right flex-col justify-center items-end">
                        <div className="flex items-center gap-1 text-[#ffff00] font-black">
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          LVL {member.match_depth}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* CREATORS LIST HEADER */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-[10px] sm:text-xs font-bold tracking-wider text-muted-foreground uppercase">
                <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                <div className="col-span-6 md:col-span-5">Creator</div>
                <div className="col-span-4 md:col-span-3 text-right">Volume Tier</div>
                <div className="hidden md:block md:col-span-2 text-right">Subscribers</div>
                <div className="hidden md:block md:col-span-1 text-right">Rating</div>
              </div>

              {/* CREATORS LIST */}
              <div className="divide-y divide-white/5">
                {creators.map((creator: any, index) => {
                  const isTop3 = index < 3;
                  return (
                    <div 
                      key={creator.creator_id} 
                      className={`grid grid-cols-12 gap-4 p-4 items-center transition hover:bg-white/5 ${isTop3 ? 'bg-white/[0.02]' : ''}`}
                    >
                      <div className="col-span-2 md:col-span-1 text-center">
                        <span className={`text-xl sm:text-2xl font-black ${
                          index === 0 ? 'text-[#ffabf3]' : 
                          index === 1 ? 'text-[#e5e4e2]' : 
                          index === 2 ? 'text-[#cd7f32]' : 'text-white/50'
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                      
                      <div className="col-span-6 md:col-span-5 flex items-center gap-3 sm:gap-4">
                        <div className="relative shrink-0">
                          <img 
                            src={creator.avatar_url} 
                            alt={creator.username} 
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 ${isTop3 ? 'border-[#ffabf3]' : 'border-white/10'}`}
                          />
                          {isTop3 && (
                            <div className="absolute -top-2 -right-2 bg-[#ffabf3] p-1 rounded-full text-black">
                              <Star className="w-2 h-2 sm:w-3 sm:h-3 fill-black" />
                            </div>
                          )}
                        </div>
                        <Link href={`/profile/creator/${creator.creator_id}`} className="font-bold text-sm sm:text-lg hover:text-[#ffabf3] transition tracking-tight truncate">
                          @{creator.username}
                        </Link>
                      </div>

                      <div className="col-span-4 md:col-span-3 text-right flex flex-col justify-center items-end">
                        <div className={`flex items-center gap-1 font-black text-xs sm:text-sm ${
                          creator.volume_tier === 'Diamond' ? 'text-[#00ffff] drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]' :
                          creator.volume_tier === 'Platinum' ? 'text-[#e5e4e2]' :
                          creator.volume_tier === 'Gold' ? 'text-[#ffd700]' : 'text-white/70'
                        }`}>
                          {creator.volume_tier}
                        </div>
                        <span className="text-[8px] sm:text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-40">Volume</span>
                      </div>

                      <div className="hidden md:flex md:col-span-2 text-right flex-col justify-center items-end">
                        <div className="flex items-center gap-1 text-[#00ffff] font-black">
                          <Users className="w-3.5 h-3.5" />
                          {creator.sales_quantity?.toLocaleString() || 0}
                        </div>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-40">Qty</span>
                      </div>

                      <div className="hidden md:flex md:col-span-1 text-right flex-col justify-center items-end">
                        <div className="flex items-center gap-1 text-[#ffabf3] font-black">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {Number(creator.rating_score).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
