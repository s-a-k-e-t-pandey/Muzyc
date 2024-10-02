import { authOptions } from "@/lib/auth-options";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";


export const GET = async (req: NextRequest)=>{
    const session = await getServerSession(authOptions);

    if(!session?.user.id){
        return NextResponse.json({
            message: "Unauthenticated"
        },{
            status: 403
        });
    }
    return NextResponse.json({
        user: session.user,
    });
};


export const dynamic = "force-dynamic";