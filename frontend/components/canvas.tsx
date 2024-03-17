'use client'

import { FC, useEffect, useState } from 'react'
import { useDraw } from '../hooks/useDraw'
import { ChromePicker } from 'react-color'

import { io } from 'socket.io-client'
import { drawLine } from '../util/drawLine'

// temporary holder, we can pass this socket in line #21
// const socket = io('http://localhost:3001')

interface pageProps {}

type DrawLineProps = {
  prevPoint: Point | null
  currentPoint: Point
  color: string
}

const page: FC<pageProps> = ({socket}) => {
  const [color, setColor] = useState<string>('#000')
  const { canvasRef, onMouseDown, clear } = useDraw(createLine)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')

    socket.on('get-canvas-state', () => {
      if (!canvasRef.current?.toDataURL()) return
      console.log('sending canvas state')
    })

    socket.on('canvasStateFromServer', (state: string) => {
      console.log('I received the state')
      const img = new Image()
      img.src = state
      img.onload = () => {
        ctx?.drawImage(img, 0, 0)
      }
    })

    socket.on('drawLine', (prevPoint: Point, currentPoint: Point, color: string) => {
      if (!ctx) return console.log('no ctx here')
      drawLine({ prevPoint, currentPoint, ctx, color })
    })

    socket.on('clear', clear)

    return () => {
      socket.off('drawLine')
      socket.off('get-canvas-state')
      socket.off('canvasStateFromServer')
      socket.off('clear')
    }
  }, [canvasRef])

  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit('drawLine', prevPoint, currentPoint, color)
    drawLine({ prevPoint, currentPoint, ctx, color })
    socket.emit('canvasState', canvasRef.current?.toDataURL())
  }

  return (
    <div className='w-full flex justify-center items-center mb-4'>
      <div className='flex flex-col gap-10 pr-10'>
        <ChromePicker color={color} onChange={(e) => setColor(e.hex)} />
        <button
          type='button'
          className='p-2 rounded-md border border-black'
          onClick={() => socket.emit('clear')}>
          Clear Drawing
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        width={750}
        height={750}
        className='border border-black rounded-md'
      />
    </div>
  )
}

export default page
