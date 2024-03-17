import { useEffect, useState } from "react"
import { Game } from "@/app/interfaces"

export default function Leaderboard({ gameState }: {gameState: Game | null}) {
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
                    players.map((player: any, index: number) => 
                        <li key={index}>{player.id} - {player.points}</li>
                    )
                }
            </ul>
        </>
    )
}