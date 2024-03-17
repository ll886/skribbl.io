"use client";

import { useDraw } from "@/hooks/useDraw";
import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { CompactPicker } from "react-color";

export default function Canvas({ socket }) {
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
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
            <canvas
                ref={canvasRef}
                onMouseDown={onMouseDown}
                width={750}
                height={750}
                style={{ border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }}
            />
        </Box>
        {drawWord ? (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: '4px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }}
                    onClick={clear}
                >
                    Clear Canvas
                </Button>
            </Box>
        ) : null}
    </>
  );
}
