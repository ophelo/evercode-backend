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
    req.project = p

    await ProjectController.add_file(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(next).not.toHaveBeenCalled();
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

describe('Testing owner_projects API', () => {
  test('Should return 200', async () => {
    // Setup database
    const project = prj;
    project.shared = true
    const u = await User.create(reqUser)
    await Profile.create(profile_user)
    const p = await Project.create(project)
    await p.addToUser(u._id)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = u
    req.params.owner = reqUser._id

    await ProjectController.owner_projects(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).not.toHaveBeenCalledWith([]);
    expect(res.json).not.toHaveBeenCalledWith({});
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
    
    await ProjectController.owner_projects(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404)
  })
})

describe('Testing check_access API', () => {
  test('Should return 200', async () => {
    // Setup database
    const project = prj;
    project.shared = true
    const u = await User.create(reqUser)
    await Profile.create(profile_user)
    const p = await Project.create(project)
    await p.addToUser(u._id)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = u
    req.project = p

    await ProjectController.check_access(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).not.toHaveBeenCalledWith([]);
    expect(res.json).not.toHaveBeenCalledWith({});
    expect(next).not.toHaveBeenCalled();
  })

  test('Should a thorw an error', async () => {
    // Setup database
    const u = await User.create(reqUser)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    // no project sent
    
    await ProjectController.check_access(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  })
})

describe('Testing get_project middleware', () => {
  test('Should set a project in the request obj', async () => {
    // Setup database
    const project = prj;
    project.shared = true
    const u = await User.create(reqUser)
    await Profile.create(profile_user)
    const p = await Project.create(project)
    await p.addToUser(u._id)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = u
    req.params._id = p._id

    await ProjectController.get_project(req, res, next);

    expect(res.project).not.toBe(null);
    expect(next).toHaveBeenCalled();
  })

  test('Should return a 404 error code', async () => {
    // Setup database
    const project = prj;
    project.shared = true
    const u = await User.create(reqUser)
    await Profile.create(profile_user)
    const p = await Project.create(project)
    await p.addToUser(u._id)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = u

    await ProjectController.get_project(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  })
})

describe('Testing search API', () => {
  test('Should return a project with a perfect match', async () => {
    // Setup database
    const project = prj;
    project.shared = true
    const u = await User.create(reqUser)
    await Profile.create(profile_user)
    const p = await Project.create(project)
    await p.addToUser(u._id)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = u
    req.project = p
    req.body.keyWord = 'prova'

    await ProjectController.search(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).not.toHaveBeenCalledWith([]);
    expect(next).not.toHaveBeenCalled();
  })

  test('Should return the projects that contains a partial string sent', async () => {
    // Setup database
    const project = prj;
    project.shared = true
    const u = await User.create(reqUser)
    await Profile.create(profile_user)
    const p = await Project.create(project)
    await p.addToUser(u._id)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = u
    req.project = p
    req.body.keyWord = 'pro'

    await ProjectController.search(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).not.toHaveBeenCalledWith([]);
    expect(next).not.toHaveBeenCalled();
  })

  test('Should return nothing', async () => {
    // Setup database
    const project = prj;
    project.shared = true
    const u = await User.create(reqUser)
    await Profile.create(profile_user)
    const p = await Project.create(project)
    await p.addToUser(u._id)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = u
    req.project = p
    req.body.keyWord = 'ddd'

    await ProjectController.search(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
    expect(next).not.toHaveBeenCalled();
  })

  test('Should return an error', async () => {
    // Setup database
    const project = prj;
    project.shared = true
    const u = await User.create(reqUser)
    await Profile.create(profile_user)
    const p = await Project.create(project)
    await p.addToUser(u._id)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = u
    req.project = p

    await ProjectController.search(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  })
})

describe('Testing get_files API', () => {
  test('Should return 200', async () => {
    // Setup database
    const project = prj;
    project.shared = true
    const u = await User.create(reqUser)
    await Profile.create(profile_user)
    const p = await Project.create(project)
    await p.addToUser(u._id)
    await p.addFile("prova", "codice")

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = u
    req.project = p

    await ProjectController.get_files(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).not.toHaveBeenCalledWith([]);
    expect(res.json).not.toHaveBeenCalledWith({});
    expect(next).not.toHaveBeenCalled();
  })

  test('Should a thorw an error', async () => {
    // Setup database

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    // no project sent
    
    await ProjectController.get_files(req, res, next);

    expect(next).toHaveBeenCalled();
  })
})

describe('Testing delete_file API', () => {
  test('Should return 204', async () => {
    // Setup database
    const project = prj;
    project.shared = true
    const u = await User.create(reqUser)
    await Profile.create(profile_user)
    const p = await Project.create(project)
    await p.addToUser(u._id)
    const f = await p.addFile("prova", "codice")


    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    req.user = u
    req.project = p
    req.params.idFile = f._id

    await ProjectController.delete_file(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(next).not.toHaveBeenCalled();
  })

  test('Should a thorw an error', async () => {
    // Setup database
    const u = await User.create(reqUser)

    // Instance mock req and  res
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    // no project sent
    
    await ProjectController.delete_file(req, res, next);

    expect(next).toHaveBeenCalled();
  })
})