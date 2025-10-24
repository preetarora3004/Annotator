"use client"

import { useProps } from './store'
import { shallow } from 'zustand/shallow'

export const Line = () => {

    const { toolSetter } = useProps((s) => ({
        toolSetter: s.toolSetter
    }), shallow)

    return (<div>
        <button className="p-2 rounded-md hover:bg-[#F1F0FF]">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus-icon lucide-minus"><path d="M5 12h14" /></svg>
        </button>
    </div>)

}