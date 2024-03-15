import { useEffect, useState } from "react"

export default function Word({ socket }) {
    const [word, setWord] = useState<string>("")

    useEffect(() => {
        socket.on("updateGameState", () => {
            setWord("")
        })
        
        socket.on("drawWordInfo", (word: string) => {
            setWord(word)
        })
    }, [])

    return (
        <div>
            <p>Word: {word}</p>
        </div>
    )
}