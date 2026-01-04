"use client"

import { createWithEqualityFn } from "zustand/traditional";

type toolType = "pencil" | "select" | "rectangle" | "circle" | "none"
type backgroundColor = "white" | "pink" | "lightgreen" | "red" | "none" | "darkblue" | "lightpink" | "darkgreen"
type stroke = 10 | 20 | 30 | 5 

type Store = {

    activeTool : toolType,
    activeStrokeColor : backgroundColor,
    activeStroke : stroke,
    activeColor : backgroundColor,

    tool : toolType,
    toolSetter : (tool : toolType)=> void

    color : backgroundColor,
    setColor : (color : backgroundColor) => void,

    strokeColor : backgroundColor,
    strokeColorSetter : (strokeColor : backgroundColor) => void

    stroke : stroke,
    strokeSetter : (stroke : stroke) => void

}

export const useProps = createWithEqualityFn<Store>((set)=>({

    tool: "select",
    activeTool : "none",
    activeStrokeColor : "none",
    activeColor : "none",

    toolSetter : (tool)=>{
        set({tool, activeTool : tool})
    },

    color : "none",
    setColor : (color)=>{
        set({color, activeColor : color })
    },

    strokeColor : "white",
    strokeColorSetter : (strokeColor)=>{
        set({strokeColor, activeStrokeColor : strokeColor});
    },

    stroke : 5,
    activeStroke : 5,
    strokeSetter(stroke){
        set({stroke, activeStroke : stroke});
    }

}))