"use client"

import { useProps } from './store'
import {shallow} from 'zustand/shallow'

export const Pencil = () => {

    const {toolSetter, activeTool} = useProps((s)=>({
        toolSetter : s.toolSetter,
        activeTool : s.activeTool
    }),shallow)

    return (<div>
        <button className={`p-2 rounded-md ${activeTool === 'pencil' ? "bg-[var(--color-bg)]" : "hover:bg-[var(--color-hover)]"}`}
            onClick={() =>
                toolSetter("pencil")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil-line-icon lucide-pencil-line"><path d="M13 21h8" /><path d="m15 5 4 4" /><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /></svg>
        </button>
    </div>)

}