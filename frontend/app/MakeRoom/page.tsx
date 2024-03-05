"use client";
import React, { useState } from "react";
import "./MakeRoom.css";
import { serverUrl } from "../config";
import { useRouter } from "next/navigation";

const MakeRoom: React.FC = () => {
    const router = useRouter();

    const [drawTime, setDrawTime] = useState<number>(20);
    const [numRounds, setNumRounds] = useState<number>(2);

    const handleDrawTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDrawTime(parseInt(e.target.value));
    };

    const handleNumRoundsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNumRounds(parseInt(e.target.value));
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
                    numRounds: numRounds
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
        <div className="drawing-room-container">
            <h2>Create a Drawing Room</h2>
            <div className="option">
                <label>Draw Time:</label>
                <select value={drawTime} onChange={handleDrawTimeChange}>
                    {[...Array(11)].map((_, index) => (
                        <option key={index} value={20 + index * 10}>
                            {20 + index * 10} seconds
                        </option>
                    ))}
                </select>
            </div>
            <div className="option">
                <label>Rounds:</label>
                <select value={numRounds} onChange={handleNumRoundsChange}>
                    {[...Array(4)].map((_, index) => (
                        <option key={index} value={index + 2}>
                            {index + 2}
                        </option>
                    ))}
                </select>
            </div>
            <button onClick={handleSubmit}>Create Room</button>
        </div>
    );
};

export default MakeRoom;
