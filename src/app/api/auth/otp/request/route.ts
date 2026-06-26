import { NextResponse } from "next/server";
import { AuthService } from "../../../../../../modules/auth/auth.service";
import { z } from "zod";

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = requestSchema.parse(body);

    await AuthService.requestOtp(email);

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Bad Request" },
      { status: 400 }
    );
  }
}
