"use client"
import { motion } from "framer-motion"
import { BsMusicNote, BsMusicNoteBeamed } from "react-icons/bs"
import { PiMusicNotesSimpleFill, PiMusicNotesFill, PiWaveformFill } from "react-icons/pi"
import { useEffect, useState } from "react"

// Define a set of complementary colors for the icons
const iconColors = [
  'rgb(0, 184, 148)', // emerald
  'rgb(79, 209, 197)', // cyan
  'rgb(147, 51, 234)', // purple
  'rgb(59, 130, 246)', // blue
  'rgb(236, 72, 153)', // pink
]

const icons = [
  BsMusicNote,
  BsMusicNoteBeamed,
  PiMusicNotesSimpleFill,
  PiMusicNotesFill,
  PiWaveformFill,
]

interface BackgroundIconProps {
  Icon: React.ElementType
  mousePosition: { x: number; y: number }
  index: number
  top: number
  left: number
  color: string
}

const BackgroundIcon = ({ Icon, mousePosition, index, top, left, color }: BackgroundIconProps) => {
  const distance = Math.sqrt(
    Math.pow(mousePosition.x - left, 2) + Math.pow(mousePosition.y - top, 2)
  )
  const maxDistance = 400
  const effect = Math.max(0, 1 - distance / maxDistance)

  // Create a more vibrant glow effect
  const glowColor = color.replace('rgb', 'rgba').replace(')', ', 0.8)')
  const shadowColor = color.replace('rgb', 'rgba').replace(')', ', 0.4)')

  return (
    <motion.div
      className="absolute"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 1,
      }}
      animate={{
        scale: 1 + effect * 0.4,
        rotate: effect * (index % 2 ? 25 : -25),
        opacity: 0.4 + effect * 0.6,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 10,
      }}
    >
      <motion.div
        animate={{
          filter: [
            `drop-shadow(0 0 ${10 + effect * 20}px ${glowColor})`,
            `drop-shadow(0 0 ${15 + effect * 25}px ${shadowColor})`,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <Icon 
          style={{
            color: color,
            fontSize: 32 + index % 3 * 16,
            filter: `brightness(1.2)`,
          }}
        />
      </motion.div>
    </motion.div>
  )
}

export function AnimatedBackground({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const [backgroundIcons, setBackgroundIcons] = useState<{ 
    Icon: React.ElementType; 
    top: number; 
    left: number;
    color: string;
  }[]>([])

  useEffect(() => {
    const generateIcons = () => {
      const newIcons = []
      const numIcons = 45 // Slightly increased number of icons
      
      for (let i = 0; i < numIcons; i++) {
        newIcons.push({
          Icon: icons[Math.floor(Math.random() * icons.length)],
          top: Math.random() * (window.innerHeight - 100),
          left: Math.random() * (window.innerWidth - 100),
          color: iconColors[Math.floor(Math.random() * iconColors.length)],
        })
      }
      
      setBackgroundIcons(newIcons)
    }

    generateIcons()
    window.addEventListener('resize', generateIcons)
    
    return () => {
      window.removeEventListener('resize', generateIcons)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {backgroundIcons.map((icon, index) => (
        <BackgroundIcon
          key={index}
          Icon={icon.Icon}
          mousePosition={mousePosition}
          index={index}
          top={icon.top}
          left={icon.left}
          color={icon.color}
        />
      ))}
    </div>
  )
} 