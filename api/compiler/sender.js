import {WebSocket} from 'ws';

var socket = new WebSocket('ws://localhost:5000');

socket.on('open', () => {
  socket.send(JSON.stringify({ type: "start", language: "c", payload: 'I2luY2x1ZGUgPGlvc3RyZWFtPgoKdXNpbmcgbmFtZXNwYWNlIHN0ZDsKCmludCBtYWluKCl7CiAgICBjb3V0IDw8ICJIZWxsbyBXb3JsZCEiOwogICAgcmV0dXJuIDA7Cn0='}));
})

socket.on('message', (data) => {
  console.log("Message: %s", data);
})

// socket.onopen = open => {console.log(open)};

// const main = async () => {
//   socket.OPEN;
//   socket.send("ciao");
// };

// // Start script
// main().catch(err => {
//   console.error(err);
//   process.exit(1); // Retry Job Task by exiting the process
// });
