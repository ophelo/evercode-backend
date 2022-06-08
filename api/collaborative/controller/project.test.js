const ProjectController = require('./project')
const { mockRequest, mockResponse, mockNext } = require('../../../util/interceptor')
const { connectToServer } = require('../../../config/db')
const { MongoMemoryServer } = require('mongodb-memory-server')
const Project = require('../models/project')
const { User, Profile } = require('../../user/model')
const mongoose = require('mongoose')
const { profile_user2, reqUser, profile_user, prj, friend } = require('../../../test/template')

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

describe('Testing Project Create API', () => {
  test('Should return 201 created', async () => {
    // Setup database
    await User.create(reqUser)
    await Profile.create(profile_user)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = reqUser
    req.body.title = "Prova"
    req.body.language = "cpp"
    req.body.description = "test descrizione"

    await ProjectController.project_create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(next).not.toHaveBeenCalled();
  })

  test('Should return validation error', async () => {
    // Setup database
    await User.create(reqUser)
    await Profile.create(profile_user)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = reqUser
    req.body.title = "Prova"
    req.body.language = "cpp"
    req.body.description = "a".repeat(257)

    await ProjectController.project_create(req, res, next);

    expect(next).toHaveBeenCalled()
  })
})

describe('Testing Project Delete API', () => {
  test('Should return 201 created', async () => {
    // Setup database
    const project = prj;
    project.owners.push(reqUser._id)
    const u = await User.create(reqUser)
    await Profile.create(profile_user)
    const p = await Project.create(project)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = u
    req.project = p

    await ProjectController.project_delete(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(next).not.toHaveBeenCalled();
  })

  test('Should a forbidden 403 status', async () => {
    // Setup database
    prj.owners = []
    const user = await User.create(reqUser)
    await Profile.create(profile_user)
    const project = await Project.create(prj)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = user
    req.project = project
    

    await ProjectController.project_delete(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403)
  })
})

describe('Testing add file to project API', () => {
  test('Should return 201 created', async () => {
    // Setup database
    const project = prj;
    project.owners.push(reqUser._id)
    const u = await User.create(reqUser)
    await Profile.create(profile_user)
    const p = await Project.create(project)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = u
    req.body.fileName = "file"
    req.params.progId = p._id

    await ProjectController.add_file(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(next).not.toHaveBeenCalled();
  })

  test('Should a forbidden 403 status', async () => {
    // Setup database
    prj.owners = []
    const user = await User.create(reqUser)
    await Profile.create(profile_user)
    const project = await Project.create(prj)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = user
    req.body.fileName = "file"
    req.params.progId = project._id

    await ProjectController.add_file(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403)
  })
})

describe('Testing project_list API', () => {
  test('Should return 200', async () => {
    // Setup database
    const project = prj;
    project.owners.push(reqUser._id)
    const u = await User.create(reqUser)
    await Profile.create(profile_user)
    const p = await Project.create(project)
    await p.addToUser(u._id)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = u

    await ProjectController.project_list(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  })

  test('Should a forbidden 404 status profile not found', async () => {
    // Setup database
    const u = await User.create(reqUser)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = u
    
    await ProjectController.project_list(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404)
  })
})

