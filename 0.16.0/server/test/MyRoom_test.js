import assert from "assert";
import { boot } from "@colyseus/testing";
import { Client } from 'colyseus.js';

// import your "app.config.ts" file here.
import appConfig from "../src/app.config.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

describe("testing your Colyseus app", () => {
  let colyseus;

  const PORT = 2568;

  before(async () => colyseus = await boot(appConfig, PORT));
  after(async () => colyseus.shutdown());

  beforeEach(async () => await colyseus.cleanup());

  it("connecting into a room", async () => {
    // `room` is the server-side Room instance reference.
    // const room = await colyseus.createRoom("my_room", {});

    // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
    // const client1 = await colyseus.connectTo(room);

    const endpoint = `wss://localhost:${PORT}`;
    const numPlayers = [];

    const client1 = new Client(endpoint);
    client1.auth.token = 'p455w0rd';
    // const roomClient1 = await colyseus.createRoom('my_room');
    const roomClient1 = await client1.create('my_room');
    roomClient1.onMessage('u+', data => {});
    roomClient1.onMessage('u-', data => {});
    roomClient1.onMessage('P', data => numPlayers.push(data));
    const roomId = roomClient1.roomId;

    const client2 = new Client(endpoint);
    // const roomClient2 = await colyseus.connectTo(room);
    const roomClient2 = await client2.joinById(roomId);
    roomClient2.onMessage('P', data => {});

    await new Promise((resolve, reject) => {
      setTimeout(() => {
        assert.deepStrictEqual(numPlayers, [0, 1]);
        resolve();
      }, 100);
    });
  });
});
