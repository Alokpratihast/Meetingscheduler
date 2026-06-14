import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      database: "connected",
    });
  } catch (error) {
    console.error("MONGODB ERROR =>", error);

    return NextResponse.json(
      {
        success: false,
        database: "failed",
      },
      { status: 500 }
    );
  }
}