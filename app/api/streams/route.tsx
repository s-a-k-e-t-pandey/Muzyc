import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prismaClient from "@/lib/db";
import { YT_REGEX } from "@/lib/utils";

// @ts-ignore
import youtubesearchapi from "youtube-search-api"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";


const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string(),
    spaceId: z.string()
})

const MAX_QUEUE_LEN = 20;

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "You are not logged in to add a stream" },
                { status: 403 }
            )
        }
        const user = session.user;
        const data = CreateStreamSchema.parse(await req.json());

        if (!data.url) {
            return NextResponse.json({
                msg: "Yotube link cannot be empty"
            }, {
                status: 400
            })
        }
        const isYT = data.url.match(YT_REGEX)
        const videoId = data.url ? data.url.match(YT_REGEX)?.[1] : null;
        if (!isYT || !videoId) {
            return NextResponse.json({
                msg: "Invalid Youtube URL format"
            }, {
                status: 411
            })
        }

        const res = await youtubesearchapi.GetVideoDetails(videoId);

        // Check if the user is not the creator
        if (user.id !== data.creatorId) {
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

            const userRecentStreams = await prismaClient.stream.count({
                where: {
                    userId: data.creatorId,
                    addedBy: user.id,
                    createAt: {
                        gte: tenMinutesAgo,
                    },
                },
            });

            // Check for duplicate song in the last 10 minutes
            const duplicateSong = await prismaClient.stream.findFirst({
                where: {
                    userId: data.creatorId,
                    extractedId: videoId,
                    createAt: {
                        gte: tenMinutesAgo,
                    },
                },
            });
            if (duplicateSong) {
                return NextResponse.json(
                    {
                        message: "This song was already added in the last 10 minutes",
                    },
                    {
                        status: 429,
                    },
                );
            }

            // Rate limiting checks for non-creator users
            const streamsLastTwoMinutes = await prismaClient.stream.count({
                where: {
                    userId: data.creatorId,
                    addedBy: user.id,
                    createAt: {
                        gte: twoMinutesAgo,
                    },
                },
            });

            if (streamsLastTwoMinutes >= 2) {
                return NextResponse.json(
                    {
                        message:
                            "Rate limit exceeded: You can only add 2 songs per 2 minutes",
                    },
                    {
                        status: 429,
                    },
                );
            }

            if (userRecentStreams >= 5) {
                return NextResponse.json(
                    {
                        message:
                            "Rate limit exceeded: You can only add 5 songs per 10 minutes",
                    },
                    {
                        status: 429,
                    },
                );
            }
        }

        const thumbnails = res.thumbnail.thumbnails;
        thumbnails.sort((a: { width: number }, b: { width: number }) =>
            a.width < b.width ? -1 : 1,
        );

        const existingActiveStreams = await prismaClient.stream.count({
            where: {
                spaceId: data.spaceId,
                played: false,
            },
        });

        if (existingActiveStreams >= MAX_QUEUE_LEN) {
            return NextResponse.json(
                {
                    message: "Queue is full",
                },
                {
                    status: 429,
                },
            );
        }
        // const extractedId = data.url.split("?v=")[1];
        // const res = await youtubesearchapi.GetVideoDetails(extractedId);
        // const thumbnails = res.thumbnail.thumbnails;
        // thumbnails.sort((a: {width: number}, b: {width: number}) => a.width < b.width ? 1 : -1);

        const stream = await prismaClient.stream.create({
            data: {
                userId: data.creatorId,
                addedBy: user.id,
                url: data.url,
                extractedId: videoId,
                type: "Youtube",
                title: res.title ?? "Cant find video",
                smallImg:
                    (thumbnails.length > 1
                        ? thumbnails[thumbnails.length - 2].url
                        : thumbnails[thumbnails.length - 1].url) ??
                    "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
                bigImg:
                    thumbnails[thumbnails.length - 1].url ??
                    "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
                spaceId: data.spaceId
            }
        });

        return NextResponse.json({
            ...stream,
            hasUpvoted: false,
            upvotes: 0,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            {
                message: "Error while adding a stream",
            },
            {
                status: 500,
            },
        );
    }
}


export async function GET(req: NextRequest) {
    const spaceId = req.nextUrl.searchParams.get("spaceId");
    const session = await getServerSession(authOptions);
    if (!session?.user.id) {
        return NextResponse.json(
            {
                message: "Unauthenticated",
            },
            {
                status: 403,
            },
        );
    }
    const user = session.user;

    if (!spaceId) {
        return NextResponse.json({
            message: "Error"
        }, {
            status: 411
        })
    }

    const [space, activeStream] = await Promise.all([
        prismaClient.space.findUnique({
            where: {
                id: spaceId,
            },
            include: {
                streams: {
                    include: {
                        _count: {
                            select: {
                                upvotes: true
                            }
                        },
                        upvotes: {
                            where: {
                                userId: session?.user.id
                            }
                        }

                    },
                    where: {
                        played: false
                    }
                },
                _count: {
                    select: {
                        streams: true
                    }
                },

            }

        }),
        prismaClient.currentStream.findFirst({
            where: {
                spaceId: spaceId
            },
            include: {
                stream: true
            }
        })
    ]);

    const hostId = space?.hostId;
    const isCreator = session.user.id === hostId

    return NextResponse.json({
        streams: space?.streams.map(({ _count, ...rest }) => ({
            ...rest,
            upvotes: _count.upvotes,
            haveUpvoted: rest.upvotes.length ? true : false
        })),
        activeStream,
        hostId,
        isCreator,
        spaceName: space?.name
    });
}