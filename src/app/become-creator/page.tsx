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
  let profile = null;
  let userEmail: string | undefined = undefined;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    userEmail = user?.email;

    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, username, origins')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        profile = profileData;
      }
    }
  } catch (err) {
    console.warn('[Become Creator Page] Server pre-fetch skipped safely:', err);
  }

  return <ClientPage initialProfile={profile} userEmail={userEmail} />;
}
