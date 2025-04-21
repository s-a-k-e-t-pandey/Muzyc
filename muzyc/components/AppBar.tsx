"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { PiMusicNoteFill } from "react-icons/pi";
import { motion } from "framer-motion";

export function Appbar({ showThemeSwitch = true, isSpectator = false }) {
  const session = useSession();
  const router = useRouter();

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex justify-between items-center h-full w-full pt-2 px-2"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        onClick={() => router.push("/")}
        className="flex flex-row items-center justify-center space-x-2 hover:cursor-pointer"
      >
        <span className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Muzyc
        </span>
        <div className="flex items-center">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <PiMusicNoteFill className="text-2xl text-cyan-400" />
          </motion.div>
          <motion.div
            animate={{
              rotate: [0, -10, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5,
            }}
          >
            <PiMusicNoteFill className="text-lg text-purple-500" />
          </motion.div>
        </div>
      </motion.div>

      <div className="flex items-center gap-x-4">
        {isSpectator && (
          <motion.div whileHover={{ scale: 1.05 }}>
            <WalletMultiButton />
          </motion.div>
        )}
        
        {session.data?.user ? (
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 rounded-full sm:2pl px-6"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logout
            </Button>
          </motion.div>
        ) : (
          <div className="space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
              <Button
                className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 rounded-full px-6"
                onClick={() => router.push("/auth")}
              >
                Signin
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
              <Link
                href="/auth?type=signUp"
              >
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 rounded-full px-6 border border-purple-500/30"
                >
                  Signup
                </Button>
              </Link>
            </motion.div>
          </div>
        )}
        
        {showThemeSwitch && (
          <motion.div className="text-gray-400/40" whileHover={{ scale: 1.05 }}>
            <ThemeSwitcher />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}