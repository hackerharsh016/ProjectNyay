import redis from "../../src/lib/redis";
import crypto from "crypto";

const OTP_TTL = 300; // 5 minutes
const MAX_REQUESTS = 3; // Max requests per window
const REQUEST_WINDOW = 900; // 15 minutes
const MAX_ATTEMPTS = 5; // Max failed attempts before lockout

export class AuthService {
  /**
   * Generates a 6-digit OTP, enforces rate limits, and stores it in Redis.
   */
  static async requestOtp(email: string): Promise<string> {
    const requestKey = `otp:request_count:${email}`;
    const otpKey = `otp:email:${email}`;
    const attemptsKey = `otp:attempts:${email}`;

    // 1. Check rate limit for requests
    const requestsCount = await redis.incr(requestKey);
    if (requestsCount === 1) {
      await redis.expire(requestKey, REQUEST_WINDOW);
    }
    if (requestsCount > MAX_REQUESTS) {
      throw new Error("Too many OTP requests. Please try again later.");
    }

    // 2. Generate OTP (6 digits)
    const otp = crypto.randomInt(100000, 999999).toString();

    // 3. Store OTP and reset attempts
    await redis.setex(otpKey, OTP_TTL, otp);
    await redis.del(attemptsKey);

    // TODO: Send OTP via email (mocked for now)
    console.log(`[DEV] OTP for ${email}: ${otp}`);

    return otp;
  }

  /**
   * Verifies the OTP (this logic is also mirrored/called in Auth.js Credentials provider)
   */
  static async verifyOtp(email: string, otp: string): Promise<boolean> {
    const otpKey = `otp:email:${email}`;
    const attemptsKey = `otp:attempts:${email}`;

    // Check failed attempts
    const attempts = await redis.get(attemptsKey);
    if (attempts && parseInt(attempts) >= MAX_ATTEMPTS) {
      await redis.del(otpKey); // Lockout current OTP
      throw new Error("Too many failed attempts. Request a new OTP.");
    }

    const storedOtp = await redis.get(otpKey);
    if (!storedOtp) {
      throw new Error("OTP expired or invalid.");
    }

    if (storedOtp !== otp) {
      // Increment failed attempts
      await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, OTP_TTL);
      throw new Error("Invalid OTP.");
    }

    // Success: handled by Auth.js but good to have here
    return true;
  }
}
