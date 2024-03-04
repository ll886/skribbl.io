'use client'

import React, { useEffect, useState } from 'react';
import { AppBar, Button, Toolbar, Link } from '@mui/material';
import { home, login, signup } from '@/links/links';
import { serverUrl } from '@/app/config';


export default function Navbar() {
    const [loggedin, setLoggedin] = useState(false)

    useEffect(() => {
        const loggedin = async () => {
            await fetch(`${serverUrl}/loggedin`, {
                credentials: "include",
            }).then(async (res) => {
                const json: boolean = await res.json()
                setLoggedin(json)
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
            credentials: 'include',
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
                {
                    loggedin ?
                    <Button color="inherit" onClick={logout}>Logout</Button>
                    :
                    <>
                        <Button color="inherit" href={login}>Login</Button>
                        <Button color="inherit" href={signup}>Sign Up</Button>
                    </>
                }
            </Toolbar>
        </AppBar>
    )
}