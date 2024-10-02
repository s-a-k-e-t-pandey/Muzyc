import { NextRequest, NextResponse } from "next/server";
import {z} from "zod";
import prismaClient from "@/lib/db";
import { YT_REGEX } from "@/lib/utils";

// @ts-ignore
import youtubesearchapi from "youtube-search-api"


const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url : z.string(),
})


export async function POST(req: NextRequest) {
    try{
        const data = CreateStreamSchema.parse(await req.json());
        const isYT = data.url.match(YT_REGEX)
        if(!isYT){
            return NextResponse.json({
                msg: "Invalid URL"
            },{
                status: 411
            })
        }

        const extractedId = data.url.split("?v=")[1];
        const res = await youtubesearchapi.GetVideoDetails(extractedId);
        const thumbnails = res.thumbnail.thumbnails;
        thumbnails.sort((a: {width: number}, b: {width: number}) => a.width < b.width ? 1 : -1);

        const stream = await prismaClient.stream.create({
            data:{
                userId: data.creatorId,
                url: data.url,
                extractedId,
                type: "Youtube",
                title: res.title ?? "Cant find video",
                smallImg: (thumbnails.length >1 ? thumbnails[thumbnails.length-2].url : thumbnails[thumbnails.length-1].url) ?? "",
                bigImg: thumbnails[thumbnails.length-1].url ?? ""
            }
        });

        return NextResponse.json({
            msg: "Stream added",
            id: stream.id
        })

    }catch(e){
        console.log(e)
        return NextResponse.json({
            msg: "Error while adding stream"
        }, {
            status: 411
        })
    }
}


export async function GET(req: NextRequest) {
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    const streams = await prismaClient.stream.findMany({
        where: {
            userId: creatorId ?? ""
        }
    })  
    return NextResponse.json({streams})
}