import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { sendTelegramNotification } from "@/lib/telegram";
import { z } from "zod";

// Helper to normalize any handle or URL to a valid web link
const normalizeLink = (val: unknown) => {
  if (typeof val !== "string") return "";
  const trimmed = val.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("@")) return `https://instagram.com/${trimmed.slice(1)}`;
  if (trimmed.includes(".com") || trimmed.includes(".me") || trimmed.includes(".tv") || trimmed.includes(".fans") || trimmed.includes(".ai") || trimmed.includes(".")) return `https://${trimmed}`;
  return `https://instagram.com/${trimmed}`;
};

const creatorApplySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address format"),
  phone: z.string().max(30).optional().nullable().or(z.literal("")),
  telegram: z.string().max(50).optional().nullable().or(z.literal("")),
  link1: z.string().min(1, "Primary handle or link is required").transform(normalizeLink),
  link2: z.string().optional().nullable().transform(val => val ? normalizeLink(val) : ""),
  link3: z.string().optional().nullable().transform(val => val ? normalizeLink(val) : ""),
  city: z.string().max(100).optional().nullable(),
  claimOffer: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();
    const rawBody = await req.json().catch(() => null);
    const parsed = creatorApplySchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid application payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { fullName, email, phone, telegram, link1, link2, link3, city, claimOffer } = parsed.data;

    const source = typeof (rawBody as any)?.source === "string" ? (rawBody as any).source.slice(0, 120) : "direct";
    const stage = (rawBody as any)?.stage === "details" ? "details" : "lead";

    // Check for duplicate email
    const { data: existing } = await supabaseAdmin
      .from("creator_applications")
      .select("id, status")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      // Step 2 of the quick-apply flow: enrich the partial lead with optional details
      if (stage === "details") {
        const patch: Record<string, string> = {};
        if (phone?.trim()) patch.phone = phone.trim();
        if (telegram?.trim()) patch.telegram = telegram.trim();
        if (city?.trim()) patch.city = city.trim();
        if (fullName?.trim()) patch.full_name = fullName.trim();
        if (Object.keys(patch).length) {
          await supabaseAdmin.from("creator_applications").update(patch).eq("id", existing.id);
          sendTelegramNotification(
            `➕ <b>LEAD DETAILS ADDED</b>\n📧 ${email.trim()}\n📱 ${patch.phone || "-"}\n✈️ ${patch.telegram || "-"}\n📍 ${patch.city || "-"}`
          ).catch(() => {});
        }
        return NextResponse.json({ success: true, updated: true, applicationId: existing.id }, { status: 200 });
      }
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
        phone: phone?.trim() || null,
        telegram: telegram?.trim() || null,
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
      `📱 <b>Phone:</b> ${phone?.trim() || "-"}\n` +
      `✈️ <b>Telegram:</b> ${telegram?.trim() || "-"}\n` +
      `📍 <b>City:</b> ${city || "Not specified"}\n` +
      `🔗 <b>Link:</b> ${link1.trim()}\n` +
      `📣 <b>Source:</b> ${source}\n` +
      `🎁 <b>Founding Offer:</b> ${claimOffer ? "YES (pending approval for 90% year-1 rate)" : "NO"}`;
    
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
