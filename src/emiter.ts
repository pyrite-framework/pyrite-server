import * as io from "socket.io";
import * as uuid from "uuid/v4";
import { Server } from "./index";

export class Emiter {
  static socket: SocketIO.Server;
  static socketsSend: {[key:string]: SocketIO.Socket} = {};
  static socketsGet: {[key:string]: SocketIO.Socket} = {};
  static tokenToId: {[key:string]: string} = {};

  constructor(app) {
    Emiter.socket = io(app);
    this.load();
  }

  private load(): void {
    Emiter.socket.on("connection", (socket: SocketIO.Socket) => {
      const token = uuid();
      const id = uuid();

      Emiter.socketsSend[token] = Emiter.socketsGet[id] = socket;

      Emiter.tokenToId[token] = id;

      const dataEmited: any = {
        controllers: Server.controllersAllowed,
        id: id,
        token: token
      };

      socket.emit("controllersAllowed", dataEmited);
    });
  }

  static loadEmit(target: any, method: string): Function {
    if (target[method].emits) {
      console.log(`Loading emit: ${target.alias}.on.${target[method].alias}`);
      Server.controllersAllowed[target.alias][target[method].alias].emits = true;

    } else if (target[method].broadcast) {
      console.log(`Loading broadcast: ${target.alias}.on.${target[method].alias}`);
      Server.controllersAllowed[target.alias][target[method].alias].emits = true;
    }

    const emitCallback = (token: string, sendOne: string, data: any): any => {
      const msg = `${target.alias}.on.${target[method].alias}`;
      const id = Emiter.tokenToId[token];

      if (sendOne) {
        console.log(`Emit: ${msg} to ${sendOne}`);
        const emiter = Emiter.socketsGet[sendOne];

        if (emiter) {
          emiter.emit(msg, { id, data });
        } else {
          Emiter.socketsGet[id].emit(msg, { 
            id: id,
            data: {
              error: 'Emit: ' + sendOne + ' not found'
            }
          });
        }
      } else if (target[method].emits) {
        console.log(`Emit: ${msg}`);
        Emiter.socket.emit(msg, { id, data });
      } else if (target[method].broadcast) {
        console.log(`Broadcast: ${msg}`);
        Emiter.socketsSend[token].broadcast.emit(msg, { id, data });
      }
    };

    return emitCallback;
  }
}