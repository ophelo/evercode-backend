import Docker from 'dockerode';
import {WebSocketServer} from 'ws';
import Stream from 'stream';


var wsServer = new WebSocketServer({
    port: 8080
});

const State = {
  TERMINATED:0,
  PENDING:1,
  IDLE:2,
  RUNNING:3
};

const Mess = {
  START: "start",
  RESUME: "resume",
  STOP: "stop"
};

var docker = new Docker({socketPath: '/var/run/docker.sock'});

docker.buildImage({
  context: process.cwd(),
  src: ['Dockerfile']
}, {t: 'ccompiler'}, function (err, output) {
  if (err) {
    return console.error(err);
  }
  output.pipe(process.stdout);
});

wsServer.on('connection', (ws) => {
  ws.on('message', (msg) => {
    console.log("Message received: %s",msg);
    const message = JSON.parse(msg.toString());
    switch(message.type){
      case Mess.START:
        const code = message.payload;
        ws.send("Start compiling + executing...")
        const writableStream = new Stream.Writable()
        writableStream._write = (chunk, encoding, next) => {
          ws.send(chunk.toString());
          next();
        }
        writableStream.on('close', () => ws.send("Finish stream"))
        docker.run(message.language+"compiler", [], writableStream, {
          'Volumes': {
            '/code': {}
          },
          'Hostconfig': {
            'Binds': [process.cwd()+'/tmp:/code'],
          }
        }, function(err, data, container) {
          if (err){
            return console.error(err);
          }
          console.log(data.StatusCode);
        });
        break;
      case Mess.RESUME:
        break;
      case Mess.STOP:
        break;
      default:
        console.log('Message not recognized');
        break;
    }
  })
})
