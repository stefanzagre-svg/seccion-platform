import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }
    const { email, city } = body || {};
    const effectiveCity =
      typeof city === "string" && city.trim().length > 0
        ? city.trim()
        : req.headers.get("cf-ipcountry") || "Global";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check for duplicate
    const { data: existing } = await supabaseAdmin
      .from("member_waitlist")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You're already on the waitlist!", alreadyJoined: true },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("member_waitlist")
      .insert({
        email: email.toLowerCase().trim(),
        city: effectiveCity,
        founding_member: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Waitlist insert error:", error);
      return NextResponse.json(
        { error: "Failed to join waitlist. Please try again." },
        { status: 500 }
      );
    }

    // Count total waitlist members for social proof
    const { count } = await supabaseAdmin
      .from("member_waitlist")
      .select("id", { count: "exact", head: true });

    // Trigger instant Telegram alert to founder
    const msg = `🎉 <b>NEW MEMBER WAITLIST SIGNUP!</b>\n\n` +
      `📧 <b>Email:</b> ${email.toLowerCase().trim()}\n` +
      `📍 <b>City:</b> ${effectiveCity}\n` +
      `🔢 <b>Waitlist Position:</b> #${count || 1}`;
    
    sendTelegramNotification(msg).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        message: "You're on the list!",
        position: count || 1,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Waitlist join error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
