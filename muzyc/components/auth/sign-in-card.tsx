"use client"
import { SignInFlow } from "@/types/auth-types";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { TriangleAlert } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { FaGithubAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface SigninCardProps {
    setFormType: (state: SignInFlow) => void;
}

export default function SigninCard({ setFormType: setState }: SigninCardProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setPending(true);
            setError("");

            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
                return;
            }

            router.push("/home");
            router.refresh();
        } catch (error) {
            setError("An unexpected error occurred");
            console.error(error);
        } finally {
            setPending(false);
        }
    };

    return (
        <Card className="border-none bg-[#161b22]/50 backdrop-blur-md shadow-xl">
            <CardContent className="space-y-6 p-6">
                {error && (
                    <div className="flex items-center gap-x-2 rounded-md bg-red-500/10 p-3 text-sm text-red-400">
                        <TriangleAlert className="h-4 w-4" />
                        <p>{error}</p>
                    </div>
                )}
                <form onSubmit={handleSignIn} className="space-y-4">
                    <Input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={pending}
                        required
                        className="border-gray-700 bg-gray-800/50 text-white"
                    />
                    <Input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={pending}
                        required
                        className="border-gray-700 bg-gray-800/50 text-white"
                    />
                    <Button
                        type="submit"
                        disabled={pending}
                        className="w-full bg-gradient-to-r from-[#00b894] to-[#4fd1c5]"
                    >
                        Sign In
                    </Button>
                </form>
                <Separator className="bg-gray-700" />
                <Button
                    onClick={() => signIn("github", { callbackUrl: "/home" })}
                    disabled={pending}
                    className="w-full bg-white text-black hover:bg-gray-100"
                >
                    <FaGithubAlt className="mr-2" />
                    Continue with GitHub
                </Button>
                <p className="text-center text-sm text-gray-400">
                    Don't have an account?{" "}
                    <button
                        onClick={() => setState("signUp")}
                        className="text-[#00b894] hover:underline"
                    >
                        Sign up
                    </button>
                </p>
            </CardContent>
        </Card>
    );
}

