"use client"

import { Color } from "./colorPalette"
import { Background } from "./background"
import { StrokeWidth } from "./strokeWidth"

export const Menu = ()=>{

    return <div className="flex-col border-1 border-[#232329] text-white font-medium bg-menu grid grid-6 ml-2 px-3 py-1 rounded-xl">
        <div>
            <Color/>
        </div>

        <div>
            <Background />
        </div>

        <div>
            <StrokeWidth/>
        </div>
    </div>

}