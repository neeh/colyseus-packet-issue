import { Room, ServerError } from '@colyseus/core';
// import { MyRoomState } from './schema/MyRoomState.js';

export class MyRoom extends Room {
  maxClients = 8;
  // state = new MyRoomState();

  patchRate = 0;

  master = null;
  numPlayers = 0;

  onCreate(options) {
    this.setPrivate();
  }

  static async onAuth(token, options, context) {
    const authData = {
      master: false
    };
    if (token === 'p455w0rd') {
      authData.master = true;
    }
    return authData;
  }

  onJoin(client, options, authData) {
    if (authData?.master) {
      if (this.master) {
        client.leave(4303, 'This room has a master already');
      }
      this.master = client;
      client.send('P', this.numPlayers);
    } else {
      if (this.master) {
        this.master.send('u+', { id: client.sessionId });
      }
      this.numPlayers++;
      this.broadcast('P', this.numPlayers);
    }

    console.log(client.sessionId, 'joined as', authData?.master ? 'master' : 'student');
  }

  onLeave(client, consented) {
    console.log(client.sessionId, 'left!');

    if (client.authData?.master) {
      this.master = null;
    } else {
      if (this.master) {
        this.master.send('u-', { id: client.sessionId });
      }
      this.numPlayers--;
      this.broadcast('P', this.numPlayers);
    }
  }

  onDispose() {
    console.log('room', this.roomId, 'disposing...');
  }

}
