import nextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import {prismaClient} from "../../../lib/db";


const handler = nextAuth({
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID ?? "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
        }),
    ],
    callbacks: {
        async signIn(params){
            if(!params.user.email){
                return false
            }
            console.log(params)
            try{
                await prismaClient.user.create({
                    data:{
                        email: params.user.email ?? "",
                        provider: "GitHub", 
                        role: "User" ?? "Admin"
                    }
                })
            }catch(e){
                console.log(e)
            }
            return true;
        },
        }
})

export {handler as POST, handler as GET}