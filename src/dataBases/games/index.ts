import { User } from "../../interfaces/user";
import { GameBoard } from "./gameBoard";

class GamesDatabase {
  public data: Game[] = [];

  createNewGame = (players: Player[]): number => {
    const newGame: Game = {
      gameId: this.data.length,
      players: players,
    };
    this.data.push(newGame);
    return newGame.gameId;
  };

  addShipsToPlayer = (ships: Ship[], gameId: number, indexPlayer: string) => {
    const playerArrayIndex = this.data[gameId].players.findIndex(
      (elem) => elem.user.index === indexPlayer
    );
    const player = this.data[gameId].players[playerArrayIndex];
    player.ships = ships;
    player.board = new GameBoard(ships);
    player.board.addShipsToBoard();
  };

  isGameReady = (gameId: number) => {
    return this.data[gameId].players.every((elem) => elem.ships);
  };

  getEnemyIndex = (playerIndex: string, gameId: number) => {
    return this.data[gameId].players.findIndex(
      (elem) => elem.user.index !== playerIndex
    );
  };
}

export const gamesDatabase = new GamesDatabase();

export interface Game {
  gameId: number;
  players: Player[];
}

export interface Player {
  user: Omit<User, "password">;
  ships?: Ship[];
  board?: InstanceType<typeof GameBoard>;
}

export type ShipType = "small" | "medium" | "large" | "huge";
export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: ShipType;
}
