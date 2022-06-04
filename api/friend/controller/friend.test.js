const FriendController = require('./friend')
const { mockRequest, mockResponse } = require('../../../util/interceptor')
const { User, Profile } = require('../../user/model')
const { connectToServer } = require('../../../config/db')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

const reqUser = {
  _id: '6298e797ecccbe6bfbcf741f',
  email: 'user@gmail.com',
  username: 'user'
}

const friend = {
  _id: '6298e797ecccbe6bfbcf845f',
  email: 'amico1@gmail.com',
  username: 'matteoGang'
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

describe('Testing friend list API', () => {
  test('Should return the list of firends', async () => {
    // Populate the database
    await User.create(reqUser)
    const fr = await User.create(friend)
    await Profile.create({ user: reqUser._id, friends: [friend._id] })

    const req = mockRequest()
    const res = mockResponse()

    req.user = reqUser

    await FriendController.friend_list(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).not.toHaveBeenCalledWith([])
  })
})
