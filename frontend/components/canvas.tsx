"use client";

import { useDraw } from "@/hooks/useDraw";
import { useState } from "react";
import { CompactPicker } from "react-color";

export default function Canvas() {
  const [color, setColor] = useState<string>('#000');
  const [width, setWidth] = useState<number>(5);
  const { canvasRef, onMouseDown, clear } = useDraw(drawLine);

  function drawLine({ prevPoint, currentPoint, context }: Draw) {
    const { x: currX, y: currY } = currentPoint;
    const lineColor = color;
    const lineWidth = width;

    let startPoint = prevPoint ?? currentPoint;
    context.beginPath();
    context.lineWidth = lineWidth;
    context.strokeStyle = lineColor;
    context.moveTo(startPoint.x, startPoint.y);
    context.lineTo(currX, currY);
    context.stroke();

    context.fillStyle = lineColor;
    context.beginPath();
    context.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI);
    context.fill();
  }

  return (
    <>
      <div className="w-full flex justify-center items-center mb-4">
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          width={750}
          height={750}
          className="border border-black rounded-md"
        />
      </div>
      <div className="w-full flex justify-center items-center">
        <div>
          <CompactPicker 
            color={color} 
            onChange={(e) => {
              setColor(e.hex)
              setWidth(5)
            }}
          />
        </div>
        <button
          type="button"
          className="p-2 rounded-md border border-black"
          onClick={() => {
            setColor('#FFF')
            setWidth(20)
          }}
        >
          Eraser
        </button>
        <button
          type="button"
          className="p-2 rounded-md border border-black"
          onClick={clear}
        >
          Clear canvas
        </button>
      </div>
    </>
  );
}
