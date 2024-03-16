import { useEffect, useState } from "react"

export default function Leaderboard({ gameState }) {
    const [playerOrder, setPlayerOrder] = useState<[]>()
    const [players, setPlayers] = useState({})

    useEffect(() => {
        if (!gameState) {
            return
        }

        if (gameState.playerOrder) {
            setPlayerOrder(gameState.playerOrder)
            console.log(gameState.playerOrder)
        }

        if (gameState.players) {
            setPlayers(gameState.players)
        }
    }, [gameState])

    return (
        <>
            <p className="h2">Leaderboard</p>
            <ul>
                {
                    playerOrder?.map((name, index) => 
                        <li key={index}>{players[name]["id"]} - {players[name]["points"]}</li>
                    )
                }
            </ul>
        </>
    )
}