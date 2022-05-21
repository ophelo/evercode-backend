import {WebSocket} from 'ws';

var socket = new WebSocket('wss://localhost:8080');

socket.onopen = open => {console.log(open)};

const main = async () => {
  socket.OPEN;
  socket.send("ciao");
};

// Start script
main().catch(err => {
  console.error(err);
  process.exit(1); // Retry Job Task by exiting the process
});
