import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SupportedLocale } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import ClientPage from "./page-client";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const savedLocale = (cookieStore.get("seccion_user_locale")?.value || "en") as SupportedLocale;
  const dict = savedLocale === "es" ? es : en;

  return {
    title: dict.seo.becomeCreator.title,
    description: dict.seo.becomeCreator.desc,
    openGraph: {
      title: dict.seo.becomeCreator.title,
      description: dict.seo.becomeCreator.desc,
    }
  };
}

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
