"use client"

import { act } from 'react'
import { useProps } from './store'
import { shallow } from 'zustand/shallow'

export const Circles = () => {

    const { toolSetter, activeTool } = useProps((s) => ({
        toolSetter: s.toolSetter,
        activeTool : s.activeTool
    }), shallow)

    return (<div>
        <button onClick={() => {
            toolSetter('circle');
        }} className={`p-2 rounded-md ${activeTool === 'circle' ? "bg-[var(--color-bg)]" : "hover:bg-[var(--color-hover)]"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-icon lucide-circle"><circle cx="12" cy="12" r="10" /></svg>
        </button>   </div>)

}