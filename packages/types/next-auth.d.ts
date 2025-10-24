import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      token : string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    username : string;
    token : string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub : string;
    username: string;
    accessToken : string;
    name? : string | null;
    email? : string | null;
    image? : string | null;

  }
}
