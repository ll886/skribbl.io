import { wait } from "./util.js";
import { chooseEasyWord } from "./words.js";

interface Player {
  id: string;
  points: number;
}

interface GameRules {
  drawTime: number;
  numRounds: number;
}

interface PlayerDetails {
  player: Player;
  points: number;
}

interface GamePlayers {
  [playerId: string]: PlayerDetails;
}

interface PlayerGuess {
  playerId: string;
  guess: string;
}

interface PlayerRound {
  artistId: string;
  playerGuesses: PlayerGuess[];
  playerCorrectGuessOrder: string[];
}

interface Round {
  playerRounds: PlayerRound[];
}

interface Game {
  id: string;
  rules: GameRules;
  hasStarted: boolean;
  players: GamePlayers;
  playerOrder: string[];
  hostPlayerId: string | undefined;
  currentRound: number;
  currentArtistId: string | undefined;
  pastWords: string[];
  roundHistory: Round[];
}

interface Games {
  [gameId: string]: Game;
}

let games: Games = {};

function gameLog(gameId: string, message: string | object) {
  console.log({ gameId, message });
}

function playerLog(gameId: string, playerId: string, message: string) {
  gameLog(gameId, {
    playerId,
    message,
  });
}

function registerGameRoom(game: Game) {
  if (games.hasOwnProperty(game.id)) {
    throw new Error("gameId already exists");
  }
  games[game.id] = game;
  gameLog(game.id, "created room");
}

function addPlayerToGame(gameId: string, player: Player) {
  if (!games.hasOwnProperty(gameId)) {
    throw new Error("invalid gameId");
  }

  if (player.id === undefined) {
    throw new Error("player does not have an id");
  }

  if (games[gameId].players.hasOwnProperty(player.id)) {
    throw new Error("playerId already registered in game");
  }

  const isFirstPlayer = Object.keys(games[gameId].players).length === 0;
  const points = 0;
  games[gameId].players[player.id] = { player, points };
  games[gameId].playerOrder.push(player.id);
  if (isFirstPlayer) {
    games[gameId].hostPlayerId = player.id;
  }

  playerLog(gameId, player.id, "added player");
}

function removePlayerFromGame(gameId: string, player: Player) {
  if (games.hasOwnProperty(gameId)) {
    if (games[gameId].players.hasOwnProperty(player.id)) {
      const updatedPlayerOrder = games[gameId].playerOrder.filter(
        (playerId) => playerId !== player.id
      );
      delete games[gameId].players[player.id];
      games[gameId].playerOrder = updatedPlayerOrder;

      playerLog(gameId, player.id, "removed player");
      // TODO handle when only 1 player remains during an ongoing game
      if (updatedPlayerOrder.length === 0) {
        delete games[gameId];
        gameLog(gameId, "all players have left");
        gameLog(gameId, "game deleted");
      } else {
        if (
          games[gameId].hostPlayerId === player.id &&
          games[gameId].playerOrder.length > 0
        ) {
          const newHostId = games[gameId].playerOrder[0];
          games[gameId].hostPlayerId = newHostId;
        }
      }
    }
  }
}

function getGames(): Games {
  return games;
}

function getGameState(gameId: string): Game {
  if (!games.hasOwnProperty(gameId)) {
    throw new Error("invalid gameId");
  }
  return games[gameId];
}

function startGame(
  gameId: string,
  tickTime: (time: number) => void,
  sendMessage: (message: string) => void,
  updateGameState: (gameState: Game) => void,
  sendDrawWordInfo: (word: string, artistId: string) => void,
  sendGuessWordInfo: (wordLength: number, guesserIds: string[]) => void
): undefined {
  if (!games.hasOwnProperty(gameId)) {
    gameLog(gameId, "game room no longer exists, exiting game flow");
    return;
  }

  if (games[gameId].playerOrder.length > 1) {
    // recursively start rounds
    startRound(
      gameId,
      tickTime,
      sendMessage,
      updateGameState,
      sendDrawWordInfo,
      sendGuessWordInfo
    );
  } else {
    sendMessage("You need at least 2 players to start the game!");
  }
}

async function startRound(
  gameId: string,
  tickTime: (message: number) => void,
  sendMessage: (message: string) => void,
  updateGameState: (gameState: Game) => void,
  sendDrawWordInfo: (word: string, artistId: string) => void,
  sendGuessWordInfo: (wordLength: number, guesserIds: string[]) => void
): Promise<undefined> {
  if (!games.hasOwnProperty(gameId)) {
    gameLog(gameId, "game room no longer exists, exiting game flow");
    return;
  }
  let game = games[gameId];
  game.hasStarted = true;
  game.roundHistory.push({ playerRounds: [] });
  updateGameState(game);
  sendMessage(`starting round ${game.currentRound}`);

  const playerOrder = [...game.playerOrder];
  for (let i = 0; i < playerOrder.length; i++) {
    const playerId = playerOrder[i];
    game.currentArtistId = playerId;
    game.roundHistory[game.currentRound - 1].playerRounds.push({
      artistId: game.currentArtistId,
      playerGuesses: [],
      playerCorrectGuessOrder: [],
    });

    const word = chooseEasyWord(game.pastWords);
    game.pastWords.push(word);
    sendDrawWordInfo(word, game.currentArtistId);
    sendGuessWordInfo(word.length, getGuesserIds(game));
    sendMessage(`${game.currentArtistId} is drawing`);

    for (
      let timeRemaining = game.rules.drawTime;
      timeRemaining >= 0;
      timeRemaining--
    ) {
      evaluateCurrentPlayerRound(game, word);
      if (allCorrectInCurrentPlayerRound(game)) {
        break;
      }
      tickTime(timeRemaining);
      await wait(1);
    }

    // TODO wait 5 seconds to show results
    // TODO send new event to show points earned by each player for this round
    for (let timeRemaining = 5; timeRemaining >= 0; timeRemaining--) {
      tickTime(timeRemaining);
      await wait(1);
    }

    // TODO update player points at end of player guess after we calculate points
    updateGameState(game);
  }

  if (game.currentRound < game.rules.numRounds) {
    game.currentRound++;
    startRound(
      gameId,
      tickTime,
      sendMessage,
      updateGameState,
      sendDrawWordInfo,
      sendGuessWordInfo
    );
  } else {
    // TODO end game logic
  }
}

function getGuesserIds(game: Game): string[] {
  const { players, currentArtistId } = game;

  return Object.keys(players).filter(
    (playerId) => playerId !== currentArtistId
  );
}

function evaluateCurrentPlayerRound(game: Game, word: string) {
  let currentRound = game.roundHistory[game.roundHistory.length - 1];
  let currentPlayerRound =
    currentRound.playerRounds[currentRound.playerRounds.length - 1];

  currentPlayerRound.playerGuesses.forEach((playerGuess) => {
    console.log(playerGuess.guess);
    if (
      playerGuess.playerId != game.currentArtistId &&
      playerGuess.guess === word &&
      !currentPlayerRound.playerCorrectGuessOrder.includes(playerGuess.playerId)
    ) {
      currentPlayerRound.playerCorrectGuessOrder.push(playerGuess.playerId);
    }
  });
}

function allCorrectInCurrentPlayerRound(game: Game): boolean {
  let currentRound = game.roundHistory[game.roundHistory.length - 1];
  let currentPlayerRound =
    currentRound.playerRounds[currentRound.playerRounds.length - 1];
  return (
    currentPlayerRound.playerCorrectGuessOrder.length == (game.playerOrder.length - 1)
  );
}

function recordPlayerMessage(
  gameId: string,
  playerId: string,
  message: string
) {
  if (!games.hasOwnProperty(gameId)) {
    throw new Error("invalid gameId");
  }

  let game = games[gameId];

  if (game.hasStarted) {
    let currentRound = game.roundHistory[game.roundHistory.length - 1];
    let currentPlayerRound =
      currentRound.playerRounds[currentRound.playerRounds.length - 1];
    currentPlayerRound.playerGuesses.push({
      playerId: playerId,
      guess: message,
    });
  }
}

export {
  Player,
  Game,
  registerGameRoom,
  addPlayerToGame,
  removePlayerFromGame,
  getGames,
  getGameState,
  startGame,
  recordPlayerMessage,
};
