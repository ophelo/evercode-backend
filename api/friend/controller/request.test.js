const RequestController = require('./request')
const { mockRequest, mockResponse } = require('../../../util/interceptor')
const { connectToServer } = require('../../../config/db')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { Profile, User } = require('../../user/model')
const { FriendRequest } = require('../models/friendRequest')
const mongoose = require('mongoose')

const reqUser = {
  __v: 0,
  _id: '6298e797ecccbe6bfbcf741f',
  email: 'user@gmail.com',
  username: 'user'
}

const friend = {
  _id: '6298e797ecccbe6bfbcf845f',
  email: 'amico1@gmail.com',
  username: 'matteoGang'
}

const friend_request = {
  _id: '6298e797ecccbe6bfbcf666f',
  sender: '6298e797ecccbe6bfbcf741f',
  receiver: '6298e797ecccbe6bfbcf845f'
}

const friend_request2 = {
  _id: '6298e797ecccbe6bfbcf666f',
  receiver: '6298e797ecccbe6bfbcf741f',
  sender: '6298e797ecccbe6bfbcf845f'
}

beforeAll(async () => {
  await MongoMemoryServer.create().then((ms) => {
    connectToServer(ms.getUri())
  })
})

afterEach(async () => {
  await mongoose.connection.db.dropDatabase()
})

afterAll(async () => {
  await mongoose.disconnect()
})

describe('Testing Request list API', () => {
  test('Should return the list of send request', async () => {
    // Populate the database
    await User.create(reqUser)
    await Profile.create({ user: reqUser._id })
    await User.create(friend)
    await Profile.create({ user: friend._id })
    const fr = await FriendRequest.create(friend_request)
    await fr.linkUsers()

    const req = mockRequest()
    const res = mockResponse()
    
    // Setting up the request
    req.user = reqUser
    req.query.type = 'send'

    await RequestController.request_list(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).not.toHaveBeenCalledWith([])
  })

  test('Should return zero sent request', async () => {
    // Populate the database
    await User.create(reqUser)
    await Profile.create({ user: reqUser._id })
    await User.create(friend)
    await Profile.create({ user: friend._id })
    const fr = await FriendRequest.create(friend_request2)
    await fr.linkUsers()

    const req = mockRequest()
    const res = mockResponse()
    
    // Setting up the request
    req.user = reqUser
    req.query.type = 'send'

    await RequestController.request_list(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith([])
  })

  test('Should return zero received request', async () => {
    // Populate the database
    await User.create(reqUser)
    await Profile.create({ user: reqUser._id })
    await User.create(friend)
    await Profile.create({ user: friend._id })
    const fr = await FriendRequest.create(friend_request)
    await fr.linkUsers()

    const req = mockRequest()
    const res = mockResponse()
    
    // Setting up the request
    req.user = reqUser
    req.query.type = 'received'

    await RequestController.request_list(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith([])
  })

  test('Should return the list of received request', async () => {
    // Populate the database
    await User.create(reqUser)
    await Profile.create({ user: reqUser._id })
    await User.create(friend)
    await Profile.create({ user: friend._id })
    const fr = await FriendRequest.create(friend_request2)
    await fr.linkUsers()

    const req = mockRequest()
    const res = mockResponse()
    
    // Setting up the request
    req.user = reqUser
    req.query.type = 'received'

    await RequestController.request_list(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).not.toHaveBeenCalledWith([])
  })
})

describe('Testing Request send API', () => {
  test('Should send a request to another user', async () => {
    // Populate the database
    await User.create(reqUser)
    await Profile.create({ user: reqUser._id })
    await User.create(friend)
    await Profile.create({ user: friend._id })

    const req = mockRequest()
    req.user = reqUser
    req.params.friendId = friend._id
    const res = mockResponse()

    await RequestController.request_send(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).not.toHaveBeenCalledWith({})
    expect(res.json).not.toHaveBeenCalledWith(null)
  })
})

describe('Testing action friend request API', () => {
  test('Should accept a friend request ', async () => {
    // Populate the database
    await User.create(reqUser)
    await Profile.create({ user: reqUser._id })
    await User.create(friend)
    await Profile.create({ user: friend._id })
    const fr = await FriendRequest.create(friend_request2)
    await fr.linkUsers()

    const req = mockRequest()
    const res = mockResponse()

    // Setting up request
    req.user = reqUser
    req.params.requestId = friend_request._id
    req.params.cmd = 'accept'

    await RequestController.request_action(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).not.toHaveBeenCalledWith({})
    expect(res.json).not.toHaveBeenCalledWith(null)
  })

  test('Should refuse a friend request ', async () => {
    // Populate the database
    await User.create(reqUser)
    await Profile.create({ user: reqUser._id })
    await User.create(friend)
    await Profile.create({ user: friend._id })
    const fr = await FriendRequest.create(friend_request2)
    await fr.linkUsers()

    const req = mockRequest()
    const res = mockResponse()

    // Setting up request
    req.user = reqUser
    req.params.requestId = friend_request._id
    req.params.cmd = 'refuse'

    await RequestController.request_action(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).not.toHaveBeenCalledWith({})
    expect(res.json).not.toHaveBeenCalledWith(null)
  })
})

describe("Testing request delete API", () => {
  test("Should delete the request correctly", async () => {
    // Setting up database
    await User.create(reqUser)
    await Profile.create({ user: reqUser._id })
    await User.create(friend)
    await Profile.create({ user: friend._id })
    const fr = await FriendRequest.create(friend_request)
    await fr.linkUsers()

    const req = mockRequest()
    const res = mockResponse()

    // Setting up request
    req.user = reqUser
    req.params.reqId = friend_request._id

    await RequestController.request_delete(req,res)

    expect(res.status).toHaveBeenCalledWith(204)
  })
})
