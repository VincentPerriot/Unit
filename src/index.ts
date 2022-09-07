import "reflect-metadata";
import { PrismaClient } from "@prisma/client";
import express from 'express'
import { ApolloServer } from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import { FindManyUserResolver, FindUniqueUserResolver } from "@generated/type-graphql";
import { RegisterResolver } from "./resolvers/RegisterResolver";
import { LoginResolver } from "./resolvers/LoginResolver";

export const prisma = new PrismaClient()

async function main(){

    //write queries here

    //Express Serv Here
    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [FindManyUserResolver, RegisterResolver, LoginResolver, FindUniqueUserResolver],
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