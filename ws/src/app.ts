import dotenv from "dotenv";
import cluster from "cluster";
import http from "http";

dotenv.config();
const cors = 1;

if(cluster.isPrimary){
    for(let i=0; i<cors; i++){
        cluster.fork();
    }
    cluster.on("disconnect", ()=>{
        process.exit();
    })
}else {
    main();
}


type data = {
    userId : string;
    spaceId : string;
    token: string;
    url: string;
    vote : "upvote" | "downvote";
    streamId: string;
}


function createHttpServer(){
    return http.createServer((req, res)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', "text/plain");
        res.end("hello, There is some data from server");
    })
}




async function main(){
    const server = createHttpServer();
    const websocket = new WebSocketServer({server});

    await RoomManager.init(web)
}