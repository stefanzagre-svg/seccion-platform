import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { sendTelegramNotification } from "@/lib/telegram";
import { z } from "zod";

const creatorApplySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address format"),
  phone: z.string().min(5, "Phone number too short").max(30),
  telegram: z.string().min(2, "Telegram handle required").max(50),
  link1: z.string().url("link1 must be a valid URL"),
  link2: z.string().url("link2 must be a valid URL").optional().or(z.literal("")),
  link3: z.string().url("link3 must be a valid URL").optional().or(z.literal("")),
  city: z.string().max(100).optional(),
  claimOffer: z.boolean().optional(),
});

const supabaseAdmin = createAdminClient();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    const parsed = creatorApplySchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid application payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { fullName, email, phone, telegram, link1, link2, link3, city, claimOffer } = parsed.data;

    // Check for duplicate email
    const { data: existing } = await supabaseAdmin
      .from("creator_applications")
      .select("id, status")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json(
        {
          error: "An application with this email already exists",
          status: existing.status,
        },
        { status: 409 }
      );
    }

    // Insert the application
    const { data, error } = await supabaseAdmin
      .from("creator_applications")
      .insert({
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        telegram: telegram.trim(),
        link1: link1.trim(),
        link2: link2?.trim() || null,
        link3: link3?.trim() || null,
        city: city?.trim() || null,
        claim_offer: claimOffer ?? true,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to submit application. Please try again." },
        { status: 500 }
      );
    }

    // Trigger instant Telegram alert to founder
    const msg = `🚨 <b>NEW CREATOR APPLICATION!</b>\n\n` +
      `👤 <b>Name:</b> ${fullName.trim()}\n` +
      `📧 <b>Email:</b> ${email.trim()}\n` +
      `📱 <b>Phone:</b> ${phone.trim()}\n` +
      `✈️ <b>Telegram:</b> ${telegram.trim()}\n` +
      `📍 <b>City:</b> ${city || "Not specified"}\n` +
      `🔗 <b>Link:</b> ${link1.trim()}\n` +
      `🎁 <b>Founding Offer:</b> ${claimOffer ? "YES (10% Rate)" : "NO"}`;
    
    sendTelegramNotification(msg).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        applicationId: data.id,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Creator apply error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
