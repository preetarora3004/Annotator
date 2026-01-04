"use client"

import { useProps } from './store'
import { shallow } from 'zustand/shallow'

export const Color = () => {

    const { strokeColor, strokeColorSetter } = useProps((s) => ({
        strokeColor: s.activeStrokeColor,
        strokeColorSetter: s.strokeColorSetter
    }), shallow)

    return (<div>
        <div className="text-xs py-2">
            Stroke
        </div>
        <div className="grid grid-cols-4 gap-1">
            <button onClick = {()=>{strokeColorSetter('white')}} className="rounded-sm bg-white w-6 h-6"></button>
            <button onClick = {()=>{strokeColorSetter('lightpink')}} className="rounded-sm bg-pink-500 w-6 h-6"></button>
            <button onClick = {()=>{strokeColorSetter('lightgreen')}} className="rounded-sm bg-green-700 w-6 h-6"></button>
            <button onClick = {()=>{strokeColorSetter('red')}} className="rounded-sm bg-red-600 w-6 h-6"></button>
        </div>
    </div>)

}