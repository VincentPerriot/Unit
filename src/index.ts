import "reflect-metadata";
import { PrismaClient } from "@prisma/client";
import express from 'express'
import { ApolloServer } from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import { resolvers } from "@generated/type-graphql";


export const prisma = new PrismaClient()

async function main(){

    //write queries here

    //Express Serv Here
    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers,
            validate: false,
        }),
        context: () => ({ prisma }),
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({app});

    app.listen(4000, () => {
        console.log('server listening on port 4000')
    })

}

main()
    .catch((e)=> {
        console.error(e.message)
    })
    .finally( async() => {
        await prisma.$disconnect();
    })