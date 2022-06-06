const express = require('express')
const RequestController = require('./controller/request')
const { getUser } = require('../middleware/auth')

const collRequestRoutes = express.Router()

collRequestRoutes.delete('/request/:reqestId', getUser, RequestController.request_delete);

collRequestRoutes.post('/request/send/:projectId/:receiverId', getUser, RequestController.request_send)

collRequestRoutes.get('/request', getUser, RequestController.request_list)

collRequestRoutes.post('/request/:requestId/:cmd', getUser, RequestController.request_action)

module.exports = collRequestRoutes
