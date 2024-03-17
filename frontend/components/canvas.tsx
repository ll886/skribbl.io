'use client'

import { FC, useEffect, useState } from 'react'
import { useDraw } from '../hooks/useDraw'
import { CompactPicker } from 'react-color'
import { drawLine } from '../util/drawLine'

const page: FC<{}> = ({socket}) => {
  const [color, setColor] = useState<string>('#000');
  const [width, setWidth] = useState<number>(5);
  const { canvasRef, onMouseDown, clear } = useDraw(createLine)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')

    socket.on('canvasStateFromServer', (state: string) => {
      const img = new Image()
      img.src = state
      img.onload = () => {
        ctx?.drawImage(img, 0, 0)
      }
    })

    socket.on('drawLine', (prevPoint: Point, currentPoint: Point, color: string, width: number) => {
      if (!ctx) return console.log('no ctx here')
      drawLine({ prevPoint, currentPoint, ctx, color, width })
    })

    socket.on('clear', clear)

    return () => {
      socket.off('draw-line')
      socket.off('drawLine')
      socket.off('canvasStateFromServer')
      socket.off('clear')
    }
  }, [canvasRef])

  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit('drawLine', prevPoint, currentPoint, color, width)
    drawLine({ prevPoint, currentPoint, ctx, color, width })
    socket.emit('canvasState', canvasRef.current?.toDataURL())
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
        <div>
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
          <br></br>
          <button
            type="button"
            className="p-2 rounded-md border border-black"
            onClick={() => socket.emit('clear', clear)}
          >
            Clear canvas
          </button>
        </div>
      </div>
    </>
  )
}

export default page
