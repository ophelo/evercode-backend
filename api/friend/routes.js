const express = require('express')
const FriendController = require('./controller/friend')
const RequestController = require('./controller/request')

const friendRoutes = express.Router()

friendRoutes.post("/request/send/:friendId", RequestController.request_send);

friendRoutes.get("/request", RequestController.request_list)

friendRoutes.post("/request/:requestId/:cmd", RequestController.request_action);

friendRoutes.get("/", FriendController.friend_list);

module.exports = friendRoutes
