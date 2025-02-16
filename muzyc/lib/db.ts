import { PrismaClient } from "@prisma/client";

const prismaClientSingletion = () =>{
    return new PrismaClient();
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingletion>;

// eslint-disable-next-line
//globalThis is a Global object 
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

const prismaClient = globalForPrisma.prisma ?? prismaClientSingletion();

export default prismaClient;

if (process.env.NODE_ENV === "production") globalForPrisma.prisma = prismaClient;