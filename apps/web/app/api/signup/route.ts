import { client } from "@repo/db/index";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest): Promise<Response> {

    const { username, password } = await req.json();

    if (!username || !password) {
        return Response.json({ msg: "Invalid username or password" }, { status: 400 });
    }

    try {
        
        const existing = await client.user.findUnique({
            where: {
                username: username 
            }
        });

        if (existing) {
            return Response.json({ msg: "Username already taken" }, { status: 409 });
        }
        
        const user = await client.user.create({
            data: {
                username,
                password 
            }
        });
        
        return Response.json({ msg: "User created successfully", userId: user.id }, { status: 201 });

    } catch (e) {
        console.error("Signup Error:", e);
        
        return Response.json({ msg: "Unable to register user" }, { status: 500 });
    }
}