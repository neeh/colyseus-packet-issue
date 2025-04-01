# Investigation into packet issues in Colyseus 0.16.0

This issue has been tested on:
 - Node v20.19.0
 - Node v22.14.0
on both Ubuntu 22 and Windows 11.

The issue also occurs over a local network.

## Example scenario

This is just a test scenario to reproduce the issue consistently. This may not be the only scenario that break things.

Anytime a new client joins the room, the creator of the room receives "P" message containing the number of clients in the room.

In Colyseus 0.16.0, instead of receiving the "P" message, the creator of the room receives a slice of the `JOIN_ROOM` message that was intended for the joining client.

## Troubleshooting

### Install root certificate

First, trust the root certificate `certificates/dev_ca.pem`. You can generate your own with `generate.sh` if you don't want to trust the one from this repo.

You can do that in Google Chrome under Settings > Privacy and Security > Security > Manage certificates > Authorities > Import and tick "Trust this certificate for identifying websites".

### Install dependencies and launch server and client

In the server:

```
npm i
npm start
```

In the client:

```
npm i
npm run dev
```

Then open `https://localhost:5443`.

### Add breakpoints

In the client, open DevTools and look for `node_modules/colyseus.js/src/Room.ts` and add a breakpoint to capture messages received from Colyseus's server:

```
188:     protected onMessageCallback(event: MessageEvent) {
189:        const bytes = Array.from(new Uint8Array(event.data))
190:        const code = bytes[0];
191:
192: >>>>>> if (code === Protocol.JOIN_ROOM) {
```

### Debug traffic with Wireshark (optional)

Optionally, you can [install Wireshark](https://www.wireshark.org/download.html) and inspect the traffic.

To decrypt TLS traffic, run the server with the following command:

```
NODE_OPTIONS="--tls-keylog=./sslkey.log" npm start
```

Then open Wireshark, go in Edit > Preferences > Protocols > TLSX and set "(Pre)-Master-Secret log filename" to the sslkey.log file we just crated.

To listen to the traffic from the Colyseus server, capture the traffic on the "Loopback: lo" interface without any capture filters and use the following display filters:

```
websocket and websocket.opcode != 0x9 and websocket.opcode != 0xA
```

Finally, add the "Src Port" and "Dst port" columns to see where the packed are being sent to.

### Test procedure

Go to `https://localhost:5443`. (This is the master client.)

Click on "Create room"

This will create a room and send correct messages.

Click on "Join as Student"

This will open a separate window that will join the room. (This is the student client.)

We should now observe that the master client receives the `JOIN_ROOM` message that was intended for the student client and that the payload has the same size as the message that was intended for the master client.
