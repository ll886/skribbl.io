import { useEffect, useState } from "react"

export default function Word({ socket }) {
    const [drawWord, setDrawWord] = useState<string>("")
    const [guessWord, setGuessWord] = useState<string>("")

    useEffect(() => {
        socket.on("updateGameState", () => {
            setDrawWord("")
            setGuessWord("")
        })

        socket.on("drawWordInfo", (word: string) => {
            setDrawWord(word.toUpperCase())
        })

        socket.on("guessWordInfo", (wordLength: number) => {
            let blank: string = ""
            for (let i=0; i<wordLength; i++) {
                blank += "_ "
            }
            setGuessWord(blank)
        })
    }, [])

    return (
        <div className="w-full">
            <p className="text-center">
                Word:&nbsp;
                {
                    drawWord ? 
                    drawWord
                    :
                    guessWord
                }
            </p>
        </div>
    )
}