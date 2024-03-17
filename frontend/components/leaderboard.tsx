import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
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
        <Box className="text-center">
            <Typography variant="h6">Leaderboard</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Player ID</TableCell>
                            <TableCell align="right">Points</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {players.map((player: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell component="th" scope="row">
                                    {player.id}
                                </TableCell>
                                <TableCell align="right">{player.points}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}