const mongoose = require('mongoose')

const connectionString =
  process.env.NODE_ENV === 'production'
    ? 'mongodb+srv://evercode-user:rsPNCM6qJXkeZs5Z@evercode.jxxqd.mongodb.net/evercode2?retryWrites=true&w=majority'
    : process.env.MONGO_URL ?? 'mongodb://prova:SECRET@localhost:27017'

module.exports.getDb = function () {
  console.log(mongoose.connections.length)
  return mongoose.connection
}

module.exports.connectToServer = function (url) {
  mongoose
    .connect(!url ? connectionString : url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(async () => {
      console.log('connected!')
      // await mongoose.connection.db.dropDatabase()
    })
    .catch((err) => {
      console.log(err)
    })
}
