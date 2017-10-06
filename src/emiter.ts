import * as io from "socket.io";
import * as uuid from "uuid/v4";
import { Server } from "./index";

export class Emiter {
  static socket: any;
  static socketsSend: any = {};
  static socketsGet: any = {};

  constructor(app: any) {
    Emiter.socket = io(app);
    setTimeout(() => this.load());
  }

  private load(): void {
    Emiter.socket.on("connection", (socket: any) => {
      const token = uuid();
      const id = uuid();

      Emiter.socketsSend[token] = Emiter.socketsGet[id] = socket;

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

    const emitCallback = (dataEmited: any, token: string, sendOne: string) => {
      const msg = `${target.constructor.alias}.on.${target[method].alias}`;

      if (sendOne) {
        console.log(`Emit: ${msg} to ${sendOne}`);
        Emiter.socketsGet[sendOne].emit(msg, dataEmited);
      } else if (target[method].emits) {
        console.log(`Emit: ${msg}`);
        Emiter.socket.emit(msg, dataEmited);
      } else if (target[method].broadcast) {
        console.log(`Broadcast: ${msg}`);
        Emiter.socketsSend[token].broadcast.emit(msg, dataEmited);
      }
    };

    return emitCallback;
  }
}