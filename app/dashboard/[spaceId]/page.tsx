import { useSocket } from "@/context/socket-context";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";
import StreamView from "@/components/StreamView";


export default function Component({params: {spaceId}}: {params: {spaceId: string}}){

    const {socket, user, loading, setUser, connectionError} = useSocket();

    const [creatorId, setCreatorId] = useState<string | null>(null);
    const [loading1, setLoading1] = useState(false);

    useEffect(()=>{
        async function fetchHostId(){
            try{
                const res = await fetch('/api/spaces/?spaceId=${spaceId}', {
                    method: 'GET',
                })
                const data = await res.json();
                if(!res.ok || !data.success){
                    throw new Error(data.message || "Failed to space's host Id");
                }
                setCreatorId(data.hostId);
            }catch(error: any){
                console.log(error.message);
            }finally{
                setLoading1(false);
            }
        }
        fetchHostId();
    }, [spaceId])


    useEffect(()=>{
        if(user && socket && creatorId){
            const token = user.token || jwt.sign(
                {
                    creatorId: creatorId,
                    userId: user.id
                },
                process.env.NEXT_PUBLIC_SECRET || "",
                {
                    expiresIn: "24h",
                }
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
        }
    }, [user, socket, creatorId, spaceId])

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
        return <ErrorScreen> You are not the creator of this space</ErrorScreen>
    }

    return <StreamView creatorId={creatorId as string} playVideo={true} spaceId={spaceId}/>
}

export const dynamic = "auto";