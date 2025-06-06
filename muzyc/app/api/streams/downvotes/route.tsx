import prismaClient from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {z} from "zod";  
import { authOptions } from "@/lib/auth-options";



const UpvoteSchema = z.object({
    streamId : z.string(),
})

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if(!session?.user?.id){
        return NextResponse.json(
            {message: "Unauthenticated"},
            {status: 403}
        )
    }
    const user = session.user;
    try{
        const data = UpvoteSchema.parse(await req.json());
        await prismaClient.upvote.delete({
            where: {
                userId_streamId: {
                    userId: user.id,
                    streamId: data.streamId,
                }
            }
        });
        return NextResponse.json(
            {message: "Done!"},
            {status: 200}
        )
    }catch(e){
        return NextResponse.json({
            msg: "Error while Downvoting"
        }, {
            status: 403
        })
    }
}