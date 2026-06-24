"use client";

import React, { useRef } from 'react';

// Custom Hook for Mouse Tracking on Glass Cards
function useMouseTracking() {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return { cardRef, handleMouseMove };
}

// Reusable Glass Card Component
function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  const { cardRef, handleMouseMove } = useMouseTracking();
  
  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`bg-[rgba(255,255,255,0.05)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-xl relative ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}


export default function LandingPageHook({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="w-full min-h-screen text-[#e2e2e2] overflow-x-hidden font-['Hanken_Grotesk'] relative" 
         style={{ 
           backgroundColor: 'transparent',
           backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(255, 171, 243, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(0, 251, 251, 0.05), transparent 25%)'
         }}>
      
      {/* Animated laser lines specifically for the Landing Page Hook */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-10]">
        <svg
          className="absolute w-full h-full opacity-90"
          viewBox="0 0 1440 1024"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="g-laser-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="g-electric-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g>
            {/* Line 1 — Cyan Main */}
            <g style={{ animation: 'float-laser 10s ease-in-out infinite' }}>
              <path d="M 1100, 100 C 500,-100 300,400 800,500 C 1300,600 1100,1100 500,900" fill="none" stroke="#00fbfb" strokeWidth="3" filter="url(#g-laser-glow)" opacity="0.5" />
              <path d="M 1100, 100 C 500,-100 300,400 800,500 C 1300,600 1100,1100 500,900" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" filter="url(#g-electric-glow)" style={{ strokeDasharray: '250 3000', strokeDashoffset: 3250, animation: 'electric-pulse 3.5s linear infinite 0s' }} />
            </g>
            {/* Line 2 — Pink Inner */}
            <g style={{ animation: 'float-laser 12s ease-in-out infinite reverse' }}>
              <path d="M 1050, 150 C 450,-50 250,450 750,550 C 1250,650 1050,1150 450,950" fill="none" stroke="#ffabf3" strokeWidth="1.5" filter="url(#g-laser-glow)" opacity="0.6" />
              <path d="M 1050, 150 C 450,-50 250,450 750,550 C 1250,650 1050,1150 450,950" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" filter="url(#g-electric-glow)" style={{ strokeDasharray: '150 2500', strokeDashoffset: 2650, animation: 'electric-pulse 4.2s linear infinite 1.2s' }} />
            </g>
            {/* Line 3 — Deep Purple Outer */}
            <g style={{ animation: 'float-laser 15s ease-in-out infinite' }}>
              <path d="M 1150, 50 C 550,-150 350,350 850,450 C 1350,550 1150,1050 550,850" fill="none" stroke="#fe00fe" strokeWidth="2.5" filter="url(#g-laser-glow)" opacity="0.5" />
              <path d="M 1150, 50 C 550,-150 350,350 850,450 C 1350,550 1150,1050 550,850" fill="none" stroke="#ffabf3" strokeWidth="4" strokeLinecap="round" filter="url(#g-electric-glow)" style={{ strokeDasharray: '300 3500', strokeDashoffset: 3800, animation: 'electric-pulse 5.5s linear infinite 0.5s' }} />
            </g>
            {/* Line 4 — Cyan Bright Accent */}
            <g style={{ animation: 'float-laser 8s ease-in-out infinite reverse' }}>
              <path d="M 1000, 200 C 400,0 200,500 700,600 C 1200,700 1000,1200 400,1000" fill="none" stroke="#00fbfb" strokeWidth="1" filter="url(#g-laser-glow)" opacity="0.8" />
              <path d="M 1000, 200 C 400,0 200,500 700,600 C 1200,700 1000,1200 400,1000" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" filter="url(#g-electric-glow)" style={{ strokeDasharray: '100 2000', strokeDashoffset: 2100, animation: 'electric-pulse 2.8s linear infinite 2s' }} />
            </g>
            {/* Line 5 — Magenta Cross Thread */}
            <g style={{ animation: 'float-laser 18s ease-in-out infinite' }}>
              <path d="M 1120, 80 C 480,-80 320,420 820,520 C 1320,620 1120,1120 520,920" fill="none" stroke="#fe00fe" strokeWidth="2" filter="url(#g-laser-glow)" opacity="0.5" />
              <path d="M 1120, 80 C 480,-80 320,420 820,520 C 1320,620 1120,1120 520,920" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" filter="url(#g-electric-glow)" style={{ strokeDasharray: '200 4000', strokeDashoffset: 4200, animation: 'electric-pulse 6s linear infinite 3.5s' }} />
            </g>
          </g>
        </svg>
      </div>
      
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/10 flex justify-between items-center w-full px-6 md:px-[84px] py-4 mx-auto">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <img src="/images/seccion-logo-icon.png" alt="SECCION Icon" className="w-9 h-9 rounded-lg drop-shadow-[0_0_15px_rgba(0,251,251,0.5)] object-contain" />
          <img 
            src="/images/seccion-logo-text.png" 
            alt="SECCION" 
            className="h-8 object-contain" 
          />
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a className="text-[#ffabf3] border-b-2 border-[#ffabf3] pb-1 text-[14px] leading-none tracking-[0.05em] font-medium font-['JetBrains_Mono']" href="#">Predictive Matches</a>
          <a className="text-[#b9cac9] hover:text-[#00fbfb] transition-colors text-[14px] leading-none tracking-[0.05em] font-medium font-['JetBrains_Mono']" href="#">Now Streaming</a>
          <a className="text-[#b9cac9] hover:text-[#00fbfb] transition-colors text-[14px] leading-none tracking-[0.05em] font-medium font-['JetBrains_Mono']" href="#">Become Creator</a>
          <a className="text-[#b9cac9] hover:text-[#00fbfb] transition-colors text-[14px] leading-none tracking-[0.05em] font-medium font-['JetBrains_Mono']" href="#">How We Do</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[#b9cac9] hover:text-[#00fbfb] transition-colors text-[14px] leading-none tracking-[0.05em] font-medium font-['JetBrains_Mono'] hidden sm:block">Login</button>
          <button 
            onClick={onAccept}
            className="px-6 py-2 border-2 border-[#00fbfb] text-[#00fbfb] font-['JetBrains_Mono'] text-[14px] leading-none tracking-[0.05em] font-medium uppercase hover:bg-white/10 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,251,251,0.4),0_0_30px_rgba(0,251,251,0.2)]"
          >
            Sign Up
          </button>
        </div>
      </nav>


      {/* Background elements are now provided globally by AmbientBackground */}


      {/* Main Content Canvas */}
      <main className="relative pt-32 pb-40 px-6 md:px-[84px] max-w-[1440px] mx-auto min-h-screen">
        
        {/* Hero Text */}
        <div className="mb-12 max-w-2xl">
          <h1 className="font-['Plus_Jakarta_Sans'] text-[64px] font-bold leading-[1.1] tracking-[-0.02em] mb-4 text-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            <span className="text-[40px] sm:text-[80px] font-extrabold block mb-2 whitespace-nowrap">Fusion Platform</span>
            <span className="text-[36px] sm:text-[72px] font-bold text-[#00fbfb] leading-tight block whitespace-nowrap">Dating App - Live Streaming</span>
            <span className="text-[36px] sm:text-[72px] font-bold text-[#00fbfb] leading-tight block whitespace-nowrap">Content Creators</span>
          </h1>
          <p className="font-['Hanken_Grotesk'] text-[18px] leading-[1.6] text-[#b9cac9] max-w-md">
            Make New Friends - Develop Relationship Levels<br/>
            Suggest Interactions - AI Predictive Match - Stream Live Sponsor Creators - Control Your Privacy - Have Fun<br/>
          </p>
        </div>

        {/* Bento Composition */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Messaging */}
          <div className="col-span-12 lg:col-span-3 space-y-6 lg:px-4">
            <GlassCard className="p-6" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '-1s' }}>
              <div className="flex items-center gap-3 mb-6">
                <img alt="Portrait" className="w-12 h-12 rounded-full border border-[#00fbfb]/30 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeNVY6fGabRW3UYmaag0tgBvqY4aSleB1bJ7Y9Bd5fmelTdADnb8CSIyUjRi52y4HaipMnH-0B8mBcTH2zSYj5GJVuFXWqdnBfjPkJYL0kbgUdJJVnz0QxET5diHmF_NRfMYlXHEfeiCtA7NrZl6DA5sebOoy_HKQC1GFfvmGvl4skhKu9qXrkxR4Z_maw9elRwNE_wQBGiDgX6yvTed6vkLZ_KKvabfAVO5DAODES3kMzdneWcXPK6eZQ5p-sHEqSyuh9D49HIiE" />
                <div>
                  <p className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#e2e2e2]">Sofia_Olso23</p>
                  <p className="text-xs text-[#b9cac9]">Online</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-['JetBrains_Mono'] font-medium text-[#00fbfb]">CONNECTION LEVEL</span>
                  <span className="text-[10px] font-['JetBrains_Mono'] font-medium text-[#00fbfb]">85%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-['Plus_Jakarta_Sans'] text-[#b9cac9] opacity-70 uppercase tracking-widest whitespace-nowrap">Strangers</span>
                  <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00fbfb] shadow-[0_0_5px_#00fbfb,0_0_15px_rgba(0,251,251,0.4),0_0_30px_rgba(0,251,251,0.2)]" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-[9px] font-['Plus_Jakarta_Sans'] text-[#00fbfb] font-bold uppercase tracking-widest whitespace-nowrap">Soulmates</span>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="bg-white/10 p-3 rounded-lg rounded-tl-none max-w-[90%] backdrop-blur-xl">
                  <p className="text-xs text-white">Hey, ready for a Chat session ?</p>
                </div>
                <div className="bg-[#ffabf3]/20 border border-[#ffabf3]/40 p-3 rounded-lg rounded-tr-none ml-auto max-w-[90%] backdrop-blur-xl shadow-[0_0_10px_rgba(255,171,243,0.2)]">
                  <p className="text-xs text-[#ffabf3] font-bold">Absolutely! :)</p>
                </div>
              </div>
              <div className="relative">
                <input className="w-full bg-black/60 border border-[#00fbfb]/50 rounded-full px-6 py-3 text-xs focus:ring-1 focus:ring-[#00fbfb] focus:border-[#00fbfb] outline-none transition-all text-white placeholder-gray-400" placeholder="Typing...." type="text"/>
                <svg className="absolute right-4 top-3 text-[#00fbfb] w-4 h-4 cursor-pointer hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <img alt="Control Privacy" className="w-full h-24 object-cover rounded-lg mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAISe9sznxcBWs4TYSJzLblVX0zDnoWgpESF3BXITeojmb3hLjKf1t8Z9Cbq1JPE7k3Tv7zQ4l5uFbydEt3jenb1VDKmBooqcdPBYH8WnJEWeylVeQ3SfYtfUsvS-sG4Wf4PAZ3iZXH3gb9AmlBDZ_EYHr3a8rpdtMoiEyOdCK_IfuuU--KvN97BVdGVunbyE3sMmXFgYErjDEBPX11KuOXzner-damSuu9NWkxgebre6BrKHHM6xxTCfLkeZ-Gr4A-ljSf7A5YOGc" />
              <p className="font-['Plus_Jakarta_Sans'] text-lg mb-2 leading-tight">
                <span className="text-2xl font-bold block text-white">Who See What</span>
                <span className="text-[24px] font-bold text-[#ffabf3]">CONTROL YOUR PRIVACY</span>
              </p>
            </GlassCard>
          </div>

          {/* CENTER COLUMN: Discovery & CTA */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-['Plus_Jakarta_Sans'] text-[32px] font-medium leading-[1.3] text-white">Discover Potential Matches</h2>
                <svg className="w-6 h-6 text-[#ffabf3]" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>
              </div>
              <div className="grid grid-cols-2 gap-4">
                
                {/* Profile 1 */}
                <div className="relative group cursor-pointer">
                  <img alt="Match 1" className="w-full aspect-square object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvu278M7OGWZxCy0wrLDTGt67jaYwltrTJGKUICAUf4btbCGZ4otwg2zbSovFAZHxmuTTmjNyGQDtIRV5jpB6RvcCfYVe57GOrXfNYUCcU7Na56DZPZxqPXch6trbAR-3fqAFBDR-fsECthhrWsL-TDDCr_-KW0N4zGVHOT7oiKm3_myENTARnb3Cpc29UbWcRJJ-AwtA2Tqh5XY5AO3E6dAhXAjYs2HEX_HrMuE_Sz2uKoLHsFCYpAyiLt6mOUhnEH2KgLuqVGcc" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#00fbfb] rounded-full shadow-[0_0_5px_#00fbfb]"></div>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-white">ACTIVE</span>
                  </div>
                  <svg className="absolute top-2 right-2 w-5 h-5 text-[#ffabf3]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>

                {/* Profile 2 */}
                <div className="relative group cursor-pointer">
                  <img alt="Match 2" className="w-full aspect-square object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPcbNBtOCN1Y0m51yVBt1g0cIPxpwfkZlq235TrEngy3BCZlYZxRQVJeYVnMlM9uGt7tM4ta54zxyX2z-jhSFJjwUg6hsIAF5f4aG8F9cf7hBOSbet2nxxawr_8lFAUuurl3nBR956nA2Fi0_P2H9HSFUQj7SiwA-yanNrsY7zraNQumQ0XyzTP-VtgJ_22Nlva_sAbicbQDweLDLHjHTueWaEN1VvLeFl7amJUcW1X0dFBqfOB6tD8wxkY5yMdS-mo1WHgCG_mF4" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#ffabf3] rounded-full shadow-[0_0_5px_#ffabf3]"></div>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-white">OFFLINE</span>
                  </div>
                  <svg className="absolute top-2 right-2 w-5 h-5 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>

                {/* Profile 3 */}
                <div className="relative group cursor-pointer">
                  <img alt="Match 3" className="w-full aspect-square object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuv15gkTLbXNULjY9U2jK5UqyvrSNcJY9G7ZxtT9AeikI5yNSlLWZboF2HCzQC-JujiZ9gWT-aTgol-qnqctk_RxCuFQ177r6ApcPXKXC0WYh57XjQ3GYVU5BpsdfHooZaT2vdyqxTF3xKDmrg_aeUB9FWb_X8fDKxNf-n7oLDs806OXRq5G_FtEqo7He9mA4HpWM7eIBj_ol8K0CJLw1PvEL0YSfNJ_xZ_eGIUt7kQibXnsOLFG_KH1m17vNvhmaEjxffzPQ_RMo" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#00fbfb] rounded-full shadow-[0_0_5px_#00fbfb]"></div>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-white">LIVE</span>
                  </div>
                </div>

                {/* Profile 4 */}
                <div className="relative group cursor-pointer">
                  <img alt="Match 4" className="w-full aspect-square object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxdQ8agLhx3hLHTpd9LuIAfs9OJfY6Lg1oeRUeg7LfRia9W4_WsFGppzvG6ovgwFi8lH0Wr2I_2N8PbqU6dP6Z1ud29umft77scTs-kIMuQAQ8Foty-H0oMHMNG6eBiEiq0seaa_0gNxyTfexkcpqDbi2PiPCp-TkXj0Noo0ZSaCTPAIxoOD2_2eKdeyizHZRSg96cKQldPAebMcYhA9rfkV5tu2YsefoJ-vTPJV-njKjfxsSiLRiR6iu6iU5HKnP0hkXucKat8Kw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                </div>

              </div>
            </GlassCard>

            <div onClick={onAccept} className="bg-[rgba(255,255,255,0.05)] backdrop-blur-md border-2 border-[#00fbfb]/20 p-10 rounded-2xl shadow-[0_0_15px_rgba(0,251,251,0.4),0_0_30px_rgba(0,251,251,0.2)] text-center group cursor-pointer hover:scale-105 transition-transform">
              <h3 className="font-['Plus_Jakarta_Sans'] text-[32px] font-medium leading-[1.3] mb-2 text-shadow-[0_0_10px_rgba(255,255,255,0.5)] text-white">SWIPE TO SIGN UP SECCION</h3>
              <div className="flex justify-center items-center gap-4 mt-6">
                <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-[#00fbfb]"></div>
                <div className="w-10 h-10 rounded-full border-2 border-[#00fbfb] flex items-center justify-center animate-bounce">
                  <svg className="w-5 h-5 text-[#00fbfb]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/></svg>
                </div>
                <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-[#00fbfb]"></div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Video & Summary */}
          <div className="col-span-12 lg:col-span-4 space-y-6 items-start lg:pr-8">
            
            {/* LIVE CARD */}
            <GlassCard className="overflow-hidden" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '-2s' }}>
              <div className="aspect-video relative">
                <img alt="Live Stream" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoq_eB5TLUWB2m6TKzuRqMQ9VNKPn-Cqwqpl4pbQ3Scfm4DO-MqbHaVktAPW2ozKRLS3hQqhuetyCmCKiXKOYQNr3W6UIgJ7g1bRuT5CGhJNPKzkTPFV4US2WkODYCztsq5dNF5sb6l5frdx3F4qRUUtR8j--5hFfwAcWT88pWaSQZktmgTGSCdZ5YxoaYQQwxEhd2obY0BHpGAo-r47VyDnvN9rm25AtSSR8tOwd7REh93rn2loUShQVKpciTo4vP2Gx24Vk1RHM" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-[#ffb4ab] px-2 py-0.5 rounded text-[10px] font-bold text-[#690005] uppercase flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                    Live
                  </span>
                  <span className="bg-black/40 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg> 
                    23K
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <p className="text-sm font-bold text-white text-shadow-[0_0_10px_rgba(255,255,255,0.5)]">18M Followers</p>
                </div>
                <button className="absolute bottom-4 right-4 bg-white/10 backdrop-blur border border-white/30 px-4 py-2 rounded-lg text-xs font-bold text-white hover:bg-white/20 transition-all">Join her Session now!</button>
              </div>
            </GlassCard>

            {/* ORDER SUMMARY */}
            <GlassCard className="p-6 border-l-4 border-l-[#ffabf3]">
              <h3 className="font-['Plus_Jakarta_Sans'] text-[32px] font-medium leading-[1.3] text-lg mb-4 text-white">Your Content Order</h3>
              <p className="text-xs text-[#b9cac9] mb-6">Order confirmation</p>
              <div className="flex gap-2 mb-6">
                <img alt="Item" className="w-20 h-20 rounded-lg object-cover border border-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxiktmbSUFs0QMhiycGW4NLUgePY0l_y5nmquA0RkOebyE_q7avgnWmSvMpUOw4YuSR2aR4rkF1YHwU5Tr-V8JXBks7ngz9lB0qYekJtl4s-jXzZ-FOjG1VSWammO9yMvLTtqCrwHOvOqMnbKZBo3c3EJtr4TejxCHp8x1syS7JbyfzO47srckD_WU6E3xeSmNNvB1WeEeZA56ECI-7Dx2F_Gayd_Z9CZTWT0UGjoMqXhRD_ZQHdOZFz2j1dNk__8GYfBFOBRhDo8"/>
                <img alt="Item" className="w-20 h-20 rounded-lg object-cover border border-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXWQwM-5H8IK-MokgPEJPRd3MaLphhVzcpdgqB80OrIrQrYMzFbI-yR_HTPth_fDIJC0xfPGMEXKIaWQw8HIzgK3Tw2jWBDOBFBLyqWzXbQVczjRH4pIwjgCD1-U7tPkgzvtlcUy3eYn6kokQjC4o68mchpkWHJLKzWb6uFybN28I34SdNs14eSzG0wzaKFvBg9jL8HEoFKxudgjTHFNsC5e8DwW8g9HSxZt1NT5bocUzLkv8vdLbprE727LL5Bxrp1SRb7JFdX_0"/>
                <img alt="Item" className="w-20 h-20 rounded-lg object-cover border border-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLchdLA_vA3dDBmRuxBb86eFjfNn0o1Vb8swuYtFReHmvguzoabRjF8pau1vbF4RMyKfEyQS3OdaSvWLunhTbB_4RuD3oGNA3nuSSog-KxHf2zc0cqZrGwXZHKgSZNhRu4FnKFV-V2Mz7BggGSiqNNtE8McywXmC1DovTFsJJLGu4R9ERQqU55CJ1Vkd3vCSGqxewSSLT043NkLjoyVUt96KOzqKInO21CVdQjEuNx028oSiAVWkMGGshCr2d5gpMOeyQ5nq4CsRQ"/>
              </div>
              <div className="space-y-3 font-['JetBrains_Mono'] text-[14px] font-medium leading-[1.0] tracking-[0.05em] text-xs border-t border-white/10 pt-4 text-white">
                <div className="flex justify-between"><span className="text-[#b9cac9]">Subtotal</span><span>$18.00</span></div>
                <div className="flex justify-between"><span className="text-[#b9cac9]">Premium</span><span>$25.00</span></div>
                <div className="flex justify-between"><span className="text-[#b9cac9]">Shipping</span><span>$3.00</span></div>
                <div className="flex justify-between font-bold text-[#ffabf3] text-sm pt-2">
                  <span>Total</span><span className="text-shadow-[0_0_10px_rgba(255,255,255,0.5)]">$72.77</span>
                </div>
              </div>
            </GlassCard>

            {/* EXTRA QUOTE */}
            <GlassCard className="p-6 border border-[#ffabf3]/20">
              <p className="font-['Plus_Jakarta_Sans'] text-[32px] font-medium leading-[1.3] text-lg mb-2 text-white">&quot;Let &apos;s bring some Sense , Fun and Real interactions between you guys&quot;</p>
              <p className="text-xs text-[#b9cac9] opacity-60">SECCION Platform Mission Statment</p>
            </GlassCard>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0B0C10] border-t border-white/10 flex flex-col md:flex-row justify-between items-center w-full px-6 md:px-[84px] py-12 gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <img src="/images/seccion-logo-icon.png" alt="SECCION Icon" className="w-10 h-10 rounded-lg drop-shadow-[0_0_15px_rgba(0,251,251,0.5)] object-contain" />
            <img 
              src="/images/seccion-logo-text.png" 
              alt="SECCION" 
              className="h-9 object-contain" 
            />
          </div>
          <p className="font-['Hanken_Grotesk'] text-[16px] leading-[1.6] font-normal text-[#b9cac9] max-w-xs mt-2">Show up - Match - Connect </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <a className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-['JetBrains_Mono'] text-[14px] font-medium tracking-[0.05em]" href="#">Privacy Policy</a>
          <a className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-['JetBrains_Mono'] text-[14px] font-medium tracking-[0.05em]" href="#">Terms of Service</a>
          <a className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-['JetBrains_Mono'] text-[14px] font-medium tracking-[0.05em]" href="#">Creator Hub</a>
          <a className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-['JetBrains_Mono'] text-[14px] font-medium tracking-[0.05em]" href="#">Support</a>
        </div>
        <div className="text-center md:text-right">
          <p className="font-['JetBrains_Mono'] text-[14px] font-medium tracking-[0.05em] text-[#b9cac9] opacity-50">© 2026 SECCION. ALL RIGHTS RESERVED.</p>
          <div className="flex justify-center md:justify-end gap-4 mt-4">
            {/* Social Icons Placeholder */}
            <svg className="w-5 h-5 text-[#b9cac9] hover:text-[#00fbfb] cursor-pointer" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            <svg className="w-5 h-5 text-[#b9cac9] hover:text-[#00fbfb] cursor-pointer" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
            <svg className="w-5 h-5 text-[#b9cac9] hover:text-[#00fbfb] cursor-pointer" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
        </div>
      </footer>
    </div>
  );
}
