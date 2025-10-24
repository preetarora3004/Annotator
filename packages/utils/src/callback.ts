import { CallbacksOptions } from "next-auth";
import { JWT } from "next-auth/jwt";

export const callbacks: Partial<CallbacksOptions> = {

    async jwt({ token, user }): Promise<JWT> {

        if (user) {
            return {
                ...token,
                accessToken: user.token,
                image: user.image ?? null,
                name: user.name ?? null,
                email: user.email ?? null,
                sub: user.id,
                username: user.username,
            }
        }

        return token;

    },
    async session({session, token}){
        if(session.user){
            session.user.token = token.accessToken as string,
            session.user.id = token.sub as string,
            session.user.username = token.username as string
        }

        return session;
    }

}