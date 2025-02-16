import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prismaClient from "@/lib/db";
import { emailSchema, passwordSchema } from "@/schema/Credentials-schema";


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        // Validate email and password
        const emailValidation = emailSchema.safeParse(email);
        const passwordValidation = passwordSchema.safeParse(password);
        
        if (!emailValidation.success) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        if (!passwordValidation.success) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prismaClient.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prismaClient.user.create({
            data: {
                email,
                password: hashedPassword,
                name: email.split('@')[0],
                provider: "Credentials",
            }
        });
        console.log("User created successfully", user);

        return NextResponse.json(
            { message: "User created successfully" },
            { status: 201 }
        );

    } catch (error) {
        console.log("error", error);
        console.error("SIGNUP_ERROR", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}