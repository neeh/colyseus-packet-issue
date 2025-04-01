import fs from 'node:fs';
import path from 'node:path';
// import http from 'node:http';
import https from 'node:https';
import config from '@colyseus/tools';
import { monitor } from '@colyseus/monitor';
// import { playground } from '@colyseus/playground';
import { WebSocketTransport } from '@colyseus/ws-transport';
import express from 'express';

/**
 * Import your Room files
 */
import { MyRoom } from './rooms/MyRoom.js';

export default config.default({

  initializeTransport: (options) => {
    const app = express();
    // const server = http.createServer(app);
    const credentials = {
      key: fs.readFileSync(path.join(import.meta.dirname, '../../../certificates/dev_key.pem')),
      cert: fs.readFileSync(path.join(import.meta.dirname, '../../../certificates/dev.pem'))
    };
    const server = https.createServer(credentials, app);
    const transport = new WebSocketTransport({ server });
    transport.expressApp = app;
    return transport;
  },

  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define('my_room', MyRoom);
  },

  initializeExpress: (app) => {
    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    app.get('/hello_world', (req, res) => {
      res.send('Hello world!');
    });

    /**
     * Bind @colyseus/monitor
     * It is recommended to protect this route with a password.
     * Read more: https://docs.colyseus.io/colyseus/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use('/monitor', monitor());
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  }

});
