"use client";

import { useDraw } from "@/hooks/useDraw";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export default function Canvas({ socket }: {socket: Socket}) {
  const [color, setColor] = useState<string>('#000');
  const [width, setWidth] = useState<number>(5);
  const { canvasRef, onMouseDown, clear } = useDraw(drawLine);
  const [drawWord, setDrawWord] = useState("")

  useEffect(() => {
    socket.on("updateGameState", () => {
        setDrawWord("")
    })

    socket.on("drawWordInfo", (word: string) => {
        setDrawWord(word)
    })
  })

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
      {
        drawWord ?
        <div className="w-full flex justify-center items-center">
          <button
            type="button"
            className="p-2 rounded-md border border-black"
            onClick={clear}
          >
            Clear canvas
          </button>
        </div>
        :
        <></>
      }
    </>
  );
}
