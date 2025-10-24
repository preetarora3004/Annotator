import NextAuth from 'next-auth'
import {authOption} from '@repo/utils'

const handler = NextAuth(authOption);

export {handler as GET, handler as POST}
