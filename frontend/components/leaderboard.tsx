import { useEffect, useState } from "react"

export default function Leaderboard({ gameState }) {
    const [players, setPlayers] = useState<any>([])

    useEffect(() => {
        if (!gameState) {
            return
        }

        if (gameState.players) {
            const playersArray = Object.values(gameState.players);
            const sortedDescending = playersArray.sort((a: any, b: any) => b.points - a.points);
            setPlayers(sortedDescending)
        }
    }, [gameState])

    return (
        <>
            <p>Leaderboard</p>
            <ul>
                {
                    players.map((player: any, index) => 
                        <li key={index}>{player.id} - {player.points}</li>
                    )
                }
            </ul>
        </>
    )
}