'use client'

import Canvas from "@/components/canvas"

export default function Room() {
    return (
        <>
            <div className="w-screen h-screen bg-white flex flex-wrap justify-center items-center">
                {Canvas()}
            </div>
        </>
    )
}
