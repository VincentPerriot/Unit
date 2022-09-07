import { User } from "@generated/type-graphql";
import { Resolver, Mutation, Ctx, Arg, InputType, Field, ObjectType } from "type-graphql";
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


@Resolver()
export class LoginResolver {
    @Mutation(_returns => UserResponse)
    async login(
        @Ctx() { prisma }: any, 
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

            return user;
    }
}
