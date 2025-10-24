"use client"

export const Color = () => {

    return (<div>
        <div className="text-xs py-2">
            Stroke
        </div>
        <div className="grid grid-cols-4 gap-1">
            <button className="rounded-sm bg-black"></button>
            <button className="rounded-sm bg-blue-600 text-blue-600">red</button>
            <button className="rounded-sm bg-green-700"></button>
            <button className="rounded-sm bg-red-600"></button>
        </div>
    </div>)

}