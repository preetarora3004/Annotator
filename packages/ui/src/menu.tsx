"use client"

import { Color } from "./colorPalette"
import { Background } from "./background"

export const Menu = ()=>{

    return <div className="flex-col border-1 border-black grid grid-6 ml-2 px-3 py-1 rounded-xl">
        <div>
            <Color/>
        </div>

        <div>
            <Background />
        </div>
    </div>

}