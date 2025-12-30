"use client"

export const StrokeWidth = () => {

    return <div>

        <div className="text-xs py-2">
            Stroke Width
        </div>

        <div className="grid grid-cols-4 gap-1">

            <button className="rounded-sm bg-green-900 w-6 h-6"></button>
            <button className="rounded-sm bg-pink-900 w-6 h-6"></button>
            <button className="rounded-sm w-6 h-6 bg-amber-200">no</button>

        </div>
    </div>

}