"use client"

import { useProps } from './store'
import { shallow } from 'zustand/shallow'

export const Color = () => {

    const { color, setColor } = useProps((s) => ({
        color: s.color,
        setColor: s.colorSetter
    }), shallow)

    return (<div>
        <div className="text-xs py-2">
            Stroke
        </div>
        <div className="grid grid-cols-4 gap-1">
            <button onClick = {()=>{setColor('white')}} className="rounded-sm bg-white w-6 h-6"></button>
            <button onClick = {()=>{setColor('blue')}} className="rounded-sm bg-blue-600 w-6 h-6"></button>
            <button onClick = {()=>{setColor('green')}} className="rounded-sm bg-green-700 w-6 h-6"></button>
            <button onClick = {()=>{setColor('red')}} className="rounded-sm bg-red-600 w-6 h-6"></button>
        </div>
    </div>)

}