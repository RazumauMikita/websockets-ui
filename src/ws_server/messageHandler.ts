import { roomsDatabase } from "../dataBases/rooms";
import { userDatabase } from "../dataBases/users";
import { winnersDatabase } from "../dataBases/winners";
import { User } from "../interfaces/user";

export const messageHandler = (data: string, userIndex: number) => {
  const userData: ReceiveData = JSON.parse(data);

  switch (userData.type) {
    case "reg":
      return getRegisterResponse(userData.data);
    case "create_room":
      const currentUser = userDatabase.getUserByIndex(userIndex);
      if (currentUser) {
        roomsDatabase.createRoom(currentUser);
      }
      return getUpdateRoomsResponse();

    case "add_ships":
      break;
    case "attack":
      break;
  }
};

export const getUpdateRoomsResponse = (): ResponseData => {
  return {
    type: "update_room",
    data: JSON.stringify(roomsDatabase.getAvailableRoomList),
    id: 0,
  };
};

export const getUpdateWinnersResponse = (): ResponseData => {
  return {
    type: "update_winners",
    data: JSON.stringify(winnersDatabase.getWinners),
    id: 0,
  };
};
export const getRegisterResponse = (userData: string): ResponseData => {
  const user = JSON.parse(userData as string) as Omit<User, "id">;

  const requestBody: RegisterResponse = {
    name: user.name,
    index: 0,
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

type UserMessageType = "reg" | "create_room" | "add_ships" | "attack";
type ServerMessageType =
  | "turn"
  | "reg"
  | "create_game"
  | "start_game"
  | "finish"
  | "attack"
  | "update_winners"
  | "update_room";
interface ReceiveData {
  type: UserMessageType;
  data: string;
  id: 0;
}

interface ResponseData {
  type: ServerMessageType;
  data: string;
  id: 0;
}

interface RegisterResponse {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}
