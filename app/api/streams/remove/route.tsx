import { authOptions } from "@/lib/auth-options";
import prismaClient from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";




export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user.id) {
        return NextResponse.json(
            { success: false, message: "You are not logged in to remove a song" },
            { status: 403 }
        )
    }

    const user = session.user;

    try {
        const { searchParams } = new URL(req.url);
        const streamId = searchParams.get("streamId");
        const spaceId = searchParams.get("spaceId");

        if (!streamId) {
            return NextResponse.json(
                { success: false, message: "Stream id is required" },
                { status: 400 }
            )
        }

        await prismaClient.stream.delete({
            where: {
                id: streamId,
                userId: user.id,
                spaceId: spaceId,
            }
        })
        return NextResponse.json({
            message: "Song removed successfully",
        });
    } catch (e) {
        return NextResponse.json(
            {
                message: "Error while removing the song",
            },
            {
                status: 400,
            },
        );
    }
}