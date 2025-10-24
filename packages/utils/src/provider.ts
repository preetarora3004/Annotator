import CredentialsProvider from "next-auth/providers/credentials";
import { client } from "@repo/db/index";
import jwt from 'jsonwebtoken'

export const providers = [

    CredentialsProvider({
        id : "credentials",
        name : "Credentials",

        credentials : {
            username : {label : "Username", type : "text", placeholder : "@gmail.com"},
            password : {label : "Password", type : "password", placholder : "****"}
        },

        async authorize(credentials : Record<string,string> | undefined){

            const {username, password} = credentials ?? {}

            if(!username || !password) return null;

            try{

                const user = await client.user.findUnique({
                    where : {
                        username : username
                    }
                })

                if(!user) return null;

                const token = jwt.sign({
                    id : user.id,
                    username : user.username
                },process.env.NEXTAUTH_SECRET!,{expiresIn : "1h"})

                return {
                    id : user.id,
                    username : user.username,
                    token
                }
            }catch(e){
                return null
            }
        }
    })
]