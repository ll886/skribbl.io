"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { serverUrl } from "./config";

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
    await fetch(`${serverUrl}/api/loggedin`, {
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
    <>
      <Navbar />
      <div>
        <h1>skribbl.io</h1>
        {loggedin ? null : (
          <>
            <div>{message}</div>
            <label>
              Player Name
              <input type="text" value={guestId} onChange={handleInputChange} />
            </label>
          </>
        )}

        <div>
          <button
            onClick={() => {
              router.push(`/rooms/random`);
            }}
          >
            Play!
          </button>
          <button
            onClick={() => {
              router.push(`/MakeRoom`);
            }}
          >
            Create Private Room
          </button>
        </div>
      </div>
    </>
  );
}

export default Home;
