"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignInFlow } from "@/types/auth-types";
import { signIn } from "next-auth/react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { TriangleAlert } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Separator } from "@radix-ui/react-separator";
import { FaGithubAlt } from "react-icons/fa";


interface SignupCardProps {
    setFormType: (state: SignInFlow)=> void;
}

export default function SignupCard({setFormType: setState}: SignupCardProps){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);
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

    const signUpWithProvider = async (provider: "github" | "credentials") => {
        try {
            setPending(true);

            if (provider === "credentials") {
                // First create the user
                const createUserResponse = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                if (!createUserResponse.ok) {
                    const data = await createUserResponse.json();
                    throw new Error(data.error || 'Failed to sign up');
                }

                // Then sign in
                const res = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                    callbackUrl: "/home",
                });

                if (res?.error) {
                    setError(res.error);
                } else {
                    handleAuthSuccess();
                }
            }

            if (provider === "github") {
                const res = await signIn("github", {
                    redirect: false,
                    callbackUrl: "/home",
                });

                if (res?.error) {
                    setError(res.error);
                } else {
                    handleAuthSuccess();
                }
            }
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unexpected error occurred");
        } finally {
            setPending(false);
        }
    }

    const handleCredentialSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        await signUpWithProvider("credentials");
    }

    const handleGitHubSignUp = async () => {
        setError("");
        await signUpWithProvider("github");
    }

    return (
        <Card className="h-full w-full border-purple-600 bg-gray-800 bg-opacity-50 p-8">
      <CardHeader className="w-full">
        <CardTitle className="text-center text-3xl font-bold text-white">
          Signup to Start listening
        </CardTitle>
      </CardHeader>
      {!!error && (
        <div className="mb-6 flex w-full items-center gap-x-2 rounded-md bg-destructive p-3 text-sm text-white">
          <TriangleAlert className="size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <CardContent className="space-y-6 px-0 pb-0">
        <form className="space-y-4" onSubmit={handleCredentialSignup}>
          <Input
            disabled={pending}
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="border-gray-400 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-purple-600 focus-visible:ring-offset-0"
            type="email"
            required
          />
          <Input
            disabled={pending}
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="border-gray-400 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-purple-600 focus-visible:ring-offset-0"
            type="password"
            required
          />
          <Input
            disabled={pending}
            value={confirmPassword}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border-gray-400 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-purple-600 focus-visible:ring-offset-0"
            type="password"
            required
          />
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            size={"lg"}
            disabled={pending}
          >
            Continue
          </Button>
        </form>
        <Separator className="bg-gradient-to-r from-gray-800 via-neutral-500 to-gray-800" />
        <div className="flex flex-col items-center gap-y-2.5">
          <Button
            disabled={pending}
            onClick={handleGitHubSignUp}
            size={"lg"}
            className="relative w-full bg-white text-black hover:bg-white/90"
          >
            <FaGithubAlt className="absolute left-2.5 top-3 size-5" />
            Continue with google
          </Button>
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <span
              className="cursor-pointer text-sky-700 hover:underline"
              onClick={() => setState("signIn")}
            >
              Sign in
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
    )
}