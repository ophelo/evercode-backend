const mongoose = require('mongoose')
const connectionString = !process.env.ATLAS_URI
  ? 'mongodb+srv://evercode-user:rsPNCM6qJXkeZs5Z@evercode.jxxqd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
  : process.env.ATLAS_URI

module.exports.getDb = function () {
  console.log(mongoose.connections.length)
  return mongoose.connection
}

module.exports.connectToServer = function (callback) {
  mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  return callback()
}
