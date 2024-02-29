import React from 'react';
import { AppBar, Button, Toolbar, Link } from '@mui/material';
import { login, signup } from '@/links/links';

export default function Navbar() {
    return (
        <AppBar position='relative' sx={{ mb: 4 }}>
            <Toolbar>
                <Link color="inherit" variant="h6" style={{ flexGrow: 1, textDecoration: 'none' }} href="/">
                    Skribbl
                </Link>
                <Button color="inherit" href={login}>Login</Button>
                <Button color="inherit" href={signup}>Sign Up</Button>
            </Toolbar>
        </AppBar>
    )
}