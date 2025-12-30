"use client"

import { createWithEqualityFn } from "zustand/traditional";

type toolType = "pencil" | "select" | "rectangle" | "circle" | "none"
type backgroundColor = "white" | "blue" | "green" | "red" | "none"
type stroke = 10 | 20 | 30 | 5 

type Store = {

    activeTool : toolType,
    activeColor : backgroundColor,
    activeStroke : stroke

    tool : toolType,
    toolSetter : (tool : toolType)=> void

    color : backgroundColor,
    colorSetter : (color : backgroundColor) => void

    stroke : stroke,
    strokeSetter : (stroke : stroke) => void

}

export const useProps = createWithEqualityFn<Store>((set)=>({

    tool: "select",
    activeTool : "none",

    toolSetter : (tool)=>{
        set({tool, activeTool : tool})
    },

    color : "white",
    activeColor : "none",

    colorSetter : (color)=>{
        set({color, activeColor : color});
    },

    stroke : 5,
    activeStroke : 5,
    strokeSetter(stroke){
        set({stroke, activeStroke : stroke});
    }

}))