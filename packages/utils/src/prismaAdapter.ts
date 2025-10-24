import {PrismaAdapter} from '@next-auth/prisma-adapter'
import {client} from '@repo/db/index'

export function prismaAdapter(){

    const baseAdapter = PrismaAdapter(client);
    return {
        ...baseAdapter
    }

}



