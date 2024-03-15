"use client";

import { useEffect, useState } from "react"

export default function Round({ gameState }) {
    const [round, setRound] = useState<number>(0)

    useEffect(() => {
        if (!gameState) {
            return
        }

        if (gameState.currentRound) {
            setRound(gameState.currentRound)
        }
    }, [gameState])

    return (
        <div>
            <p>Round: {round}</p>
        </div>
    )
}