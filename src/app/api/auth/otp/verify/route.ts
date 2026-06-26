import { NextResponse } from "next/server";
import { AuthService } from "../../../../../../modules/auth/auth.service";
import { z } from "zod";

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = verifySchema.parse(body);

    const isValid = await AuthService.verifyOtp(email, otp);
    
    return NextResponse.json({ success: isValid });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
