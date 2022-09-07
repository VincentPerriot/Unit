import { User, UserCreateInput } from "@generated/type-graphql";
import { Resolver, Mutation, Ctx, Arg } from "type-graphql";
import argon2 from "argon2";
import "reflect-metadata";


@Resolver(_of => User)
export class RegisterResolver {
    @Mutation(_returns => User)
    async register(
        @Ctx() { prisma, req }: any, 
        @Arg('options') options: UserCreateInput): Promise<User>{
        const hashedPassword = await argon2.hash(options.password)
        options.password = hashedPassword;
        
        const user =  await prisma.user.create({
            data:{
                ...options
            }
        });
        //login user after registration with session cookie
        req.session.userId=user.id

        return user;
    }
}
