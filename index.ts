import { httpServer } from "./src/http_server/index";
import { wssMessageHandler } from "./src/ws_server";

const HTTP_PORT = 8181;
wssMessageHandler();
console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
