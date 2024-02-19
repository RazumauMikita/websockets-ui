import { WebSocketServer } from "ws";
import { getUpdateWinnersResponse, messageHandler } from "./messageHandler";

export const wssMessageHandler = () => {
  const wss = new WebSocketServer({ port: 3000 });
  let currentUserIndex: number = 0;
  wss.on("connection", (ws) => {
    console.log("connect");
    ws.on("message", (data) => {
      const sendMessage = messageHandler(data.toString(), currentUserIndex);
      if (sendMessage?.type === "reg") {
        currentUserIndex = JSON.parse(sendMessage.data).index;
        ws.send(JSON.stringify(sendMessage));
        ws.send(JSON.stringify(getUpdateWinnersResponse()));
      }
      if (sendMessage?.type === "update_room") {
        ws.send(JSON.stringify(sendMessage));
      }
      console.log(data.toString());
    });
  });
};
