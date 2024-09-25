import { NextRequest, NextResponse } from "next/server";
import {z} from "zod";
import {prismaClient} from "../../lib/db";


const YT_REGEX = new RegExp("^https:\/\/www.youtube.com\/watch\?v=[\w-]{11}$");

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url : z.string(),
})


export async function POST(req: NextRequest) {
    try{
        const data = CreateStreamSchema.parse(await req.json());
        const isYT = YT_REGEX.test(data.url);
        if(!isYT){
            return NextResponse.json({
                msg: "Invalid URL"
            },{
                status: 411
            })
        }

        const extractedId = data.url.split("?v=")[1];
        await prismaClient.stream.create({
            data:{
                type: "Youtube",
                extractedId,
                url: data.url,
                userId: data.creatorId
            }
        })

    }catch(e){
        return NextResponse.json({
            msg: "Error while adding stream"
        }, {
            status: 411
        })
    }
}