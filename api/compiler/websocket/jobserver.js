const Docker = require('dockerode');
const fs = require('fs');
const WebSocket = require('ws');
const queryString = require('query-string');
const Stream = require('stream');
const { v4 : uuidv4 } = require('uuid');
const tar = require('tar');

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
      let fileNames = [];
      for (let i = 0; i < files.length; i++) {
        fs.writeFileSync('./code/'+ uuid +'/'+files[i].name, files[i].code,{autoClose: true})
        fileNames.push('./code/'+ uuid +'/'+files[i].name);
        // if (files[i].name.split('.').pop() == 'cpp') 
        tmp += files[i].name; tmp += ' '
      }
      // creates the tar archive to pass in the putArchive function before starting the container
      tar.c({},['./code/'+ uuid +'/']).pipe(fs.createWriteStream('./code/'+ uuid +'/archive.tar',{autoClose: true}));
      break;
    default:
      break;
  }
  return tmp
}

class File{
  constructor(name, text){
    this.name = name
    let buff = new Buffer.from(text, 'base64')
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
            //console.log(process.cwd());
            fs.mkdirSync('./code/' + uuid,{ recursive: true},{autoClose: true})
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
              fs.rmSync('./code/'+ uuid, { recursive: true, autoClose: true });
            })
            docker.createContainer({
              Image: message.language + 'compiler',
              Tty: true,
              HostConfig: {
                AutoRemove: true,
              },
              Env: [
                'PROGID=' + uuid,
                'FILES=' + env
              ],
            },async function(err, container) {
              // set the archive in order to create the files structure in the docker container without the use of volumes
              if (err){
                return console.error(err);
              }
              await container.putArchive('./code/'+ uuid +'/archive.tar',{path: '/'});
              container.start(function (err, data) {
                if (err){
                  return console.error(err);
                }
              });

              container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
                if (err){
                  return console.error(err);
                }
                stream.pipe(writableStream);
              });
            });
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
