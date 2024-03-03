'use client'

import React, { ReactElement, useEffect, useState } from 'react';
import { AppBar, Button, Toolbar, Link } from '@mui/material';
import { home, login, signup } from '@/links/links';
import { serverUrl } from '@/app/config';


export default function Navbar() {
    const [authButtons, setAuthButtons] = useState<ReactElement>()

    useEffect(() => {
        const loggedin = async () => {
            await fetch(`${serverUrl}/loggedin`).then(async (res) => {
                const json = await res.json()
                return json
            }).then((json) => {
                if (json) {
                    setAuthButtons(<Button color="inherit" onClick={logout}>Logout</Button>)
                } else {
                    setAuthButtons(
                        <>
                            <Button color="inherit" href={login}>Login</Button>
                            <Button color="inherit" href={signup}>Sign Up</Button>
                        </>
                    )
                }
            }).catch((err) => {
                console.error(err)
            })
        }
    
        loggedin()
    }, [])

    const logout = async () => {
        await fetch(`${serverUrl}/logout`, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json',
            },
        }).then(async () => {
            window.location.reload();
        }).catch((err) => {
            console.error(err)
        })
    }

    return (
        <AppBar position='relative' sx={{ mb: 4 }}>
            <Toolbar>
                <Link color="inherit" variant="h6" style={{ flexGrow: 1, textDecoration: 'none' }} href={home}>
                    Skribbl
                </Link>
                {authButtons}
            </Toolbar>
        </AppBar>
    )
}