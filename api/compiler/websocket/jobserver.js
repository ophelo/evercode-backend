const Docker = require('dockerode');
const fs = require('fs');
const WebSocket = require('ws');
const queryString = require('query-string');
const Stream = require('stream');
const { v4 : uuidv4 } = require('uuid');

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

const WsCompilerServer = async (expressServer) => {

  docker.buildImage({
    context: process.cwd()+'/api/compiler',
    src: ['Dockerfile']
  }, {t: 'cppcompiler'}, function (err, output) {
    if (err) {
      return console.error(err);
    }
    output.pipe(process.stdout);
  });

  const wsServer = new WebSocket.Server({
    noServer: true,
    path: "/compiler",
  });

  expressServer.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (websocket) => {
      wsServer.emit('connection', websocket, request);
    });
  });

  wsServer.on(
    'connection',
    function connection(websocketConnection, connectionRequest) {
      const [_path, params] = connectionRequest?.url?.split("?");
      const connectionParams = queryString.parse(params);

      let state = 0
      let uuid = uuidv4()
      let _contId
      let files = []

      websocketConnection.on("message", (msg) => {
        console.log("Message received: %s",msg)
        const message = JSON.parse(msg.toString())
        switch(message.type){
          case Mess.START:
            fs.mkdirSync('tmp/' + uuid,{ recursive: true})
            let env = genEnvironment(message.language,files,uuid)
            console.log(env);
            // const code = message.payload;
            state = 1
            websocketConnection.send("Start compiling + executing...")
            websocketConnection.send("State = " + state)
            const writableStream = new Stream.Writable()
            writableStream._write = (chunk, encoding, next) => {
              websocketConnection.send(chunk.toString());
              next();
            }
            writableStream.on('close', () => {
              websocketConnection.send("Finish stream")
              websocketConnection.send('close')
              state = 0
              console.log(uuid);
              fs.rmdirSync('tmp/'+ uuid, { recursive: true });
            })
            docker.run(message.language + 'compiler', [], writableStream, {
              'Volumes': {
                '/code': {},
                '/var/run/docker.sock': {}
              },
              'Hostconfig': {
                'AutoRemove': true,
                'Binds': [process.cwd()+'/tmp/' + uuid + ':/code', '/var/run/docker.sock:/var/run/docker.sock'],
              },
              Env: [
                'PROGID=' + uuid,
                'FILES=' + env
                ]
            }, {Privileged: true}, function(err, data, container) {
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
      });
    }
  )

  return wsServer;
};

module.exports = WsCompilerServer;
