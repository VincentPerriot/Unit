import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main(){
    
    //write queries here
    const user = await prisma.user.findUnique({
        where: {
            email: "vincent@test.com"
        }
    })
    console.log(user)

}

main()
    .catch((e)=> {
        console.error(e.message)
    })
    .finally( async() => {
        await prisma.$disconnect();
    })