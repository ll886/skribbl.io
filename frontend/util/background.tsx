import { Paper } from "@mui/material";

export default function Background({ children }) {
    return (
        <Paper elevation={0} sx={{ background: 'linear-gradient(45deg, #a1d4ff, #dab2ff)', minHeight: '100vh', }}>
            { children }
        </Paper>
    )
}