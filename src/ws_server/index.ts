import WebSocket, { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import {
  ReceivedMessage,
  ResponseData,
  getAttackData,
  getCreateGameData,
  getFinishGameData,
  getRegisterData,
  getStartGameData,
  getTurnData,
  getUpdateRoomsData,
  getUpdateWinnersData,
} from './messageHandler';
import { userDatabase } from '../dataBases/users';
import { roomsDatabase } from '../dataBases/rooms';
import { Player, gamesDatabase } from '../dataBases/games';
import { winnersDatabase } from '../dataBases/winners';
import { Ship } from '../dataBases/games/gameBoard';

export interface AttackData {
  x: number;
  y: number;
  gameId: number;
  indexPlayer: string;
}
export interface AddShipsData {
  gameId: number;
  ships: Ship[];
  indexPlayer: string;
}

export interface IndexRoom {
  indexRoom: number;
}

const usersSockets = new Map<string, WebSocket>();

const sendResponseToUserById = (userIndex: string, response: ResponseData) => {
  const sock = usersSockets.get(userIndex);
  sock?.send(JSON.stringify(response));
};

const sendResponseToAllUsers = (
  wss: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>,
  response: ResponseData,
) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(response));
    }
  });
};

export const wssMessageHandler = () => {
  const wss = new WebSocketServer({ port: 3000 });

  wss.on('connection', (ws, req) => {
    let currentUserIndex: string = '';

    process.stdout.write(`connect websocket url: ws:/${req.url}\n`);

    ws.on('close', () => {
      const user = userDatabase.getUserByIndex(currentUserIndex);
      if (user && typeof user.userRoomId === 'number') {
        roomsDatabase.removeUserRoom(user.userRoomId);
        sendResponseToAllUsers(wss, getUpdateRoomsData());
      }
      process.stdout.write(`close websocket ${req.url}\n`);
      ws.close();
    });

    ws.on('message', (data) => {
      const userMessage: ReceivedMessage = JSON.parse(data.toString());
      const currentUser = userDatabase.getUserByIndex(currentUserIndex);

      switch (userMessage.type) {
        case 'reg': {
          const registerResponseMessage = getRegisterData(userMessage.data);
          currentUserIndex = JSON.parse(registerResponseMessage.data).index;
          usersSockets.set(currentUserIndex, ws);

          ws.send(JSON.stringify(registerResponseMessage));
          ws.send(JSON.stringify(getUpdateWinnersData()));
          ws.send(JSON.stringify(getUpdateRoomsData()));

          break;
        }

        case 'create_room': {
          if (currentUser && !roomsDatabase.isHaveUserRoom(currentUser)) {
            const newRoomIndex: number = roomsDatabase.createRoom(currentUser);
            currentUser.userRoomId = newRoomIndex;
          }
          sendResponseToAllUsers(wss, getUpdateRoomsData());
          break;
        }

        case 'add_user_to_room': {
          const roomData = JSON.parse(userMessage.data) as IndexRoom;
          if (currentUser) {
            const room = roomsDatabase.getRoomById(roomData.indexRoom);
            if (room.roomUsers[0].index === currentUser.index) return;
            roomsDatabase.addUserToRoom(roomData.indexRoom, currentUser);
            sendResponseToAllUsers(wss, getUpdateRoomsData());

            const players: Player[] = [
              { user: room.roomUsers[0] },
              { user: room.roomUsers[1] },
            ];
            const gameId = gamesDatabase.createNewGame(players);
            room.roomUsers.forEach((elem) => {
              sendResponseToUserById(
                elem.index,
                getCreateGameData(gameId, elem.index),
              );
            });
          }

          break;
        }

        case 'add_ships': {
          const addShipsData = JSON.parse(userMessage.data) as AddShipsData;
          const { gameId, ships, indexPlayer } = addShipsData;
          gamesDatabase.addShipsToPlayer(ships, gameId, indexPlayer);

          if (gamesDatabase.isGameReady(gameId)) {
            gamesDatabase.data[gameId].players.forEach((elem) => {
              if (elem.ships) {
                sendResponseToUserById(
                  elem.user.index,
                  getStartGameData(elem.ships, elem.user.index),
                );
              }
            });
            gamesDatabase.data[gameId].players.forEach((elem) => {
              sendResponseToUserById(
                elem.user.index,
                getTurnData(currentUser?.index || ''),
              );
            });
          }
          break;
        }

        case 'attack':
        case 'randomAttack': {
          const attackData = JSON.parse(userMessage.data) as AttackData;
          const { gameId, indexPlayer } = attackData;
          const currentGame = gamesDatabase.data[gameId];
          const enemyId = gamesDatabase.getEnemyIndex(indexPlayer, gameId);
          let x: number;
          let y: number;

          if (userMessage.type === 'attack') {
            x = attackData.x;
            y = attackData.y;
          } else {
            const randomPosition = currentGame.players[enemyId].board?.generateRandomAttack();
            x = randomPosition?.x || 0;
            y = randomPosition?.y || 0;
          }

          const attackResult = currentGame.players[
            enemyId
          ].board?.getAttackResult(x, y);
          const isNeedFinishGame = currentGame.players[enemyId].board?.isPlayerLoose();

          if (isNeedFinishGame) {
            currentGame.players.forEach((elem) => {
              sendResponseToUserById(
                elem.user.index,
                getFinishGameData(indexPlayer),
              );
            });
            winnersDatabase.updateWinners(
              userDatabase.getUserByIndex(indexPlayer)?.name || '',
            );
            sendResponseToAllUsers(wss, getUpdateWinnersData());
          }

          if (attackResult) {
            if (attackResult === 'killed') {
              const missCells = currentGame.players[
                enemyId
              ].board?.getMissCellsAroundKilledShip({ x, y });

              currentGame.players.forEach((player) => {
                missCells?.forEach((cell) => {
                  sendResponseToUserById(
                    player.user.index,
                    getAttackData(
                      cell?.position || { x: 0, y: 0 },
                      indexPlayer,
                      'miss',
                    ),
                  );
                });
              });
            }
            const nextTurn = attackResult === 'miss'
              ? currentGame.players[enemyId].user.index
              : indexPlayer;
            currentGame.players.forEach((elem) => {
              sendResponseToUserById(
                elem.user.index,
                getAttackData({ x, y }, indexPlayer, attackResult),
              );
            });
            currentGame.players.forEach((elem) => {
              sendResponseToUserById(elem.user.index, getTurnData(nextTurn));
            });
          }

          break;
        }

        default:
      }
    });
  });
};
