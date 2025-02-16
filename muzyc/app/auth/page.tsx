import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-options"
import AuthScreen from "@/components/auth/auth-Screen"

export default async function AuthPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    // Check if user is already authenticated
    const session = await getServerSession(authOptions)
    
    if (session) {
        redirect("/home")
    }

    return (
        <div>
            <AuthScreen 
            authType={searchParams.type === "signUp" ? "signUp" : "signIn"} 
            />
        </div>
    )
} 