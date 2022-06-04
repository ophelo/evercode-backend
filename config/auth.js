const dotenv = require('dotenv')
const { expressjwt: jwt } = require('express-jwt')
const jwks = require('jwks-rsa')
const { ManagementClient } = require('auth0')

dotenv.config()

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://' + process.env.AUTH0_DOMAIN + '/.well-known/jwks.json'
  }),
  audience: process.env.HEROKU_APP_NAME ? 'https://' + process.env.HEROKU_APP_NAME + '.herokuapp.com' : 'http://localhost:5000',
  issuer: 'https://'+ process.env.AUTH0_DOMAIN + "/",
  algorithms: ['RS256']
})

const management = new ManagementClient({
  grant_type: 'client_credentials',
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  domain: process.env.AUTH0_DOMAIN
})

module.exports = {
  jwtCheck: jwtCheck,
  management: management
}
