type Draw = {
    context: CanvasRenderingContext2D
    currentPoint: Point
    prevPoint: Point | null
}

type Point = { x: number; y: number }
