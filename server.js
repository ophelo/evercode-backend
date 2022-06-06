const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const jwtCheck = require('./config/auth')

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
app.use(jwtCheck)
app.use('/user', require('./api/user/routes'));
app.use('/project', require('./api/project/routes'));
app.use('/comment', require('./api/comment/routes'));
app.use('/reaction', require('./api/reaction/routes'));

app.listen(PORT, () => {
  console.log(`Starto il server sulla porta: ${PORT}!`)
})