"use client";

import { Box, Typography } from "@mui/material";
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
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1">
                ROUND: {round} / {rounds}
            </Typography>
        </Box>
    )
}