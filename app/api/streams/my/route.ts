import { authOptions } from "@/lib/auth-options";
import prismaClient from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest){
    const session = await getServerSession(authOptions);

    if(!session?.user?.id){
        return NextResponse.json(
            {success: false, message: "You are not logged in to get your streams"},
            {status: 403}
        )
    }

    const user = session.user;

    try{
        const streams = await prismaClient.stream.findMany({
            where: {userId: user.id},
            include: {
                _count: {
                    select: {
                        upvotes: true,
                    },
                },
                upvotes: {
                    where: {
                        userId: user.id,
                    }
                }
            }
        })
        return NextResponse.json({
            streams: streams.map(({ _count, ...rest }) => ({
              ...rest,
              upvotes: _count.upvotes,
              haveUpvoted: rest.upvotes.length ? true : false,
            })),
        });
    }catch(error: any){
        return NextResponse.json(
            { success: false, message: `An unexpected error occurred: ${error.message}` },
            { status: 500 }
        );
    }
}