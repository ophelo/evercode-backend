const dotenv = require('dotenv')
const { connectToServer } = require('./config/db')
const WsCompilerServer = require('./api/compiler/websocket/jobserver')
const app = require('./app')

dotenv.config()

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`Starto il server sulla porta: ${PORT}!`)
})

WsCompilerServer(server)

process.on('message', (message) => {
  console.log(message)
})
