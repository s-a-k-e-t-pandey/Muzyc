import { useSession } from "next-auth/react";

import {
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    createContext,
    useContext, 
    useEffect,
    useState,
} from "react";
import { set } from "zod";

type SocketContextType = {
    socket: WebSocket | null,
    user: null | { id: string, token?: string },
    setUser: Dispatch<SetStateAction<null | { id: string, token?: string }>>,
    connectionError: boolean,
    loading: boolean,
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    user: null,
    connectionError: false,
    setUser: () => {},
    loading: true
})

export const SocketContextProvider = ({children}: PropsWithChildren) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [user, setUser] = useState<null | { id: string, token?: string }>(null);
    const [connectionError, setConnectionError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const session = useSession();

    useEffect(()=>{
        if(!session && session.data?.user.id){
            const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL as string);
            ws.onopen = () =>{
                setSocket(ws);
                setUser(session.data?.user || null)
                setLoading(false);
            }

            ws.onclose = () =>{
                setSocket(null);
                setLoading(false);
            }

            ws.onerror = () =>{
                setSocket(null);
                setLoading(false);
                setConnectionError(true);
            }

            () => {
                ws.close();
            }
        }
    }, [socket, session.data]);

    return (
        <SocketContext.Provider value={{
            socket,
            user,
            setUser,
            connectionError,
            loading,
        }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () =>{
    const {socket, user, setUser, connectionError, loading} = useContext(SocketContext);
    
    const sendMessage = (type: string, data: {[key: string]: any}) => {
        socket?.send(
            JSON.stringify({
                type,
                data: {
                    ...data,
                    userId: user?.token,
                },
            })
        )
    }
    return {socket, user, setUser, connectionError, loading, sendMessage};
}


