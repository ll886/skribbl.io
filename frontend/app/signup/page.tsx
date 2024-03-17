'use client'

import { Button, Container, List, ListItem, TextField, Typography } from "@mui/material"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/links/links"
import { loggedinRedirectHome } from "@/util/loggedin"
import { serverUrl } from "../config"
import Navbar from "@/components/navbar"

export default function Signup() {
    const router = useRouter()

    useEffect(() => {
        loggedinRedirectHome(router)
    }, [])

    const [email, setEmail] = useState<string>('')
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('')
    const [errors, setErrors] = useState<string[]>([])

    const onChange = () => {
        setErrors([])
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const data = {
            email: email,
            username: username,
            password: password,
            passwordConfirmation: passwordConfirmation,
        }

        await fetch(
            `${serverUrl}/api/signup/`, 
            {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                },
                body: JSON.stringify(data)
            }
        ).then(async (res) => {
            if (res.status === 200) {
                router.replace(login)
                return
            }

            const json = await res.json()

            if (json['errors']) {
                setErrors(json['errors'])
            }
        }).catch((err) => {
            console.error(err)
        })
    }

    return (
        <>
            <Navbar />
            <Container maxWidth="xs">
                <Typography variant="h4" align="center" gutterBottom>
                    Sign Up
                </Typography>
                <form onSubmit={handleSubmit} onChange={onChange}>
                    <TextField
                        label="Email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value)
                        }}
                        fullWidth
                        required
                        margin="normal"
                    />
                    <TextField
                        label="Username"
                        name="username"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value)
                        }}
                        fullWidth
                        required
                        margin="normal"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                        }}
                        fullWidth
                        required
                        margin="normal"
                    />
                    <TextField
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={passwordConfirmation}
                        onChange={(e) => {
                            setPasswordConfirmation(e.target.value)
                        }}
                        fullWidth
                        required
                        margin="normal"
                    />

                    <List>
                        {
                            errors.map((e, i) => 
                                <ListItem key={i} sx={{ color: "red" }}>
                                    {e}
                                </ListItem>
                            )
                        }
                    </List>

                    <Button
                        variant="outlined"
                        type="submit"
                        fullWidth
                    >
                        Sign Up
                    </Button>
                </form>
            </Container>
        </>
    )
}