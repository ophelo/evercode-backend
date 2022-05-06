const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const jwtCheck = require('./config/auth')
const { connectToServer, } = require('./config/db')

dotenv.config()

connectToServer();

const PORT = process.env.PORT || 5000

const app = express();

// Setting up middleware
app.use(cors());
app.use(express.json());
app.use(jwtCheck);

// Setting up routes
app.use("/user", require('./api/user/routes'));
app.use('/auth', require('./api/auth/routes'));

app.listen(PORT, () => {
  console.log(`Starto il server sulla porta: ${PORT}!`)
})
