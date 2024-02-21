import WebSocket, { WebSocketServer } from "ws";
import {
  ReceivedMessage,
  ResponseData,
  getCreateGameData,
  getRegisterData,
  getUpdateRoomsData,
  getUpdateWinnersData,
} from "./messageHandler";
import { userDatabase } from "../dataBases/users";
import { roomsDatabase } from "../dataBases/rooms";
import { IncomingMessage } from "http";

interface IndexRoom {
  indexRoom: number;
}

interface Game {
  gameId: number;
  playersId: number[];
}

const games: Game[] = [];

const usersSockets = new Map<string, WebSocket>();

const sendResponseToUserById = (userIndex: string, response: ResponseData) => {
  const sock = usersSockets.get(userIndex);
  sock?.send(JSON.stringify(response));
};

const sendResponseToAllUsers = (
  wss: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>,
  response: ResponseData
) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(response));
    }
  });
};

export const wssMessageHandler = () => {
  const wss = new WebSocketServer({ port: 3000 });

  wss.on("connection", (ws) => {
    let currentUserIndex: string = "";
    console.log("connect");

    ws.on("close", () => {
      const user = userDatabase.getUserByIndex(currentUserIndex);
      if (user) {
        roomsDatabase.removeUserRoom(user);
      }
      sendResponseToAllUsers(wss, getUpdateRoomsData());

      ws.close();
    });

    ws.on("message", (data) => {
      const userMessage: ReceivedMessage = JSON.parse(data.toString());
      const currentUser = userDatabase.getUserByIndex(currentUserIndex);

      switch (userMessage.type) {
        case "reg":
          const registerResponseMessage = getRegisterData(userMessage.data);
          currentUserIndex = JSON.parse(registerResponseMessage.data).index;
          usersSockets.set(currentUserIndex, ws);

          ws.send(JSON.stringify(registerResponseMessage));
          ws.send(JSON.stringify(getUpdateWinnersData()));
          ws.send(JSON.stringify(getUpdateRoomsData()));

          break;
        case "create_room":
          if (currentUser && !roomsDatabase.isHaveUserRoom(currentUser)) {
            roomsDatabase.createRoom(currentUser);
          }
          sendResponseToAllUsers(wss, getUpdateRoomsData());
          break;

        case "add_user_to_room":
          const roomData = JSON.parse(userMessage.data) as IndexRoom;
          if (currentUser) {
            roomsDatabase.addUserToRoom(roomData.indexRoom, currentUser);
          }
          const room = roomsDatabase.getRoomById(roomData.indexRoom);
          room.roomUsers.forEach((elem) => {
            sendResponseToUserById(
              elem.index,
              getCreateGameData(1, currentUserIndex)
            );
          });

          break;
        case "add_ships":
          break;
        case "attack":
          break;
      }
    });
  });
};
