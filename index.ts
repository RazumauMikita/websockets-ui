import { httpServer } from "./src/http_server/index";
import { wss } from "./src/ws_server";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    console.log(JSON.parse(data.toString()));
    const receivedData = JSON.parse(data.toString());
    const sendData = {
      type: "reg",
      data: {
        name: receivedData.name,
        index: "index",
        error: false,
        errorText: "",
      },
      id: 0,
    };
    ws.send(JSON.stringify(sendData));
  });
});
