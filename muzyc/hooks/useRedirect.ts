import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function useRedirect(){
    const router = useRouter();
    const session = useSession();

    useEffect(()=>{
        if(session.status === "unauthenticated"){
            router.push("/auth");
        }
    }, [session, router])
}