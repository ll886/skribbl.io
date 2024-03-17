"use client";

import { useEffect, useState } from "react"

export default function Round({ socket }) {
    const [round, setRound] = useState<number | "END">(0)
    const [rounds, setRounds] = useState<number>(0)

    useEffect(() => {
        socket.on("updateGameState", (updatedGameState) => {
            setRound(updatedGameState.currentRound)
            setRounds(updatedGameState.rules.numRounds)
        });

        socket.on("endGame", () => {
            setRound("END")
        })
    }, [socket])

    return (
        <div>
            <p>
                ROUND: {round} / {rounds}
            </p>
        </div>
    )
}