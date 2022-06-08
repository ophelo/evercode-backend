const ProjectController = require('./request')
const { mockRequest, mockResponse } = require('../../../util/interceptor')
const { connectToServer } = require('../../../config/db')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { Profile, User } = require('../../user/model')
const { Project } = require('../models/project')
const mongoose = require('mongoose')

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

})
