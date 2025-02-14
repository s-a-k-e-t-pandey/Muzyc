import GitHubProvider from "next-auth/providers/github";
import prismaClient from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import { emailSchema, passwordSchema } from "@/schema/Credentials-schema";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { NextAuthOptions, Session } from "next-auth";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";


export const authOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID ?? "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
        }),
        Credentials({
            credentials: {
                email: { type: "email" },
                password: { type: "password" }
            },
            async authorize(credentials) {
                if (!credentials || !credentials.email || !credentials.password) {
                    return null;
                }

                const emailValidation = emailSchema.safeParse(credentials.email);
                if (!emailValidation.success) {
                    throw new Error("Invalid email");
                }

                const passwordValidation = passwordSchema.safeParse(credentials.password);
                if (!passwordValidation.success) {
                    throw new Error("Invalid password");
                }

                try {
                    const user = await prismaClient.user.findUnique({
                        where: {
                            email: emailValidation.data
                        }
                    });
                    if (!user) {
                        const hashedPassword = await bcrypt.hash(credentials.password, 10);

                        const newUser = await prismaClient.user.create({
                            data: {
                                email: emailValidation.data,
                                password: hashedPassword,
                                provider: "Credentials",
                            }
                        });
                        return newUser;
                    }

                    if (!user.password) {
                        const hashedPassword = await bcrypt.hash(credentials.password, 10);
                        const authUser = await prismaClient.user.update({
                            where: {
                                email: emailValidation.data
                            },
                            data: {
                                password: hashedPassword
                            }
                        })
                        return authUser;
                    }

                    const passwordVerification = await bcrypt.compare(passwordValidation.data, user.password);
                    if (!passwordVerification) {
                        throw new Error("Invalid password");
                    }
                    return null;

                } catch (e) {
                    if (e instanceof Error) {
                        throw new Error("Internal Server Error");
                    }
                    console.log(e);
                    throw e;
                }
            }
        })
    ],
    pages: {
        signIn: "/auth"
    },
    secret: process.env.NEXTAUTH_SECRET ?? "secret",
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.email = profile.email as string;
                token.id = account.access_token;
            }
            return token;
        },
        async session({ session, token }: {
            session: Session;
            token: JWT;
        }) {
            try {
                const user = await prismaClient.user.findUnique({
                    where: {
                        email: token?.email
                    }
                });
                if (user) {
                    session.user.id = user.id;
                }
            } catch (e) {
                if (e instanceof PrismaClientInitializationError) {
                    throw new Error("Internal Server Error");
                }
                console.log(e);
                throw e;
            }
            return session;
        },
        async signIn({ account, profile }) {

            try {
              if (account?.provider === "GitHub") {
      
                const user = await prismaClient.user.findUnique({
                  where: {
                    email: profile?.email!,
                  }
                });
      
      
                if (!user) {
                  const newUser = await prismaClient.user.create({
                    data: {
                      email: profile?.email!,
                      name: profile?.name || undefined,
                      provider: "GitHub"
                    }
                  });
                }
              }
              return true;
            } catch (error) {
              console.log(error);
              //throw error;
              return false;
            }
        }
    }
} satisfies NextAuthOptions;