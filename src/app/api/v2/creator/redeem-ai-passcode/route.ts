import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin-client";

// Pre-approved 1-Year Free AI Assistant Passcodes
const VALID_PASSCODES = [
  "VIP2026-AI-FREE",
  "SECCION-AI-1YEAR",
  "CREATOR-90-BONUS",
  "FOUNDER-PASS-2026"
];

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }
    const { passcode, creatorId } = body || {};

    if (!passcode || !creatorId) {
      return NextResponse.json(
        { error: "Missing required parameters: passcode and creatorId" },
        { status: 400 }
      );
    }

    const cleanPasscode = passcode.trim().toUpperCase();

    if (!VALID_PASSCODES.includes(cleanPasscode)) {
      return NextResponse.json(
        { error: "Invalid or expired VIP Passcode. Please check your approved creator welcome email." },
        { status: 400 }
      );
    }

    // Activate 1 Year Free AI Assistant Pack for Creator
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        ai_agent_active: true,
        content_ops_enabled: true,
        ai_free_until: oneYearFromNow.toISOString(),
        role: "creator"
      })
      .eq("id", creatorId)
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
      aiFreeUntil: oneYearFromNow.toISOString(),
      creator: data
    });
  } catch (err: any) {
    console.error("VIP Passcode API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
