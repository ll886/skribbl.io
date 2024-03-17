"use client";

import { Game } from "@/app/interfaces";
import socket from "@/app/socket";
import { useEffect, useState } from "react"

export default function Round({ gameState }: {gameState: Game | null}) {
    const [round, setRound] = useState<number>(0)

    useEffect(() => {
        if (!gameState) {
            return
        }

        if (gameState.currentRound) {
            setRound(gameState.currentRound)
        }

        socket.on("endGame", () => {
            setRound(-1)
        })
    }, [gameState])

    return (
        <div>
            <p>
                ROUND:&nbsp;
                {
                    round !== -1 ?
                    round
                    :
                    "END"
                }
            </p>
        </div>
    )
}