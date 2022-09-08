import "reflect-metadata";
import { __prod__ } from "./constants";
import { PrismaClient } from "@prisma/client";
import express from 'express'
import { ApolloServer } from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import { FindManyUserResolver, FindUniqueUserResolver } from "@generated/type-graphql";
import { RegisterResolver } from "./resolvers/RegisterResolver";
import { LoginResolver } from "./resolvers/LoginResolver";
import session from "express-session";
import connectRedis from "connect-redis";
import * as redis from "redis";
import cors from "cors";


export const prisma = new PrismaClient()


async function main(){

    //write queries here



    //Express Serv Here
    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient({ legacyMode: true });
    await redisClient.connect().catch(console.error);

    app.use(cors({
        origin: ['http://localhost:3000','https://studio.apollographql.com'],
        credentials: true,
    }));

    app.use(
        session({
          name: "idc",
          store: new RedisStore({
            client: redisClient,
            disableTouch: true,
        }),
          cookie:{
            maxAge: 1000*60*60*24*7, //1week
            httpOnly: true,
            secure: __prod__, // https
            sameSite: "lax", //csrf
          },
          saveUninitialized: false,
          secret: "sddfgdfghdf",
          resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [FindManyUserResolver, RegisterResolver, LoginResolver, FindUniqueUserResolver],
            validate: false,
        }),
        context: ({req, res}) => ({ prisma, req, res }),
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({
        app,
        cors: false,
    });

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