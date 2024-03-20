"use client";
import React, { useState } from "react";
import "./MakeRoom.css";
import { serverUrl } from "../config";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Typography } from "@mui/material";
import Background from "@/util/background";

const MakeRoom: React.FC = () => {
    const router = useRouter();

    const [drawTime, setDrawTime] = useState<number>(20);
    const [numRounds, setNumRounds] = useState<number>(2);
    const [isPrivate, setIsPrivate] = useState<boolean>(false);


    const handleDrawTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDrawTime(parseInt(e.target.value));
    };

    const handleNumRoundsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNumRounds(parseInt(e.target.value));
    };

    const handlePrivateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsPrivate(e.target.checked);
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${serverUrl}/api/rooms/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    drawTime: drawTime,
                    numRounds: numRounds,
                    isPrivate: isPrivate,
                })
            });

            if (!response.ok) {
                throw new Error("Failed to create room");
            }
            const data = await response.json();
            router.push(`/rooms/${data.id}`);
        } catch (error) {
            console.error("Error creating room. ", error);
        }
    };

    return (
        <Background>
            <Navbar />

            <div className="drawing-room-container">
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ marginRight: '10px' }}>Draw Time:</label>
                    <select value={drawTime} onChange={handleDrawTimeChange}>
                        {[...Array(11)].map((_, index) => (
                            <option key={index} value={(20 + index * 10).toString()}>
                                {20 + index * 10} seconds
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ marginRight: '10px' }}>Rounds:</label>
                    <select value={numRounds} onChange={handleNumRoundsChange}>
                        {[...Array(4)].map((_, index) => (
                            <option key={index} value={(index + 2).toString()}>
                                {index + 2}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ marginRight: '10px' }}>Private:</label>
                    <input type="checkbox" checked={isPrivate} onChange={handlePrivateChange} />
                </div>
                <button onClick={handleSubmit} style={{ display: 'block', width: '100%', padding: '10px', backgroundColor: '#2196f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create Room</button>
            </div>
        </Background>
    );
};

export default MakeRoom;
