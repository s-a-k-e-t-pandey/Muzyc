"use client"
import { SignInFlow } from "@/types/auth-types";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TriangleAlert } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Separator } from "@radix-ui/react-separator";
import { FaGithubAlt } from "react-icons/fa";


interface SigninCardProps{
  setFormType: (state: SignInFlow)=> void
}


export default function SigninCard({setFormType: setState}: SigninCardProps){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuthSuccess = () => {
    if (mounted) {
      router.push("/home");
      router.refresh();
    }
  };

  const signInWithProvider = async (provider: "github" | "credentials") => {
    try {
      setPending(true);
      const res = await signIn(provider, {
        redirect: false,
        callbackUrl: "/home",
        ...(provider === "credentials" && { email, password }),
      });

      if (res?.error) {
        setError(res.error);
      } else {
        handleAuthSuccess();
      }
    } catch (e) {
      console.error(e);
      setError("An unexpected error occurred");
    } finally {
      setPending(false);
    }
  };

  const handlerCredentialsSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    await signInWithProvider("credentials");
  };

  const handlerGithubSignin = async () => {
    setError("");
    await signInWithProvider("github");
  };
  

  return (
    <Card className="border-none bg-[#161b22]/50 backdrop-blur-md shadow-xl">
      <CardContent className="space-y-6 p-6">
        {!!error && (
          <div className="flex items-center gap-x-2 rounded-md bg-red-500/10 p-3 text-sm text-red-400">
            <TriangleAlert className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handlerCredentialsSignin} className="space-y-4">
          <Input
            disabled={pending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-400 focus-visible:ring-[#00b894] focus-visible:ring-offset-0"
            type="email"
            required
          />
          <Input
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-400 focus-visible:ring-[#00b894] focus-visible:ring-offset-0"
            type="password"
            required
          />
          <Button
            disabled={pending}
            type="submit"
            className="w-full bg-gradient-to-r from-[#00b894] to-[#4fd1c5] hover:from-[#00b894]/90 hover:to-[#4fd1c5]/90 transition-all duration-300"
            size="lg"
          >
            Continue
          </Button>
        </form>
        <Separator className="bg-gray-700" />
        <div className="space-y-4">
          <Button
            disabled={pending}
            onClick={handlerGithubSignin}
            size="lg"
            className="w-full relative bg-white text-black hover:bg-white/90"
          >
            <FaGithubAlt className="absolute left-3 h-5 w-5" />
            Continue with GitHub
          </Button>
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={() => setState("signUp")}
              className="text-[#00b894] hover:underline focus:outline-none"
            >
              Sign up
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

