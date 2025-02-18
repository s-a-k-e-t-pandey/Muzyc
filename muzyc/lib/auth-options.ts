import GitHubProvider from "next-auth/providers/github";
import prismaClient from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import { emailSchema, passwordSchema } from "@/schema/Credentials-schema";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";

interface ExtendedUser {
    id: string;
    email: string;
    name?: string | null;
}

export const authOptions: NextAuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID ?? "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { 
                    label: "Email", 
                    type: "email",
                    placeholder: "example@example.com"
                },
                password: { 
                    label: "Password", 
                    type: "password",
                    placeholder: "Your password"
                }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const emailValidation = emailSchema.safeParse(credentials.email);
                if (!emailValidation.success) {
                    throw new Error("Invalid email format");
                }

                const passwordValidation = passwordSchema.safeParse(credentials.password);
                if (!passwordValidation.success) {
                    throw new Error("Invalid password format");
                }

                try {
                    const user = await prismaClient.user.findUnique({
                        where: {
                            email: emailValidation.data
                        }
                    });

                    if (!user?.password) {
                        throw new Error("Invalid credentials");
                    }

                    const passwordMatch = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!passwordMatch) {
                        throw new Error("Invalid credentials");
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name
                    };
                } catch (error) {
                    console.error("AUTH_ERROR", error);
                    throw new Error("Authentication error");
                }
            }
        })
    ],
    pages: {
        signIn: "/auth",
        error: "/auth/error",
    },
    debug: process.env.NODE_ENV === "development",
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user && typeof user.id === 'string' && typeof user.email === 'string') {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET
};

// Add type declaration merging for next-auth
declare module "next-auth" {
    interface User extends ExtendedUser {}
    interface Session {
        user: ExtendedUser;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
    }
}