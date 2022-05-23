import Docker from 'dockerode';
import fs from 'fs';
import {WebSocketServer} from 'ws';
import Stream from 'stream';

var wsServer = new WebSocketServer({
    port: 8080
})

const Mess = {
  START: "start",
  FILE: "file",
  STOP: "stop"
};


class File{
  constructor(name, text){
    this.name = name
    let buff = new Buffer(text, 'base64')
    this.code = buff.toString('ascii')
  }
}

var docker = new Docker({socketPath: '/var/run/docker.sock'});

docker.buildImage({
  context: process.cwd(),
  src: ['Dockerfile']
}, {t: 'compiler'}, function (err, output) {
  if (err) {
    return console.error(err);
  }
  output.pipe(process.stdout);
});

wsServer.on('connection', (ws) => {
  let state = 0
  let _container
  let files = []
  let filenames
  ws.on('message', (msg) => {
    console.log("Message received: %s",msg)
    const message = JSON.parse(msg.toString())
    switch(message.type){
      case Mess.START:
        for (let i = 0; i < files.length; i++) {
          fs.writeFileSync('tmp/'+files[i].name, files[i].code)
          let buff
          if (i == 0) buff =files[i].name; else buff = filenames + ' ' + files[i].name
          filenames = buff
          console.log('created file: ' + files[i].name + ' with text: ' + files[i].code);
        }
        console.log(filenames);
        // const code = message.payload;
        state = 1
        ws.send("Start compiling + executing...")
        ws.send("State = " + state)
        const writableStream = new Stream.Writable()
        writableStream._write = (chunk, encoding, next) => {
          console.log(chunk.toString())
          ws.send(chunk.toString());
          next();
        }
        writableStream.on('close', () => {
          ws.send("Finish stream")
          ws.send('close')
          state = 0
        })
        _container = docker.run('compiler', [], writableStream, {
          'Volumes': {
            '/code': {}
          },
          'Hostconfig': {
            'AutoRemove': true,
            'Binds': [process.cwd()+'/tmp:/code'],
          },
          Env: [
            'LANG='+ message.language,
            'FILES=' + filenames
            ]
        }, function(err, data, container) {
            console.log(_container)
          if (err){
            return console.error(err);
          }
          console.log(data.StatusCode);
        })
        break;
      case Mess.FILE:
        console.log("received file: " + message.name + "with encripted code: " + message.text);
        files.push(new File(message.name,message.text));
        break;
      case Mess.STOP:
        if (state == 1) {
          console.log("killing container and exiting")
          // _container.kill()
        }
        break;
      default:
        console.log('Message not recognized')
        break;
    }
  })
})
