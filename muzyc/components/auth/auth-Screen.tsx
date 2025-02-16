"use client";
import { useState, useEffect } from "react";
import { SignInFlow } from "@/types/auth-types";
import SigninCard from "./sign-in-card";
import SignupCard from "./sign-up-card";
import { useSpring, animated } from "@react-spring/web";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export default function AuthScreen({authType} : {authType: SignInFlow}){
    const [formType, setFormType] = useState<SignInFlow>(authType);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setFormType(authType); 
    }, [authType]);

    const handleMouseMove = (event: React.MouseEvent) => {
        setMousePosition({
            x: event.clientX,
            y: event.clientY,
        });
    };

    const { backgroundPosition } = useSpring({
        backgroundPosition: `${mousePosition.x / 50}px ${mousePosition.y / 50}px`,
        config: { mass: 1, tension: 280, friction: 60 },
    });

    return (
        <div 
            className="min-h-screen bg-slate-800 text-white overflow-hidden flex items-center justify-center" 
            onMouseMove={handleMouseMove}
        >
            <animated.div
                className="fixed inset-0"
                style={{
                    background: "radial-gradient(circle at center, rgba(147, 51, 234, 0.3), rgba(0, 184, 148, 0.1))",
                    backgroundSize: "140% 140%",
                    backgroundPosition,
                    zIndex: 0,
                }}
            />
            
            <div className="fixed inset-0 bg-[url('/stars.png')] opacity-20 z-[1]" />
            
            <AnimatedBackground mousePosition={mousePosition} />

            <div className="relative z-[2] w-full max-w-md px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#00b894] to-[#4fd1c5] mb-2">
                        {formType === "signIn" ? "Welcome Back!" : "Join Muzyc"}
                    </h1>
                    <p className="text-gray-300">
                        {formType === "signIn" 
                            ? "Sign in to continue your journey" 
                            : "Create an account to get started"}
                    </p>
                </div>
                {formType === "signIn" ? (
                    <SigninCard setFormType={setFormType}/>
                ): (
                    <SignupCard setFormType={setFormType}/>
                )}
            </div>
        </div>
    );
}