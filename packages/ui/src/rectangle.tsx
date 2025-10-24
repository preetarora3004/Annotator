"use client"

import { useProps } from './store'
import { shallow } from 'zustand/shallow'

export const Rectangle = () => {

    const { toolSetter, activeTool } = useProps((s) => ({
        toolSetter: s.toolSetter,
        activeTool : s.activeTool
    }), shallow)

    return (<div>
        <button onClick={() => {
            toolSetter('rectangle')
        }} className={`p-2 rounded-md ${activeTool === 'rectangle' ? "bg-[var(--color-bg)] text-black" : "hover:bg-[var(--color-hover)]"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-icon lucide-square"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
        </button>
    </div>)

}