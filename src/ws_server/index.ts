import WebSocket, { WebSocketServer } from "ws";
import {
  ReceivedMessage,
  getCreateGameResponse,
  getRegisterResponse,
  getUpdateRoomsResponse,
  getUpdateWinnersResponse,
} from "./messageHandler";
import { userDatabase } from "../dataBases/users";
import { roomsDatabase } from "../dataBases/rooms";

interface IndexRoom {
  indexRoom: number;
}

export const wssMessageHandler = () => {
  const wss = new WebSocketServer({ port: 3000 });
  let currentUserIndex: number = 0;

  wss.on("connection", (ws) => {
    console.log("connect");

    ws.on("message", (data) => {
      const userMessage: ReceivedMessage = JSON.parse(data.toString());
      const currentUser = userDatabase.getUserByIndex(currentUserIndex);

      switch (userMessage.type) {
        case "reg":
          const registerResponseMessage = getRegisterResponse(userMessage.data);
          currentUserIndex = JSON.parse(registerResponseMessage.data).index;
          ws.send(JSON.stringify(registerResponseMessage));
          ws.send(JSON.stringify(getUpdateWinnersResponse()));
          ws.send(JSON.stringify(getUpdateRoomsResponse()));

          break;
        case "create_room":
          if (currentUser) {
            roomsDatabase.createRoom(currentUser);
          }
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(getUpdateRoomsResponse()));
            }
          });
          break;

        case "add_user_to_room":
          if (currentUser) {
            const userData = JSON.parse(userMessage.data) as IndexRoom;
            roomsDatabase.addUserToRoom(userData.indexRoom, currentUser);
          }
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify(getCreateGameResponse(1, currentUserIndex))
              );
            }
          });
          break;
        case "add_ships":
          break;
        case "attack":
          break;
      }
      console.log(data.toString());
    });
  });
};
