import {createClient, RedisClientType} from "redis";
import {PrismaClient} from "@prisma/client";
import {Worker, Queue, Job} from "bullmq";
import { getVideoId } from "./utils";
// @ts-ignore
import youtubesearchapi from "youtube-search-api"


const TIME_SPAN_FOR_VOTE = 1200000; // 20min
const TIME_SPAN_FOR_QUEUE = 1200000; // 20min
const TIME_SPAN_FOR_REPEAT = 3600000; //1hr
const MAX_QUEUE_LENGTH = 20;


const connection = {
    username : "default",
    password : "default",
    host: "localhost",
    port: 6379,
}

const redisCredentials = {
    url : `redis://${connection.username}:${connection.password}@${connection.host}:${connection.port}`,
}


class RoomManager {
    private static instance : RoomManager;
    public spaces : Map<string, Space>;
    public users : Map<string, User>;
    public redisClient: RedisClientType;
    public publisher: RedisClientType;
    public subscribers: RedisClientType;
    public prisma : PrismaClient;
    public worker : Worker;
    public queue : Queue;
    public wstoSpace : Map<WebSocket, string>;

    constructor(){
        this.spaces = new Map();
        this.users = new Map();
        this.redisClient = createClient(redisCredentials);
        this.publisher = createClient(redisCredentials);
        this.subscribers = createClient(redisCredentials)
        this.prisma = new PrismaClient();
        this.worker = new Worker(process.pid.toString(), this.processJob, {
            connection,
        });
        this.queue = new Queue(process.pid.toString(), {
            connection
        });
        this.wstoSpace = new Map();
    }
    static getInstance(){
        if(!RoomManager.instance){
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }

    async processJob(job : Job){
        const {data, name} = job;
        if(name === 'caste-vote'){
            await RoomManager.getInstance().adminCastVote(
                data.creatorId,
                data.userId,
                data.streamId,
                data.vote,
                data.spaceId
            );
        }else if(name === 'add-to-queue'){
            await RoomManager.getInstance().adminAddStreamHandler(
                data.spaceId,
                data.userId,
                data.url,
                data.existingActiveStream
            )
        } else if(name === 'play-next'){
            await RoomManager.getInstance().adminPlayNext(
                data.spaceId,
                data.userId
            )
        } else if(name === 'remove-song'){
            await RoomManager.getInstance().adminRemoveSong(
                data.spaceId,
                data.userId,
                data.streamId
            )
        } else if(name === 'empty-queue'){
            await RoomManager.getInstance().adminEmptyQueue(
                data.spaceId
            )
        }
    }

    async initRedisClient(){
        await this.redisClient.connect(),
        await this.subscribers.connect(),
        await this.publisher.connect()
    }

    onSubscribeRoom(message: string, spaceId: string){
      console.log("Subscribe Room", spaceId);
      const {type, data} = JSON.parse(message);
      if(type == 'new-stream'){
        RoomManager.getInstance().publishStream(spaceId, data);
      }  else if (type === "new-vote") {
        RoomManager.getInstance().publishNewVote(
          spaceId,
          data.streamId,
          data.vote,
          data.votedBy
        );
      } else if (type === "play-next") {
        RoomManager.getInstance().publishPlayNext(spaceId);
      } else if (type === "remove-song") {
        RoomManager.getInstance().publishRemoveSong(spaceId, data.streamId);
      } else if (type === "empty-queue") {
        RoomManager.getInstance().publishEmptyQueue(spaceId);
      }
    }

    async createRoom(spaceId: string){
      console.log(process.pid + "createRoom: " {spaceId});
      if(!this.spaces.has(spaceId)){
        this.spaces.set(spaceId, {
          users: new Map<string, User>(),
          creatorId: ""
        });
        await this.subscribers.subscribe(spaceId, this.onSubscribeRoom);
      }
    }


    async addUser(userId: string, ws: WebSocket, token: string) {
      let user = this.users.get(userId);
      if (!user) {
        this.users.set(userId, {
          userId,
          ws: [ws],
          token,
        });
      } else {
        if (!user.ws.some((existingWs) => existingWs === ws)) {
          user.ws.push(ws);
        }
      }
    }


    async joinRoom(
      spaceId: string,
      creatorId: string,
      userId: string,
      ws: WebSocket,
      token: string
    ) {
      console.log("Join Room" + spaceId);
  
      let space = this.spaces.get(spaceId);
      let user = this.users.get(userId);
  
      if (!space) {
        await this.createRoom(spaceId);
        space = this.spaces.get(spaceId);
      }
  
      if (!user) {
        await this.addUser(userId, ws, token);
        user = this.users.get(userId);
      } else {
        if (!user.ws.some((existingWs) => existingWs === ws)) {
          user.ws.push(ws);
        }
      }
  
      this.wstoSpace.set(ws, spaceId);
  
      if (space && user) {
        space.users.set(userId, user);
        this.spaces.set(spaceId, {
          ...space,
          users: new Map(space.users),
          creatorId: creatorId,
        });
      }
    }


    publishEmptyQueue(spaceId: string){
      console.log(process.pid + ": publishEmptyQueue");
      const space = this.spaces.get(spaceId)
      if(space){
        space?.users.forEach((user, userId)=>{
          user?.ws.forEach((ws)=>{
            ws.send(
              JSON.stringify({
                type: `empty-queue/${spaceId}`
              })
            )
          })
        })
      }
    }

    publishRemoveSong(spaceId: string, streamId: string){
      console.log(process.pid + ": publisRemoveSong");
      const space = this.spaces.get(spaceId);
      space?.users.forEach((user, userId)=>{
        user?.ws.forEach((ws)=>{
          ws.send(
            JSON.stringify({
              type: `remove-song/${spaceId}`,
              data: {
                streamId,
                spaceId
              }
            })
          );
        });
      });
    }

    publishPlayNext(spaceId: string){
      console.log(process.pid + ": PublishPlayNext");
      const space = this.spaces.get(spaceId);
      if(space){
        space?.users.forEach((user, userId)=>{
          user?.ws.forEach((ws)=>{
            JSON.stringify({
              type: `play-next/${spaceId}`
            })
          })
        })
      }
    }

    publishNewVote(spaceId: string, streamId: string, vote: 'upvote'|'downvote', votedBy: string){
      console.log(process.pid + ": publishNewVote");
      const spaces = this.spaces.get(spaceId);
      if(spaces){
        spaces?.users.forEach((user, userId)=>{
          user?.ws.forEach((ws)=>{
            ws.send(
              JSON.stringify({
                type: `new-vote/${spaceId}`,
                data: {
                  vote,
                  streamId,
                  votedBy,
                  spaceId
                }
              })
            )
          })
        })
      }
    }

    publishStream(spaceId: string, data: any){
      console.log(process.pid + ": publishNewStream");
      console.log("Publish New Stream", spaceId);
      const space = this.spaces.get(spaceId);
      if(space){
        space?.users.forEach((user, userId)=>{
          user?.ws.forEach((ws)=>{
            ws.send(
              JSON.stringify({
                type: `new-stream/${spaceId}`,
                data: data
              })
            );
          });
        });
      }
    }

    async adminCastVote(
        creatorId : string,
        userId : string,
        streamId : string,
        vote : string,
        spaceId : string,
    ){
        console.log(process.pid + " adminCastVote");
        if(vote === 'upvote'){
            await this.prisma.upvote.create({
                data: {
                    id: crypto.randomUUID(),
                    streamId,
                    userId
                }
            })
        }else{
            await this.prisma.upvote.delete({
                where:{
                    userId_streamId:{
                        userId,
                        streamId
                    }
                }
            });
        }
        await this.redisClient.set(
            `lastVoted-${spaceId}-${userId}`,
            new Date().getTime(),
            {
                EX : TIME_SPAN_FOR_VOTE / 1000,
            }
        );
        await this.publisher.publish(
            spaceId,
            JSON.stringify({
                type: "new-vote",
                data: {streamId, vote, votedBy: userId}
            })
        );
    }

    async adminAddStreamHandler(
        spaceId: string,
        userId: string,
        url: string,
        existingActiveStream: number
    ){
        console.log(process.pid + 'AdminAddStreamHandler');
        console.log('AdminAddStreamHandler' + spaceId);
        const room = this.spaces.get(spaceId);
        const currentUser = this.users.get(userId);

        if(!room || typeof existingActiveStream !== 'number') return;

        const extractedId = getVideoId(url);
        if(!extractedId){
            currentUser?.ws.forEach((ws)=>{
                ws.send(
                    JSON.stringify({
                        type: "error",
                        data: {message: "Invalid YouTube Url"}
                    })
                )
            })
            return;
        }
        await this.redisClient.set(
            `queue-length-${spaceId}`,
            existingActiveStream + 1
        )
        const res = await youtubesearchapi.GetVideoDetails(extractedId);
        if(!res){
            const thumbnails = res.thumbnail.thumbnails;
            thumbnails.sort((a : {width: number}, b : {width: number})=>{
                a.width < b.width ? -1 : 1;
            });
            const stream = await this.prisma.stream.create({
                data: {
                  id: crypto.randomUUID(),
                  userId: userId,
                  url: url,
                  extractedId,
                  type: "Youtube",
                  addedBy: userId,
                  title: res.title ?? "Cant find video",
                  // smallImg: video.thumbnails.medium.url,
                  // bigImg: video.thumbnails.high.url,
                  smallImg:
                    (thumbnails.length > 1
                      ? thumbnails[thumbnails.length - 2].url
                      : thumbnails[thumbnails.length - 1].url) ??
                    "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
                  bigImg:
                    thumbnails[thumbnails.length - 1].url ??
                    "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
                  spaceId: spaceId,
                },
            });
            await this.redisClient.set(`${spaceId}-${url}`, new Date().getTime(), {
                EX: TIME_SPAN_FOR_REPEAT / 1000,
            });
        
            await this.redisClient.set(
                `lastAdded-${spaceId}-${userId}`,
                new Date().getTime(),
                {
                EX: TIME_SPAN_FOR_QUEUE / 1000,
                }
            );
            await this.publisher.publish(
                spaceId,
                JSON.stringify({
                  type: "new-stream",
                  data: {
                    ...stream,
                    hasUpvoted: false,
                    upvotes: 0,
                  },
                })
            );
        }else{
            currentUser?.ws.forEach((ws) => {
                ws.send(
                  JSON.stringify({
                    type: "error",
                    data: {
                      message: "Video not found",
                    },
                  })
                );
            });
        }
    }

    async adminPlayNext(spaceId: string, userId: string) {
        const creatorId = this.spaces.get(spaceId)?.creatorId;
        console.log("adminPlayNext", creatorId, userId);
        let targetUser = this.users.get(userId);
        if (!targetUser) {
          return;
        }
    
        if (targetUser.userId !== creatorId) {
          targetUser.ws.forEach((ws) => {
            ws.send(
              JSON.stringify({
                type: "error",
                data: {
                  message: "You can't perform this action.",
                },
              })
            );
          });
          return;
        }
    
        const mostUpvotedStream = await this.prisma.stream.findFirst({
          where: {
            played: false,
            spaceId: spaceId,
          },
          orderBy: {
            upvotes: {
              _count: "desc",
            },
          },
        });
    
        if (!mostUpvotedStream) {
          targetUser.ws.forEach((ws) => {
            ws.send(
              JSON.stringify({
                type: "error",
                data: {
                  message: "Please add video in queue",
                },
              })
            );
          });
          return;
        }
    
        await Promise.all([
          this.prisma.currentStream.upsert({
            where: {
              spaceId: spaceId,
            },
            update: {
              spaceId: spaceId,
              userId,
              streamId: mostUpvotedStream.id,
            },
            create: {
              spaceId: spaceId,
              userId,
              streamId: mostUpvotedStream.id,
            },
          }),
          this.prisma.stream.update({
            where: {
              id: mostUpvotedStream.id,
            },
            data: {
              played: true,
              playedTs: new Date(),
            },
          }),
        ]);
    
        let previousQueueLength = parseInt(
          (await this.redisClient.get(`queue-length-${spaceId}`)) || "1",
          10
        );
        if (previousQueueLength) {
          await this.redisClient.set(
            `queue-length-${spaceId}`,
            previousQueueLength - 1
          );
        }
    
        await this.publisher.publish(
          spaceId,
          JSON.stringify({
            type: "play-next",
          })
        );
    }
    
    async adminRemoveSong(spaceId: string, userId: string, streamId: string){
        const user = await this.users.get(userId);
        const creatorId = await this.spaces.get(spaceId)?.creatorId;

        if(user || userId == creatorId){
            await this.prisma.stream.delete({
                where: {
                    id: userId,
                    spaceId : spaceId
                }
            })

            await this.publisher.publish(
                spaceId,
                JSON.stringify({
                    type: "remove-song",
                    data: {
                        streamId,
                        userId
                    }
                })
            )
        }else {
            user?.ws.forEach((ws) => {
              ws.send(
                JSON.stringify({
                  type: "error",
                  data: {
                    message: "You cant remove the song . You are not the host",
                  },
                })
              );
            });
        }
    }

    async adminEmptyQueue(spaceId: string){
        const room = this.spaces.get(spaceId);
        const userId = this.spaces.get(spaceId)?.creatorId;
        const user = this.users.get(userId as string);

        if (room && user) {
            await this.prisma.stream.updateMany({
                where: {
                played: false,
                spaceId: spaceId,
                },
                data: {
                played: true,
                playedTs: new Date(),
                },
            });
            await this.publisher.publish(
                spaceId,
                JSON.stringify({
                type: "empty-queue",
                })
            );
        }
    }
}


type User = {
    userId : string;
    ws : WebSocket[];
    token : string;
}

type Space = {
    creatorId : string;
    users : Map<string, User>;
}



