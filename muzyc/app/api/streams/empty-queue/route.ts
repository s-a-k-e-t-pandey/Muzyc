import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db";


export async function POST(req: NextRequest){
    const session = await getServerSession(authOptions);

    if(!session?.user?.id){
        return NextResponse.json(
            {success: false, message: "You are not logged in to empty the queue"},
            {status: 403}
        )
    }
    const user = session.user;
    const data = await req.json();

    try{
        await prismaClient.stream.updateMany({
            where: {
                userId: user.id,
                played: false,
                spaceId: data.spaceId,
            },
            data: {
                played: true,
                playedTs: new Date(),
            }
        });

        return NextResponse.json(
            {success: true, message: "Queue emptied successfully"},
            {status: 200}
        )
    }catch(error: any){
        return NextResponse.json(
            { success: false, message: `An unexpected error occurred: ${error.message} while emptying the queue` },
            { status: 500 }
        );
    }
}