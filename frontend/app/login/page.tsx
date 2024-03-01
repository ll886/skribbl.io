'use client'

import { Button, Container, List, ListItem, TextField, Typography } from "@mui/material"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { home } from "@/links/links"

export default function Login() {
    const router = useRouter()

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [errors, setErrors] = useState<string[]>([])

    const onChange = () => {
        setErrors([])
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const data = {
            email: email,
            password: password,
        }

        const response = await fetch(
            'http://localhost:3000/login', 
            {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                },
                body: JSON.stringify(data)
            }
        ).then(async (res) => {
            if (res.status === 200) {
                router.replace(home)
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
        <Container maxWidth="xs">
            <Typography variant="h4" align="center" gutterBottom>
                Log In
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
                    Log In
                </Button>
            </form>
        </Container>
    )
}