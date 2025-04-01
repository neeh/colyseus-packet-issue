import { useState, useEffect } from 'react';
import { Client } from 'colyseus.js';
import './App.css';

const client = new Client('https://localhost:2567');

async function createRoom(callback) {
  client.auth.token = 'p455w0rd';
  const room = await client.create('my_room');

  room.onMessage('P', numPlayers => console.log('P', numPlayers));
  room.onMessage('u+', data => console.log('u+', data));
  room.onMessage('u-', data => console.log('u-', data));

  callback({
    room,
    master: true
  });
}

async function joinRoom(id, callback) {
  client.auth.token = null;
  const room = await client.joinById(id);

  room.onMessage('Q', data => console.log('Q', data));

  callback({
    room,
    master: false
  });
}

function getRoomUrl(roomId) {
  const url = new URL(window.location.href);
  url.searchParams.set('roomId', roomId);
  return url.href;
}

function App() {
  const [roomData, setRoomData] = useState(null);
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const roomId = searchParams.get('roomId');
    if (roomId) {
      joinRoom(roomId, setRoomData);
    }
  }, []);

  let content;
  if (roomData && roomData.master) { // Master view
    content = <>
      <p>{`Room ID: ${roomData.room.roomId}`}</p>
      <a target="_blank" href={getRoomUrl(roomData.room.roomId)}>
        <button>Join room as Student</button>
      </a>
    </>;
  } else if (roomData) { // Student view
    content = <p>{`Room ID: ${roomData.room.roomId}`}</p>;
  } else { // Home view
    content = <button onClick={() => createRoom(setRoomData)}>Create room</button>;
  }

  return (
    <div className="appContainer">
      <p className="appTitle">Colyseus v0.16.0</p>
      {content}
    </div>
  );
}

export default App;
