import { User } from "@generated/type-graphql";
import { Resolver, Mutation, Ctx, Arg, InputType, Field, ObjectType, Query } from "type-graphql";
import argon2 from "argon2";
import "reflect-metadata";


@InputType()
class LoginInput {
    @Field()
    email!: string;
    @Field()
    password!: string;
}

@ObjectType()
class FieldError{
    @Field()
    field!: string;
    @Field()
    message!: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => User, {nullable: true})
    user?: User
}


@Resolver(_of => User)
export class LoginResolver {
    @Query(() => User, {nullable: true})
    async me(
        @Ctx() { prisma, req }: any, 
    ){
        if(!req.session.userId){
            return null
        }
        const user = await prisma.user.findUnique({
            where: {
                id: req.session.userId,
            }
        })
        return user;
    }

    @Mutation(_returns => UserResponse)
    async login(
        @Ctx() { prisma, req }: any, 
        @Arg('input') input: LoginInput): Promise<UserResponse>{
            const user = await prisma.user.findUnique({
                where: {
                    email: input.email,
                }
            })
            if(!user){
                return {
                    errors: [{
                        field: "email",
                        message: "This email does not exist"
                    },
                ],
                };
            }
            const valid = await argon2.verify(user.password, input.password);

            if(!valid){
                return {
                    errors: [{
                        field: "password",
                        message: "Invalid Password"
                    },
                ],
                };   
            }

            req.session!.userId = user.id;

            return {
                user,
            };
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: any
    ){
        return new Promise((resolve) => req.session.destroy((err: any) => {
            if(err) {
                resolve(false)
                return 
            } 
            res.clearCookie('idc');
            resolve(true)
        }))
    }
}
