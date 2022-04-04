const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const PORT = process.env.PORT || 5000

const app = express()

const uri =
  process.env.NODE_ENV === 'production'
    ? 'mongodb+srv://evercode-user:rsPNCM6qJXkeZs5Z@evercode.jxxqd.mongodb.net/evercode2?retryWrites=true&w=majority'
    : process.env.MONGO_URL ?? 'mongodb://prova:SECRET@localhost:27017'

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('connected!')
  })
  .catch((err) => {
    console.log(err)
  })

app.use(cors())
app.use(express.json())
app.use(require('./api/user/routes'))

app.listen(PORT, () => {
  console.log(`Starto il server sulla porta: ${PORT}!`)
})
