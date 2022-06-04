const { expressjwt: jwt } = require('express-jwt')
const jwks = require('jwks-rsa')

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://dev-yvx59wsh.us.auth0.com/.well-known/jwks.json'
  }),
  audience: process.env.HEROKU_APP_NAME ? 'https://' + process.env.HEROKU_APP_NAME + '.herokuapp.com' : 'http://localhost:5000',
  issuer: 'https://dev-yvx59wsh.us.auth0.com/',
  algorithms: ['RS256']
})

module.exports = jwtCheck
