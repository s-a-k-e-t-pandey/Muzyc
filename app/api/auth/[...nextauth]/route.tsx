import nextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const handler = nextAuth({
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID ?? "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
        }),
    ],
})

export {handler as POST, handler as GET}