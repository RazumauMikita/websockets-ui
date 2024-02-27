import { httpServer } from './src/http_server';
import { wssMessageHandler } from './src/ws_server';

const HTTP_PORT = 8181;
wssMessageHandler();
process.stdout.write(`Start static http server on the ${HTTP_PORT} port!\n`);
httpServer.listen(HTTP_PORT);
