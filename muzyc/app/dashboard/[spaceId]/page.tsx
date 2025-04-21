"use client"

import { useSocket } from "@/context/socket-context";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import StreamView from "@/components/StreamView";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/navigation";

interface TokenPayload {
    creatorId: string;
    userId: string;
}

export default function Component({params: {spaceId}}: {params: {spaceId: string}}){
    const {socket, user, loading, setUser, connectionError} = useSocket();
    const [creatorId, setCreatorId] = useState<string | null>(null);
    const [loading1, setLoading1] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(()=>{
        async function fetchHostId(){
            try{
                const res = await fetch(`/api/spaces/?spaceId=${spaceId}`, {
                    method: 'GET',
                });
                const data = await res.json();
                if(!res.ok || !data.success){
                    throw new Error(data.message || "Failed to retrieve space's host id");
                }
                setCreatorId(data.space.hostId);
            }catch(error: any){
                console.error("Error fetching space:", error);
                setError(error.message || "Failed to load space");
            }finally{
                setLoading1(false);
            }
        }
        fetchHostId();
    }, [spaceId])

    useEffect(()=>{
        if(user && socket && creatorId){
            try {
                const secret = process.env.NEXTAUTH_SECRET;
                if (!secret) {
                    throw new Error("NEXTAUTH_SECRET is not configured");
                }

                const tokenPayload: TokenPayload = {
                    creatorId: creatorId,
                    userId: user.id
                };

                const token = user.token || jwt.sign(
                    tokenPayload,
                    secret,
                    { expiresIn: "24h" }
                );

                socket?.send(
                    JSON.stringify({
                        type: "join-room",
                        data: {
                            token,
                            spaceId
                        },
                    })
                );
                
                if(!user.token){
                    setUser({...user, token});
                }
            } catch (err) {
                console.error("Failed to generate token:", err);
                setError("Failed to establish connection");
            }
        }
    }, [socket, user, creatorId, spaceId, setUser]);

    if(connectionError){
        return <ErrorScreen> Cannot connect to server</ErrorScreen>
    }

    if(loading || loading1){
        return <LoadingScreen/>
    }

    if(!user){
        return <ErrorScreen> You are not logged in</ErrorScreen>
    }

    if(user.id != creatorId){
        console.log("UserId:", user.id, "CreatorId:", creatorId);
        return <ErrorScreen> You are not the creator of this space</ErrorScreen>
    }

    return <StreamView creatorId={creatorId as string} playVideo={true} spaceId={spaceId}/>
}