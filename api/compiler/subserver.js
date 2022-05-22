import {Docker} from 'node-docker-api';
import {WebSocketServer} from 'ws';

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
  CLOSE:0,
  COMPILE:1,
  RUN:2,
  STREAM:3,
  INFO:4
};

const promisifyStream = stream => new Promise((resolve, reject) => {
  stream.on('data', data => console.log(data.toString()))
  stream.on('end', resolve)
  stream.on('error', reject)
});

function findDocker(lang) {
    return container;
};

class Container{
  constructor(){
    this.docker = new Docker({socketPath : '/var/run/docker.sock'});
    console.log('Docker created: '+this.docker);
    this.docker.container.create({ // se sulla macchina non è installata l'immagine di ubuntu esplode
      Image: 'ubuntu',
      // name: 'test123'
    }).then(container => container.start());
    this.state = 0;
  }
}

class Job{
  constructor(){ //jobId,code,language <-- will be inserted when received
    this.code = '#include<stdlib.h>\nint main()\n{\nprintf("Hello World !");\nreturn 0;\n}'; //will be code var
    console.log(this.code);
    this.cont = findDocker(0); // 0 is language
    console.log(this.container);
    this.state = State.PENDING;
    console.log('State = '+this.state);
  }
  setState(state){
    this.state = state;
  }
}

var container = new Container();

wsServer.on('connection', function connection(ws) {
  var job = new Job();
    ws.on('message', function(message) {
      console.log('Il messaggio ricevuto è: ' + message);
      switch (message.toString()) {
        case "1":
          ws.send("Compiling..");
          job.state = State.RUNNING;
          job.cont.state = 1;
          () => { 
            return job.cont.docker.container.exec.create({
              AttachStdout: false,
              AttachStderr: false,
              Cmd: [ 'echo', this.code+' > file.c' ] // compile and run
            })
            .then(exec => {
              return exec.start({ Detach: false })
            })
          .then(() => { 
            return container.exec.create({
              AttachStdout: true,
              AttachStderr: true,
              Cmd: [ 'cat', 'file.c' ] // compile and run
            })
            .then(exec => {
              return exec.start({ Detach: false })
            })
            .then(stream => promisifyStream(stream));
          })
          .then(() => { 
            return container.exec.create({
              AttachStdout: true,
              AttachStderr: true,
              Cmd: [ 'gcc', 'file.c' ] // compile and run
            })
            .then(exec => {
              return exec.start({ Detach: false })
            })
            .then(stream => promisifyStream(stream));
          });
          }
          break;
        case "2":
          job.state = State.RUNNING;
          job.cont.state = 1;
          () => { 
            return job.cont.docker.container.exec.create({
              AttachStdout: false,
              AttachStderr: false,
              Cmd: [ 'echo', this.code+' > file.c' ] // compile and run
            })
            .then(exec => {
              return exec.start({ Detach: false })
            })
          .then(() => { 
            return container.exec.create({
              AttachStdout: true,
              AttachStderr: true,
              Cmd: [ 'cat', 'file.c' ] // compile and run
            })
            .then(exec => {
              return exec.start({ Detach: false })
            })
            .then(stream => promisifyStream(stream));
          })
          .then(() => { 
            return job.cont.docker.container.exec.create({
              AttachStdout: true,
              AttachStderr: true,
              Cmd: [ 'gcc', 'file.c' ] // compile and run
            })
            .then(exec => {
              return exec.start({ Detach: false })
            })
            .then(stream => promisifyStream(stream));
          })
          .then(() => { 
            return job.cont.docker.container.exec.create({
              AttachStdout: true,
              AttachStderr: true,
              Cmd: [ './a.out' ] // compile and run
            })
            .then(exec => {
              return exec.start({ Detach: false })
            })
            .then(stream => promisifyStream(stream));
          });
          }
          break;
        case "3":
                                                                                  //change console.log(...) to send through websocket
          if (this.state == State.RUNNING) job.container.docker.stream.on('data', data => console.log(data.toString()));
          break;
        case Mess.INFO:
          console.log('JobId = ' + this.jobId);
          console.log('UserId = ' + 0);  //how to find userid
          console.log('State = ' + this.state);
          break;
        default:
          console.log('Message not recognized');
          break;
      }
    });
    // ws.on('close', function(ws) {
    //     job.state = State.TERMINATED;
    //     console.log("closed");
    //     ws.close(1, "gay");
    // });
});

// // Define main script
// const main = async () => {
//   while(1);
// };

// // Start script
// main().catch(err => {
//   console.error(err);
//   process.exit(1); // Retry Job Task by exiting the process
// });
