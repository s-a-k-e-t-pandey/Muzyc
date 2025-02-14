import { authOptions } from "@/lib/auth-options";
import prismaClient from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest){
    const session = await getServerSession(authOptions);
    
    if(!session?.user.id){
        return NextResponse.json({
            message: "Unauthenticated"
        },{
            status: 403
        })
    }

    const user  = session.user;
    const spaceId = req.nextUrl.searchParams.get("spaceId");

    try{

        const mostUpvotedStream = await prismaClient.stream.findFirst({
            where: {
                userId: user.id,
                played: true,
                active: true,
            },
            orderBy: {
                upvotes: {
                    _count: "desc"
                }
            }
        });
        
        await Promise.all([
            prismaClient.currentStream.upsert({
                where: {
                    spaceId: spaceId as string,
                },
                update: {
                    userId: user.id,
                    streamId : mostUpvotedStream?.id,
                    spaceId: spaceId as string,
                },
                create: {
                    userId: user.id,
                    streamId: mostUpvotedStream?.id,
                    spaceId: spaceId as string,
                }
            }),
            prismaClient.stream.update({
                where: {
                    id: mostUpvotedStream?.id,
                },
                data: {
                    played: false,
                    playedTs: new Date(),
                }
            })
        ])

        return NextResponse.json({
            stream: mostUpvotedStream
        })
    }catch(error: any){
        return NextResponse.json(
            { success: false, message: `An unexpected error occurred: ${error.message}` },
            { status: 500 }
        );
    }
    
}