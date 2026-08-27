import type { Metadata } from "next";
import ClientPage from "./page-client";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Become a Creator — 90% Revenue Split & AI Studio | SECCION",
  description: "Join SECCION as a Founding Creator. Enjoy a 90% net revenue split, AI Operations Assistant, and global reach.",
  openGraph: {
    title: "Become a Creator — 90% Revenue Split & AI Studio | SECCION",
    description: "Join SECCION as a Founding Creator. Enjoy a 90% net revenue split, AI Operations Assistant, and global reach.",
  }
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, username, origins')
      .eq('id', user.id)
      .single();
    
    if (data) {
       profile = data;
    }
  }

  return <ClientPage initialProfile={profile} userEmail={user?.email} />;
}
