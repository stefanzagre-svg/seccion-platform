import Navbar from '@/components/Navbar';
import ChatWindow from '@/components/messaging/ChatWindow';

// Simulated Conversations List
const MOCK_CONVERSATIONS = [
  {
    id: 'conv_1',
    creatorName: 'akira.vision',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    lastMessage: 'That means a lot to me! Anything specific...',
    time: '2m ago',
    unread: 1,
    isOnline: true,
  },
  {
    id: 'conv_2',
    creatorName: 'dj.flow',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    lastMessage: 'Thanks for the tip! 🙏',
    time: '1h ago',
    unread: 0,
    isOnline: false,
  },
  {
    id: 'conv_3',
    creatorName: 'zen.master',
    creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    lastMessage: 'Next stream is tomorrow at 8PM',
    time: 'Yesterday',
    unread: 0,
    isOnline: false,
  },
];

export const metadata = {
  title: 'SECCION | Messages',
  description: 'Connect directly with your favorite creators.',
};

export default function MessagesPage() {
  const activeConversation = MOCK_CONVERSATIONS[0];
  const currentUserId = 'u1'; // Mock user

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pt-24 h-screen max-h-screen flex gap-6">
        
        {/* Left Sidebar: Conversations List */}
        <div className="w-full md:w-96 flex flex-col bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shrink-0 hidden md:flex">
          <div className="p-6 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <h1 className="text-2xl font-black text-white font-['JetBrains_Mono'] tracking-tighter">
              INBOX
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
            {MOCK_CONVERSATIONS.map((conv) => (
              <button 
                key={conv.id}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition text-left group ${
                  conv.id === activeConversation.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-transparent border border-transparent hover:bg-white/5'
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full overflow-hidden border ${conv.id === activeConversation.id ? 'border-primary' : 'border-white/10'}`}>
                    <img src={conv.creatorAvatar} alt={conv.creatorName} className="w-full h-full object-cover" />
                  </div>
                  {conv.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-black" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-bold truncate ${conv.id === activeConversation.id ? 'text-primary' : 'text-white'}`}>
                      {conv.creatorName}
                    </h3>
                    <span className="text-[10px] text-white/40 font-bold uppercase shrink-0 ml-2">
                      {conv.time}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${conv.unread > 0 ? 'text-white font-bold' : 'text-white/50'}`}>
                    {conv.lastMessage}
                  </p>
                </div>

                {conv.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-black">{conv.unread}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Area: Active Chat Window */}
        <div className="flex-1 h-full min-w-0 relative pb-20 md:pb-0">
          <ChatWindow 
            conversationId={activeConversation.id}
            creatorName={activeConversation.creatorName}
            creatorAvatar={activeConversation.creatorAvatar}
            currentUserId={currentUserId}
          />
        </div>

      </main>
    </div>
  );
}
