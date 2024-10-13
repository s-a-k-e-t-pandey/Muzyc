"use client"
import { SignInFlow } from "@/types/auth-types";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
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
  const router = useRouter();

  const signInWithProvider = async (provider: "github" | "credentials") => {
    try {
      if(provider === "credentials"){
        const res = signIn(provider, {
          redirect: false,
          callbackUrl: "/home",
        });
        res.then((res)=>{
          if(res?.error){
            setError(res.error);
          }
          if(!res?.error){
            router.push("/");
          }
          setPending(false);
        });
      }
      if(provider === "github"){
        const res = signIn(provider, {
          redirect: false,
          callbackUrl: "/home",
        });
        res.then((res)=>{
          if(res?.error){
            setError(res.error);
          }
          if(!res?.error){
            router.push("/");
          }
          setPending(false);
        })
      }
    }catch(e){
      console.error(e);
    }
  };


  const handlerCredentialsSignin = (e: React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    setError("");
    setPending(true);
    signInWithProvider("credentials");
  };

  const handlerGithubSignin = (provider: "github")=>{
    setError("");
    setPending(true);
    signInWithProvider("github");
  };
  

  return (
    <Card className="h-full w-full border-purple-600 bg-gray-800 bg-opacity-50 p-8">
      <CardHeader className="w-full">
        <CardTitle className="text-center text-3xl font-bold text-white">
          Login to Muzer
        </CardTitle>
      </CardHeader>
      {!!error && (
        <div className="mb-6 flex w-full items-center gap-x-2 rounded-md bg-destructive p-3 text-sm text-white">
          <TriangleAlert className="size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <CardContent className="space-y-6 px-0 pb-0">
        <form onSubmit={handlerCredentialsSignin} className="space-y-4">
          <Input
            disabled={pending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border-gray-400 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-purple-600 focus-visible:ring-offset-0"
            type="email"
            required
          />
          <Input
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="border-gray-400 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-purple-600 focus-visible:ring-offset-0"
            type="password"
            required
          />
          <Button
            disabled={pending}
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            size={"lg"}
          >
            Continue
          </Button>
        </form>
        <Separator className="bg-gradient-to-r from-gray-800 via-neutral-500 to-gray-800" />
        <div className="flex flex-col items-center gap-y-2.5">
          <Button
            disabled={pending}
            onClick={() => {
              handlerGithubSignin("github");
            }}
            size={"lg"}
            className="relative w-full bg-white text-black hover:bg-white/90"
          >
            <FaGithubAlt className="absolute left-2.5 top-3 size-5" />
            Continue with github
          </Button>
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <span
              className="cursor-pointer text-sky-700 hover:underline"
              onClick={() => setState("signUp")}
            >
              Sign up
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

