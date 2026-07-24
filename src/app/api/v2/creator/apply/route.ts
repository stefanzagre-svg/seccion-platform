import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, telegram, link1, link2, link3, city, claimOffer } = body;

    // Validate required fields
    if (!fullName || !email || !phone || !telegram || !link1) {
      return NextResponse.json(
        { error: "Missing required fields: fullName, email, phone, telegram, link1" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

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
