"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SplashCursor } from "../ui/splash-cursor";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

import { useSocket } from "@/context/socket-context";
import { useSession } from "next-auth/react";
import NowPlaying from "./NowPlaying";
import Queue from "./Queue";
import AddSongForm from "./AddSongForm";
import { Appbar } from "../AppBar";
import { SplineScene } from "../ui/spline-scene";
import { Spotlight } from "../ui/spotlight";
import { Card } from "../ui/card";

export default function StreamView({
  creatorId,
  playVideo = false,
  spaceId,
}: {
  creatorId: string;
  playVideo: boolean;
  spaceId: string;
}) {
  const [inputLink, setInputLink] = useState("");
  const [queue, setQueue] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [playNextLoader, setPlayNextLoader] = useState(false);
  const [spaceName, setSpaceName] = useState("");

  const { socket, sendMessage } = useSocket();
  const user = useSession().data?.user;

  useEffect(() => {
    if (socket) {
      socket.onmessage = async (event) => {
        const { type, data } = JSON.parse(event.data) || {};
        if (type === `new-stream/${spaceId}`) {
          console.log(type);
          addToQueue(data);
        } else if (type === `new-vote/${spaceId}`) {
          setQueue((prev) => {
            return prev
              .map((v) => {
                if (v.id === data.streamId) {
                  return {
                    ...v,
                    upvotes: v.upvotes + (data.vote === "upvote" ? 1 : -1),
                    haveUpvoted:
                      data.votedBy === user?.id
                        ? data.vote === "upvote"
                        : v.haveUpvoted,
                  };
                }
                return v;
              })
              .sort((a, b) => b.upvotes - a.upvotes);
          });
        } else if (type === "error") {
          enqueueToast("error", data.message);
          setLoading(false);
        } else if (type === `play-next/${spaceId}`) {
          await refreshStreams();
        } else if (type === `remove-song/${spaceId}`) {
          setQueue((prev) => {
            return prev.filter((stream) => stream.id !== data.streamId);
          });
        } else if (type === `empty-queue/${spaceId}`) {
          setQueue([]);
        }
      };
    }
  }, [socket]);

  useEffect(() => {
    refreshStreams();
  }, []);

  async function addToQueue(newStream: any) {
    setQueue((prev) => [...prev, newStream]);
    setInputLink("");
    setLoading(false);
  }

  async function refreshStreams() {
    try {
      const res = await fetch(`/api/streams/?spaceId=${spaceId}`, {
        credentials: "include",
      });
      const json = await res.json();
      setQueue(
        json.streams.sort((a: any, b: any) => (a.upvotes < b.upvotes ? 1 : -1)),
      );

      setCurrentVideo((video) => {
        if (video?.id === json.activeStream?.stream?.id) {
          return video;
        }
        return json.activeStream.stream;
      });
      setSpaceName(json.spaceName);
    } catch (error) {
      enqueueToast("error", "Something went wrong");
    }

    setPlayNextLoader(false);
  }

  const playNext = async () => {
    setPlayNextLoader(true);
    sendMessage("play-next", {
      spaceId,
      userId: user?.id,
    });
  };

  const enqueueToast = (type: "error" | "success", message: string) => {
    const toastFn = type === "error" ? toast.error : toast.success;
  
    toastFn(message, {
      duration: 5000,
    });
  };
  

  return (
    <div className="flex min-h-screen flex-col bg-black"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(220, 236, 239, 0.2) 0.5px, transparent 0)`,
        backgroundSize: "8px 8px",
        backgroundRepeat: "repeat",
      }}>
      <SplashCursor />

      <Appbar isSpectator={!playVideo} />
      <div className="mx-auto rounded-lg p-2 bg-gradient-to-r from-indigo-600 to-violet-800 text-2xl font-bold">
        {spaceName}
      </div>
      <div className="flex justify-center">
        <div className="grid w-screen max-w-screen-xl grid-cols-1 gap-4 pt-8 md:grid-cols-5">
          <Queue
            creatorId={creatorId}
            isCreator={playVideo}
            queue={queue}
            userId={user?.id || ""}
            spaceId={spaceId}
          />
          <div className="col-span-2">
            <div className="mx-auto w-full max-w-4xl space-y-6 p-4">
              <Card className="w-full h-[300px] bg-black/[0.96] relative overflow-hidden">
                <Spotlight
                  className="-top-40 left-0 md:left-60 md:-top-20"
                  fill="white"
                />
                <div className="flex h-full">
                  <div className="relative flex-1">
                    <SplineScene 
                      scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </Card>
              <AddSongForm
                creatorId={creatorId}
                userId={user?.id || ""}
                enqueueToast={enqueueToast}
                inputLink={inputLink}
                loading={loading}
                setInputLink={setInputLink}
                setLoading={setLoading}
                spaceId={spaceId}
                isSpectator={!playVideo}
              />
              <NowPlaying
                currentVideo={currentVideo}
                playNext={playNext}
                playNextLoader={playNextLoader}
                playVideo={playVideo}
              />
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

