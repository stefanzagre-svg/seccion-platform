import Navbar from '@/components/Navbar';
import MessagesInboxClient from '@/components/messaging/MessagesInboxClient';

export const metadata = {
  title: 'SECCION | Messages',
  description: 'Connect directly with your favorite creators.',
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
