interface GameRules {
    drawTime: number
    numRounds: number
  }

interface Game {
  id: string
  rules: GameRules
  hasStarted: boolean
}

interface Games {
  [gameId: string]: Game
}

let games: Games = {};

function registerGameRoom(game: Game) {
  if (games.hasOwnProperty(game.id)) {
    throw new Error(`Game with ID ${game.id} already exists.`);
  }
  games[game.id] = game;
}

export { 
    Game,
    registerGameRoom
};
