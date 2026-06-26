import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import redis from "./redis";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    Credentials({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null;

        const email = credentials.email as string;
        const otp = credentials.otp as string;

        // Verify OTP from Redis
        const storedOtp = await redis.get(`otp:email:${email}`);
        
        if (!storedOtp || storedOtp !== otp) {
          return null; // Invalid OTP
        }

        // Delete OTP on success
        await redis.del(`otp:email:${email}`);

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({ data: { email } });
          
          // Auto-assign CITIZEN role
          const citizenRole = await prisma.role.findUnique({ where: { name: 'CITIZEN' } });
          if (citizenRole) {
            await prisma.userRole.create({
              data: { userId: user.id, roleId: citizenRole.id }
            });
          }
        }

        return { id: user.id, email: user.email };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      // Auto-assign CITIZEN role for OAuth/Email signups
      const citizenRole = await prisma.role.findUnique({ where: { name: 'CITIZEN' } });
      if (citizenRole) {
        // Use upsert or ignore if exists, though createUser is only called once
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: citizenRole.id
          }
        });
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
