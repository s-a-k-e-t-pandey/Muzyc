import prismaClient from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { AuthOptions } from "next-auth";


export async function GET(){
    const session = await getServerSession(authOptions());
    
    if(!session?.user.id){
        return NextResponse.json({
            message: "Unauthenticated"
        },{
            status: 403
        })
    }

    const user  = session.user;
    const spaceId = req.nextUrl.searchParams.get("spaceId");
    const mostUpvoted = prismaClient.stream.findFirst({
        where: {
            userId: user.id
        },
        orderBy: {
            upVotes: {
                _count: "desc"
            }
        }
    })

    await Promise.all([prismaClient.currentStream.upsert({
        where: {
            userId: user.id
        },
        update: {
            streamId : mostUpvoted?.id
        },
        create: {
            userId: user.id,
            streamId : mostUpvoted?.id
        }
    }), prismaClient.currentStream.delete({
        where: {
            streamId: mostUpvoted?.id
        }
    }) 
    ])

    return NextResponse.json({
        stream: mostUpvoted
    })
}