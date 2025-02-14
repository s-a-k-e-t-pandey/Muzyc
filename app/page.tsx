"use client"
import { Appbar } from "../components/AppBar"
import Link from "next/link"
import { motion } from "framer-motion"
import { useSpring, animated } from "@react-spring/web"
import { useEffect, useState } from "react"
import { AnimatedBackground } from "@/components/AnimatedBackground"

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Handle mouse movement for background animation
  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY,
    })
  }

  // Animated gradient background
  const { backgroundPosition } = useSpring({
    backgroundPosition: `${mousePosition.x / 50}px ${mousePosition.y / 50}px`,
    config: { mass: 1, tension: 280, friction: 60 },
  })

  return (
    <div className="min-h-screen bg-slate-800 text-white overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Moonlight gradient background */}
      <animated.div
        className="fixed inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(147, 51, 234, 0.3), rgba(0, 184, 148, 0.1))",
          backgroundSize: "140% 140%",
          backgroundPosition,
          zIndex: 0,
        }}
      />
      
      {/* Animated stars */}
      <div className="fixed inset-0 bg-[url('/stars.png')] opacity-20 z-[1]" />
      
      {/* Animated rhythm icons */}
      <AnimatedBackground mousePosition={mousePosition} />
      
      <div className="relative z-[2]">
        <header className="fixed top-0 left-0 right-0 w-full z-50 px-4 lg:px-6 h-14 backdrop-blur-md bg-[#0d1117]/50 border-b border-[#161b22]/50">
          <Appbar />
        </header>
        <main className="pt-14">
          <section className="w-full h-[80vh] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117]/80 to-transparent z-10" />
            <video 
              src="/hero-video.mp4" 
              autoPlay 
              loop 
              muted 
              className="w-full h-full object-cover brightness-75" 
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 md:px-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#00b894] to-[#4fd1c5]"
              >
                Let Your Fans Choose the Music
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-[600px] text-lg md:text-xl text-gray-300 mt-4 text-center"
              >
                Tune In is the ultimate music streaming platform for creators to let their fans control the music on their
                live streams.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-8"
              >
                <Link
                  href="#"
                  className="relative inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#00b894] to-[#4fd1c5] px-8 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[#00b894]/50 focus-visible:outline-none"
                  prefetch={false}
                >
                  <span className="relative z-10">Sign Up as a Creator</span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00b894] to-[#4fd1c5] opacity-0 hover:opacity-100 transition-opacity blur-xl" />
                </Link>
              </motion.div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 backdrop-blur-md bg-[#161b22]/50">
            <div className="container px-4 md:px-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center justify-center space-y-4 text-center"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-[#00b894] to-[#4fd1c5]">
                    Featured Creators
                  </h2>
                  <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Check out some of the top creators on Tune In and let their fans choose the music.
                  </p>
                </div>
              </motion.div>
              
              <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                {[
                  { icon: "🎤", name: "DJ Beats", genre: "Electronic Music" },
    
                  { icon: "🎸", name: "Rock Legends", genre: "Rock Music" },
                  { icon: "🎹", name: "Piano Prodigy", genre: "Classical Music" }
                ].map((creator, index) => (
                  <motion.div
                    key={creator.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-center justify-center space-y-4 p-6 rounded-xl backdrop-blur-md bg-[#161b22]/50 border border-[#00b894]/20"
                  >
                    <div className="rounded-full bg-gradient-to-r from-[#00b894] to-[#4fd1c5] w-24 h-24 flex items-center justify-center text-4xl shadow-lg">
                      {creator.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">{creator.name}</h3>
                      <p className="text-gray-400">{creator.genre}</p>
                    </div>
                    <Link
                      href="#"
                      className="inline-flex h-9 items-center justify-center rounded-full bg-gradient-to-r from-[#00b894] to-[#4fd1c5] px-6 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[#00b894]/50"
                      prefetch={false}
                    >
                      View Stream
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>
        
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-[#161b22] backdrop-blur-md bg-[#0d1117]/50">
          <p className="text-xs text-gray-400">&copy; 2024 Tune In. All rights reserved.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:text-[#00b894] transition-colors duration-200" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="#" className="text-xs hover:text-[#00b894] transition-colors duration-200" prefetch={false}>
              Privacy
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  )
}
