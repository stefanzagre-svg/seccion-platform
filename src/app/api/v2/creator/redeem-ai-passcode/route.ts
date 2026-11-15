import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { buildFoundingYear1Timestamps } from "@/lib/vip-invites";

// Pre-approved 1-Year Free AI Assistant Passcodes (approved creators only)
const VALID_PASSCODES = [
  "VIP2026-AI-FREE",
  "SECCION-AI-1YEAR",
  "CREATOR-90-BONUS",
  "FOUNDER-PASS-2026"
];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }
    const { passcode, creatorId } = body || {};

    if (!passcode) {
      return NextResponse.json(
        { error: "Missing required parameter: passcode" },
        { status: 400 }
      );
    }

    if (creatorId && creatorId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cleanPasscode = String(passcode).trim().toUpperCase();

    if (!VALID_PASSCODES.includes(cleanPasscode)) {
      return NextResponse.json(
        { error: "Invalid or expired VIP Passcode. Please check your approved creator welcome email." },
        { status: 400 }
      );
    }

    // Verify caller already holds creator/approved status (never elevate unapproved accounts)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role, promo_90_approved_at, ai_free_until")
      .eq("id", user.id)
      .maybeSingle();

    const isAlreadyCreator = profile?.role === "creator" || profile?.role === "admin";
    let hasApprovedApp = false;
    if (!isAlreadyCreator && user.email) {
      const { data: appRow } = await supabaseAdmin
        .from("creator_applications")
        .select("status")
        .eq("email", user.email.toLowerCase().trim())
        .eq("status", "approved")
        .maybeSingle();
      hasApprovedApp = Boolean(appRow);
    }

    if (!isAlreadyCreator && !hasApprovedApp) {
      return NextResponse.json(
        { error: "Creator approval or a VIP Fast-Track invite link is required first." },
        { status: 403 }
      );
    }

    const { aiFreeUntil } = buildFoundingYear1Timestamps(profile, 12);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        ai_agent_active: true,
        content_ops_enabled: true,
        ai_free_until: aiFreeUntil,
        role: profile?.role === "admin" ? "admin" : "creator"
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Redeem Passcode Error:", error);
      return NextResponse.json(
        { error: "Failed to activate AI Assistant pack. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Congratulations! 1-Year Free AI Assistant & Ops Pack activated successfully.",
      aiFreeUntil,
      creator: data
    });
  } catch (err: any) {
    console.error("VIP Passcode API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
