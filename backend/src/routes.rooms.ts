import express from 'express';
import { z } from "zod";
import { parseError } from './errors.js';
import { generateRandomString } from './util.js';
import { Game, getGames, registerGameRoom, } from './game.js';

const router = express.Router();

const postSchema = z.object({
    drawTime: z.number().refine((drawTime) => drawTime >= 15 && drawTime <= 100, {
      message: 'Draw time must be between 15 and 100',
    }),
    numRounds: z.number().refine((numRounds) => numRounds >= 1 && numRounds <= 5, {
      message: 'Number of rounds must be between 1 and 5',
    }),
});

router.get("/", async (req, res) => {
  const games = getGames();
  return res.json(Object.values(games).map((game) => ({ id: game.id })));
})

router.post("/", async (req, res) => {
    const parseResult = postSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ errors: parseError(parseResult.error)})
    }
    const { drawTime, numRounds } = parseResult.data;
    const roomId = generateRandomString(6);
    const game: Game = {
        id: roomId,
        rules: { drawTime, numRounds },
        hasStarted: false,
        players: {},
        playerOrder: [],
        hostPlayerId: undefined,
        currentRound: 1,
        currentArtistId: undefined,
    }
    registerGameRoom(game);
    return res.json(game);
})

export default router