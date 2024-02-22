import { Ship } from "../dataBases/games";
import { roomsDatabase } from "../dataBases/rooms";
import { userDatabase } from "../dataBases/users";
import { winnersDatabase } from "../dataBases/winners";
import { User } from "../interfaces/user";

export const getTurnData = (playerId: string): ResponseData => {
  const turnData = {
    currentPlayer: playerId,
  };
  return {
    type: "turn",
    data: JSON.stringify(turnData),
    id: 0,
  };
};

export const getStartGameData = (
  ships: Ship[],
  playerIndex: string
): ResponseData => {
  const startGameData = {
    ships: ships,
    currentPlayerIndex: playerIndex,
  };
  return {
    type: "start_game",
    data: JSON.stringify(startGameData),
    id: 0,
  };
};

export const getCreateGameData = (
  idGame: number,
  idPlayer: string
): ResponseData => {
  const gameData = {
    idGame,
    idPlayer,
  };
  return {
    type: "create_game",
    data: JSON.stringify(gameData),
    id: 0,
  };
};
export const getUpdateRoomsData = (): ResponseData => {
  return {
    type: "update_room",
    data: JSON.stringify(roomsDatabase.getAvailableRoomList),
    id: 0,
  };
};

export const getUpdateWinnersData = (): ResponseData => {
  return {
    type: "update_winners",
    data: JSON.stringify(winnersDatabase.getWinners),
    id: 0,
  };
};
export const getRegisterData = (userData: string): ResponseData => {
  const user = JSON.parse(userData as string) as Omit<User, "id">;

  const requestBody: RegisterResponse = {
    name: user.name,
    index: "",
    error: false,
    errorText: "",
  };
  if (userDatabase.isUserExist(user)) {
    if (userDatabase.isPasswordCorrect(user)) {
    } else {
      requestBody.error = true;
      requestBody.errorText = "Wrong password";
    }
  } else {
    userDatabase.addNewUser(user);
  }
  requestBody.index = userDatabase.getUserIndex(user);
  requestBody.name = user.name;
  return {
    type: "reg",
    data: JSON.stringify(requestBody),
    id: 0,
  };
};

type UserMessageType =
  | "reg"
  | "create_room"
  | "add_ships"
  | "attack"
  | "add_user_to_room";
type ServerMessageType =
  | "turn"
  | "reg"
  | "create_game"
  | "start_game"
  | "finish"
  | "attack"
  | "update_winners"
  | "update_room";
export interface ReceivedMessage {
  type: UserMessageType;
  data: string;
  id: 0;
}

export interface ResponseData {
  type: ServerMessageType;
  data: string;
  id: 0;
}

export interface RegisterResponse {
  name: string;
  index: string;
  error: boolean;
  errorText: string;
}
