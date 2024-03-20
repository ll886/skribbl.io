import { Box, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { Socket } from "socket.io-client"

export default function Word({ socket }: {socket: Socket}) {
    const [drawWord, setDrawWord] = useState<string>("")
    const [guessWord, setGuessWord] = useState<string>("")

    useEffect(() => {
        socket.on("startPlayerRound", () => {
            setDrawWord("")
            setGuessWord("")
        })

        socket.on("drawWordInfo", (word: string) => {
            setDrawWord(word.toUpperCase())
        })

        socket.on("guessWordInfo", (wordLength: number) => {
            let blank: string = ""
            for (let i=0; i<wordLength; i++) {
                // Whitespaces are part of the guess word
                blank += "_ "
            }
            setGuessWord(blank)
        })
    }, [])

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h6" align="center">
                Word: {drawWord ? drawWord : guessWord}
            </Typography>
        </Box>
    )
}