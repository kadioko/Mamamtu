import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from 'bcryptjs';
import { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { ACCOUNT_LOCKOUT_CONFIG } from './security';
import { authorizeCredentials } from './auth-credentials';

// NextAuth type augmentation lives in src/types/auth.d.ts

// Build providers list conditionally
const providers: AuthOptions["providers"] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      return authorizeCredentials(credentials ?? {});
    }
  })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as unknown as AuthOptions['adapter'],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers,
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
        session.user.isActive = token.isActive;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // Handle token refresh from the client
      if (trigger === 'update' && session) {
        return { ...token, ...session.user };
      }

      const dbUser = await prisma.user.findFirst({
        where: { email: token.email },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          isActive: true,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user.id;
          token.role = user.role;
          token.emailVerified = user.emailVerified;
          token.isActive = user.isActive;
        }
        return token;
      }

      return {
        ...token,
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        emailVerified: dbUser.emailVerified,
        isActive: dbUser.isActive,
      };
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}
