"use client";

import { useEffect, useState } from "react"

export default function Round({ socket }) {
    const [round, setRound] = useState<number | "END">(0)

    useEffect(() => {
        socket.on("updateGameState", (updatedGameState) => {
            setRound(updatedGameState.currentRound)
        });

        socket.on("endGame", () => {
            setRound("END")
        })
    }, [socket])

    return (
        <div>
            <p>
                ROUND: {round}
            </p>
        </div>
    )
}