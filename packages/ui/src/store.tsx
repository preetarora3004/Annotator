"use client"

import { createWithEqualityFn } from "zustand/traditional";

type toolType = "pencil" | "select" | "rectangle" | "circle" | "none"

type Store = {

    activeTool : toolType,

    tool : toolType,
    toolSetter : (tool : toolType)=> void

}

export const useProps = createWithEqualityFn<Store>((set)=>({

    tool: "select",
    activeTool : "none",

    toolSetter : (tool)=>{
        set({tool, activeTool : tool})
    }

}))