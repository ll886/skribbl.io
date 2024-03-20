"use client";

import { drawLine } from "../util/drawLine";

import { useDraw } from "@/hooks/useDraw";
import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { CompactPicker } from "react-color";
import { Socket } from "socket.io-client";

export default function Canvas({ socket }: {socket: Socket}) {
  const [color, setColor] = useState<string>('#000');
  const [width, setWidth] = useState<number>(5);
  const { canvasRef, onMouseDown, clear } = useDraw(createLine);
  const [drawWord, setDrawWord] = useState("");

  useEffect(() => {
    socket.on("guessWordInfo", () => {
      setDrawWord("");
    });

    socket.on("drawWordInfo", (word: string) => {
      setDrawWord(word);
    });
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    socket.on("canvasStateFromServer", (state: string) => {
      const img = new Image();
      img.src = state;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
    });

    socket.on(
      "drawLine",
      (prevPoint: Point, currentPoint: Point, color: string, width: number) => {
        if (!ctx) return console.log("no ctx here");
        drawLine({ prevPoint, currentPoint, ctx, color, width });
      }
    );

    socket.on("clear", clear);

    return () => {
      socket.off("drawLine");
      socket.off("canvasStateFromServer");
      socket.off("clear");
    };
  }, [canvasRef]);

  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit("drawLine", prevPoint, currentPoint, color, width);
    drawLine({ prevPoint, currentPoint, ctx, color, width });
    socket.emit("canvasState", canvasRef.current?.toDataURL());
  }

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={drawWord ? onMouseDown : () => {}}
          width={750}
          height={750}
          style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        />
      </Box>
      {drawWord ? (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>
            <CompactPicker
              color={color}
              onChange={(e) => {
                setColor(e.hex);
                setWidth(5);
              }}
            />
          </div>
          <Button
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: "4px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            }}
            onClick={() => socket.emit("clear")}
          >
            Clear Canvas
          </Button>

          <Button
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: "4px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            }}
            onClick={() => {
              setColor("#FFF");
              setWidth(20);
            }}
          >
            Eraser
          </Button>
        </Box>
      ) : null}
    </>
  );
}
