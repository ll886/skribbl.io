"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { serverUrl } from "./config";
import { Box, Button, TextField, Typography } from "@mui/material";
import Background from "@/util/background";

function Home() {
  const router = useRouter();
  const [guestId, setGuestId] = useState("");
  const [message, setMessage] = useState("");
  const [loggedin, setLoggedin] = useState(false);

  useEffect(() => {
    isLoggedIn();

    const guestId = Cookies.get("guestId");
    if (guestId) {
      setGuestId(guestId);
    } else {
      setMessage("Enter a name to play!");
    }
  }, []);

  const isLoggedIn = async () => {
    await fetch(`${serverUrl}/api/loggedin/`, {
      credentials: "include",
    })
      .then(async (res) => {
        const json: boolean = await res.json();
        setLoggedin(json);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value;
    setGuestId(newValue);
    Cookies.set("guestId", newValue);
    if (!newValue) {
      setMessage("Enter a name to play!");
    } else {
      setMessage("");
    }
  }

  return (
    <Background>
      <Navbar />
      <Box sx={{ textAlign: 'center', maxWidth: '400px', margin: 'auto' }}>
        <Typography variant="h2" gutterBottom>
            skribbl.io
        </Typography>
        {!loggedin && (
          <>
            <Typography variant="body1" gutterBottom>
              {message}
            </Typography>
            <TextField
              label="Player Name"
              variant="outlined"
              fullWidth
              value={guestId}
              onChange={handleInputChange}
              sx={{ marginBottom: '1rem' }}
            />
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(`/rooms/random`)}
            style={{ backgroundColor: '#2196f3' }}
          >
            Play!
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => router.push(`/MakeRoom`)}
            style={{ backgroundColor: '#9c27b0' }}
          >
            Create Private Room
          </Button>
        </Box>
      </Box>
    </Background>
  );
}

export default Home;
