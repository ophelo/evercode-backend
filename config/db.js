const mongoose = require('mongoose')

const connectionString =
  process.env.NODE_ENV === 'production'
    ? 'mongodb+srv://evercode-user:rsPNCM6qJXkeZs5Z@evercode.jxxqd.mongodb.net/evercode2?retryWrites=true&w=majority'
    : process.env.MONGO_URL ?? 'mongodb://prova:SECRET@mongodb:27017'

module.exports.getDb = function () {
  console.log(mongoose.connections.length)
  return mongoose.connection
}

module.exports.connectToServer = function () {
  mongoose
    .connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(async () => {
      console.log('connected!')
    })
    .catch((err) => {
      console.log(err)
    })
}
