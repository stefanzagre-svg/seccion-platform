import Navbar from '@/components/Navbar';
import EventCard from '@/components/pulse/EventCard';
import LivePulseBanner from '@/components/pulse/LivePulseBanner';

export const metadata = {
  title: 'SECCION | Live Pulse',
  description: 'Real-time events, live streams, and exclusive drops.',
};

// Simulated Event Data
const MOCK_EVENTS = [
  {
    id: 'ev_1',
    type: 'live' as const,
    title: 'Late Night Studio Session & Q&A',
    creatorName: 'dj.flow',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800',
    targetDate: new Date().toISOString(),
    viewerCount: 1420,
  },
  {
    id: 'ev_2',
    type: 'upcoming' as const,
    title: 'Cyberpunk Photowalk: Behind the Scenes',
    creatorName: 'akira.vision',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554629947-334ff61d85dc?auto=format&fit=crop&q=80&w=800',
    // Sets target date to 2 hours from now for the countdown
    targetDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), 
  },
  {
    id: 'ev_3',
    type: 'drop' as const,
    title: 'Exclusive Preset Pack Drop (Limited 100)',
    creatorName: 'akira.vision',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620325867502-221ddb5faa5f?auto=format&fit=crop&q=80&w=800',
    // Sets target date to 24 hours from now
    targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), 
  }
];

export default function LivePulsePage() {
  const liveEvents = MOCK_EVENTS.filter(e => e.type === 'live');
  const upcomingEvents = MOCK_EVENTS.filter(e => e.type !== 'live');

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Global Banner Demonstration (Normally triggered by real-time events) */}
      <LivePulseBanner 
        creatorName="dj.flow"
        creatorAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
        eventId="ev_1"
        title="Late Night Studio Session & Q&A"
      />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-24">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white font-['JetBrains_Mono'] tracking-tighter mb-4 uppercase">
            Live <span className="text-primary">Pulse</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            The heartbeat of SECCION. Discover real-time streams, upcoming events, and exclusive content drops before they vanish.
          </p>
        </div>

        {/* Live Now Section */}
        {liveEvents.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">Live Now</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveEvents.map(event => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </section>
        )}

        {/* Dropping Soon / Upcoming Section */}
        <section>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-6">Dropping Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
