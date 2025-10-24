import { type NextAuthOptions } from "next-auth";
import { type JWT } from "next-auth/jwt";
import { prismaAdapter } from './prismaAdapter';
import { providers } from "./provider";
import { callbacks } from "./callback";
import jwt from 'jsonwebtoken'

export const authOption: NextAuthOptions = {

    adapter: prismaAdapter(),
    providers,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
    },

    jwt: {
        encode: async ({ token, secret, maxAge }): Promise<string> => {

            const fullToken = {
                sub: token?.sub!,
                accessToken : token?.accessToken ?? "",
                name: token?.name ?? token?.username ?? "User",
                email: token?.email ?? "",
                picture: token?.picture ?? "",
                username: token?.username ?? ""
            };

            return jwt.sign(fullToken as object, secret);
        },
        decode: async ({ token, secret }): Promise<JWT | null> => {

            if(!token) return null;
            try {
                const decoded = jwt.verify(token, secret) as JWT;
                return {
                    ...decoded,
                    // @ts-ignore
                    name: decoded.name ?? decoded.username ?? "User",
                    email: decoded.email ?? "",
                    picture: decoded.picture ?? "",
                };
            } catch (err) {
                console.error("JWT decode error:", err);
                return null;
            }
        }
    },

    callbacks,

    secret: process.env.NEXTAUTH_SECRET!

}