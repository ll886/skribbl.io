interface Player {
  id: string;
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

interface Game {
  id: string;
  rules: GameRules;
  hasStarted: boolean;
  players: GamePlayers;
  playerOrder: string[];
  hostPlayerId: string | undefined;
  currentRound: number;
  currentArtistId: string | undefined;
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
): undefined {
  if (!games.hasOwnProperty(gameId)) {
    gameLog(gameId, "game room no longer exists, exiting game flow");
    return;
  }

  if (games[gameId].playerOrder.length > 1) {
    // recursively start rounds
    startRound(gameId, tickTime, sendMessage, updateGameState);
  } else {
    sendMessage("You need at least 2 players to start the game!");
  }
}

async function startRound(
  gameId: string,
  tickTime: (message: number) => void,
  sendMessage: (message: string) => void,
  updateGameState: (gameState: Game) => void,
): Promise<undefined> {
  if (!games.hasOwnProperty(gameId)) {
    gameLog(gameId, "game room no longer exists, exiting game flow");
    return;
  }
  let game = games[gameId];
  game.hasStarted = true;
  updateGameState(game);
  sendMessage(`starting round ${game.currentRound}`);

  const playerOrder = [...game.playerOrder];
  for (let i = 0; i < playerOrder.length; i++) {
    const playerId = playerOrder[i];
    game.currentArtistId = playerId;
    sendMessage(`${game.currentArtistId} is choosing a word`);

    // TODO wait 15 seconds for player to choose word. if not chosen, randomly choose
    for (let timeRemaining = 15; timeRemaining >= 0; timeRemaining--) {
      tickTime(timeRemaining);
      await wait(1);
    }
  
    // TODO wait <rules.DrawTime> seconds to guess word
    for (let timeRemaining = game.rules.drawTime; timeRemaining >= 0; timeRemaining--) {
      tickTime(timeRemaining);
      await wait(1);
    }
  }

  if (game.currentRound < game.rules.numRounds) {
    game.currentRound++;
    startRound(gameId, tickTime, sendMessage, updateGameState);
  } else {
    // TODO end game logic
  }
}

function wait(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
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
};
