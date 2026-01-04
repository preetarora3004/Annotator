"use client"

import { useProps } from "./store"

export const Background = () => {

    const {color, colorSetter} = useProps((s)=>({
        color : s.color,
        colorSetter : s.setColor
    }))

    return <div>
        <div className="text-xs py-2">
            Background
        </div>
        <div className="grid grid-cols-4 gap-1">
            <button onClick = {()=> colorSetter("pink")} className="bg-blue-900 rounded-sm w-6 h-6"></button>
            <button onClick = {()=> colorSetter("darkgreen")} className="rounded-sm bg-green-900 w-6 h-6"></button>
            <button className="rounded-sm bg-pink-900 w-6 h-6"></button>
            <button className="rounded-sm w-6 h-6 bg-amber-200">no</button>
        </div>
    </div>

}
