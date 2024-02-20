'use client'

import { useDraw } from "@/hooks/useDraw"

export default function Canvas() {
    const { canvasRef, onMouseDown, clear } = useDraw(drawLine)

    function drawLine({prevPoint, currentPoint, context}: Draw) {
        const { x: currX, y: currY } = currentPoint
        const lineColor = '#000'
        const lineWidth = 5

        let startPoint = prevPoint ?? currentPoint
        context.beginPath()
        context.lineWidth = lineWidth
        context.strokeStyle = lineColor
        context.moveTo(startPoint.x, startPoint.y)
        context.lineTo(currX, currY)
        context.stroke()

        context.fillStyle = lineColor
        context.beginPath()
        context.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI)
        context.fill()
    }

    return (
        <>
            <div className="w-full flex justify-center items-center">
                <canvas
                    ref={canvasRef}
                    onMouseDown={onMouseDown}
                    width={750}
                    height={750}
                    className="border border-black rounded-md"
                />
            </div>
            <div>
                <button type='button' className='p-2 rounded-md border border-black' onClick={clear}>
                    Clear canvas
                </button>
            </div>
        </>
    )
}
