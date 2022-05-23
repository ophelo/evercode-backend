import Docker from 'dockerode';
import fs from 'fs';
import {WebSocketServer} from 'ws';
import Stream from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { getEnvironmentData } from 'worker_threads';

var wsServer = new WebSocketServer({
    port: 8080
})

const Mess = {
  START: "start",
  FILE: "file",
  STOP: "stop"
};

function genEnvironment(language,files,uuid) {
  let tmp
  switch (language) {
    case 'cpp':
      tmp  = ''
      for (let i = 0; i < files.length; i++) {
        fs.writeFileSync('tmp/'+ uuid +'/'+files[i].name, files[i].code)
        if (files[i].name.split('.').pop() == 'cpp') tmp += files[i].name; tmp += ' '
      }
      break;
    default:
      break;
  }
  return tmp
}

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
}, {t: 'cppcompiler'}, function (err, output) {
  if (err) {
    return console.error(err);
  }
  output.pipe(process.stdout);
});

wsServer.on('connection', (ws) => {
  let state = 0
  let uuid = uuidv4()
  let _contId
  let files = []
  ws.on('message', (msg) => {
    console.log("Message received: %s",msg)
    const message = JSON.parse(msg.toString())
    switch(message.type){
      case Mess.START:
        fs.mkdirSync('tmp/' + uuid)
        let env = genEnvironment(message.language,files,uuid)
        console.log(env);
        // const code = message.payload;
        state = 1
        ws.send("Start compiling + executing...")
        ws.send("State = " + state)
        const writableStream = new Stream.Writable()
        writableStream._write = (chunk, encoding, next) => {
          ws.send(chunk.toString());
          next();
        }
        writableStream.on('close', () => {
          ws.send("Finish stream")
          ws.send('close')
          state = 0
        })
        docker.run(message.language + 'compiler', [], writableStream, {
          'Volumes': {
            '/code': {}
          },
          'Hostconfig': {
            'AutoRemove': true,
            'Binds': [process.cwd()+'/tmp/' + uuid + ':/code'],
          },
          Env: [
            'PROGID=' + uuid,
            'FILES=' + env
            ]
        }, function(err, data, container) {
            _contId = container.id
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
          docker.getContainer(_contId).then(container => container.kill(function (err, data) {
            console.log(data)
          }))
        }
        break;
      default:
        console.log('Message not recognized')
        break;
    }
  })
})
