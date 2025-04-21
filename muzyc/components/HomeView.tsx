"use client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CardSkeleton from "./ui/cardSkeleton";
import SpacesCard from "./SpacesCard";
import {Appbar} from "./AppBar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { motion } from "framer-motion";
import { WavyBackground } from "./ui/WavyBackground";

interface Space {
    endTime?: Date | null;
    hostId: string;
    id: string;
    isActive: boolean;
    name: string;
    startTime: Date | null;

}

export default function HomeView(){
    const [isCreatedSpaceOpen, setIsCreatedSpaceOpen] = useState(false);
    const [spaceName, setSpaceName] = useState("");
    const [spaces, setSpaces] = useState<Space[] | null>(null);
    const [isloading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSpaces = async () => {
            setIsLoading(true);
            try{
                const res = await fetch("/api/spaces", {
                    method: "GET",
                });
                const data = await res.json();

                if(!res.ok || !data.success){
                    throw new Error(data.message || "Failed to fetch spaces");
                }
                const fetchedSpaces = data.spaces as Space[];
                setSpaces(fetchedSpaces);
            }catch(e){
                toast.error("Error fetching spaces");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSpaces();
    }, []);

    const handleCreateSpace = async () => {
        setIsCreatedSpaceOpen(false);
        try {
          const response = await fetch(`/api/spaces`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              spaceName: spaceName,
            }),
          });
          const data = await response.json();
    
          if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to create space");
          }
    
          const newSpace = data.space;
          setSpaces((prev) => {
            const updatedSpaces: Space[] = prev ? [...prev, newSpace] : [newSpace];
            return updatedSpaces;
          });
          toast.success(data.message); 
        } catch (error: any) {
          toast.error(error.message || "Error Creating Space"); 
        }
      };

      const handleDeleteSpace = async (spaceId: string) => {
        try {
          const response = await fetch(`/api/spaces/?spaceId=${spaceId}`, {
            method: "DELETE",
          });
          const data = await response.json();
    
          if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to delete space");
          }
          setSpaces((prev) => {
            const updatedSpaces: Space[] = prev
              ? prev.filter((space) => space.id !== spaceId)
              : [];
            return updatedSpaces;
          });
          toast.success(data.message);
        } catch (error: any) {
          toast.error(error.message || "Error Deleting Space"); 
        }
      };
    
      const renderSpaces = useMemo(() => {
        if (isloading) {
          return (
            <>
              <div className="dark mx-auto h-[500px] w-full py-4 sm:w-[450px] lg:w-[500px]">
                <CardSkeleton />
              </div>
              <div className="dark mx-auto h-[500px] w-full py-4 sm:w-[450px] lg:w-[500px]">
                <CardSkeleton />
              </div>
            </>
          );
        }
    
        if (spaces && spaces.length > 0) {
          return spaces.map((space) => (
            <SpacesCard
              key={space.id}
              space={space}
              handleDeleteSpace={handleDeleteSpace}
            />
          ));
        }
      }, [isloading, spaces, handleDeleteSpace]);
      return (
        <div className="flex flex-col min-w-screen min-h-screen bg-black mx-auto"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(220, 236, 239, 0.2) 0.5px, transparent 0)`,
            backgroundSize: "8px 8px",
            backgroundRepeat: "repeat",
          }} 
          >ybackground
          <Appbar />
          <div className="relative flex flex-grow flex-col items-center  px-4 py-36">
            <WavyBackground
            className="fixed absolute min-w-screen w-max-screen min-h-screen mx-auto"
            containerClassName="min-w-screen min-h-screen"
            colors={["#9333EA", "#0EA5E9", "#2DD4BF", "#8B5CF6", "#4F46E5"]}
            waveWidth={100}
            backgroundFill="#000000"
            blur={5}
            speed="slow"
            waveOpacity={0.5}
          >
            <div className="flex flex-col items-center justify-center">
            <motion.div className=" rounded-xl">
              <StaggerText text={"spaces"}/>
            </motion.div>
            <Button
              onClick={() => {
                setIsCreatedSpaceOpen(true);
              }}
              className="mt-10 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Create a new Space
            </Button>
            </div>
          </WavyBackground>
    
            <div className="grid grid-cols-1 gap-8 p-4 md:grid-cols-2">
              {renderSpaces}
            </div>
          </div>
          <Dialog open={isCreatedSpaceOpen} onOpenChange={setIsCreatedSpaceOpen}>
            <DialogContent className=" border-w-4 border-gray-400 inset-shadow-sm inset-shadow-indigo-500 ring-4 hover:ring-blue-500 duration-300 ease-in-out">
              <DialogHeader>
                <DialogTitle className="mb-10 text-center text-gray-400/40">
                  Create new space
                </DialogTitle>
                <fieldset className="Fieldset">
                  <label
                    className="text-violet11 w-[90px] text-right text-xl font-bold text-gray-400/40 "
                    htmlFor="name"
                  >
                    Name of the Space
                  </label>
                  <input
                    className="text-violet11 shadow-violet7 focus:shadow-violet8 mt-5 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
                    id="name"
                    defaultValue="Pedro Duarte"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSpaceName(e.target.value);
                    }}
                  />
                </fieldset>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatedSpaceOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSpace}
                  className="bg-purple-600 text-white hover:bg-purple-700"
                >
                  Create Space
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
}



const StaggerText = ({ text }: { text: string }) => {

  return (
    <motion.div
      className="relative block overflow-hidden whitespace-nowrap text-4xl uppercase sm:text-7xl md:text-8xl lg:text-9xl"
      initial="initial"
      whileHover="hovered"
    >
              <div>
                {text.split("").map((l, i)=>{
                  return <motion.span
                  className="inline-block font-bold bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent"
                  variants={{
                    initial: {y: 0},
                    hovered: {y: "-100%"}
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeInOut",
                    delay: 0.025 * i,
                    
                  }}
                  key={i}
                  >
                    {l}
                  </motion.span>
                })}
              </div>
              <div className="absolute inset-0">
                {text.split("").map((l, i)=>{
                  return <motion.span
                  className="inline-block font-bold bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent"
                  variants={{
                    initial: {y: "100%"},
                    hovered: {y: 0}
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeInOut",
                    delay: 0.025 * i
                  }}
                  key={i}
                  >
                    {l}
                  </motion.span>
                })}
              </div>
    </motion.div>
  )
}