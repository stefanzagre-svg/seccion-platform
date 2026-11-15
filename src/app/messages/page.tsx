import Navbar from '@/components/Navbar';
import MessagesInboxClient from '@/components/messaging/MessagesInboxClient';

export const metadata = {
  title: 'Direct Messages — Private Creator & Member Inbox',
  description: 'Signed-in encrypted messaging inbox for direct one-on-one conversations, Warm Paywall progression, and creator requests on SECCION.',
  robots: { index: false, follow: false },
};

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pt-24 h-screen max-h-screen flex gap-6">
        <MessagesInboxClient />
      </main>
    </div>
  );
}
