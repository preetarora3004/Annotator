"use client"

import { useProps } from './store'
import { shallow } from 'zustand/shallow'

export const Select = () => {

    const { toolSetter, activeTool } = useProps((s) => ({
        toolSetter: s.toolSetter,
        activeTool : s.activeTool
    }), shallow)

    return (<div className="">
        <button
            onClick={() => {
                toolSetter('select')
            }}
            className={`p-2 rounded-md ${activeTool === 'select' ? "bg-[var(--color-bg)]" : "hover:bg-[var(--color-hover)]"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-scan-icon lucide-scan"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /></svg>
        </button>
    </div>)

}