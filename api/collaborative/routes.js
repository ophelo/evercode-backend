const express = require('express')
const { getUser } = require('../../middleware/auth')
const ProjectController = require('./controller/project')

const projectRoutes2 = express.Router()

// create new project
projectRoutes2.post('/add', getUser, ProjectController.project_create)

projectRoutes2.post('/addFile/:progId', getUser, ProjectController.add_file)

// project by id
projectRoutes2.get('/:_id', getUser, ProjectController.get_project, ProjectController.check_access)

/* by owner id -> title,language,description.. */
projectRoutes2.get('/owner/:owner', getUser, ProjectController.owner_projects)

// list of personal projects
projectRoutes2.get('/view/my', getUser, ProjectController.project_list)

// global research
projectRoutes2.get('/search', ProjectController.search)

// get files of a project by id
projectRoutes2.get('/:_id/viewFiles', getUser, ProjectController.get_project,)

// delete a project by id
projectRoutes2.delete('/:_id', getUser, ProjectController.get_project, ProjectController.project_delete)

// DA VEDERE CON IL SERVER DI COMPILAZIONE
// delete single file by id
projectRoutes2.delete('/:_id/file/:idFile', getUser, ProjectController.get_project, ProjectController.delete_file)

// sets the value of collaborative flag to the value given
projectRoutes2.patch('/:_id/setCollaborative/:val',getUser, ProjectController.get_project, ProjectController.set_collaborative)

//sets the value of shared flag to the value given
projectRoutes2.patch('/:_id/setShared/:val',getUser, ProjectController.get_project, ProjectController.set_shared)

// put on project by id
projectRoutes2.patch('/:_id', getUser, ProjectController.get_project, ProjectController.update_project)

// save code on file
projectRoutes2.patch('/:_id/save/file/:idFile', getUser, ProjectController.get_project, ProjectController.save_code)

//remove a owner
projectRoutes2.delete('/:_id/owner/:idOwner', getUser, ProjectController.get_project, ProjectController.remove_owner)

// copy project
projectRoutes2.post('/copyProject/:_id/', getUser, ProjectController.get_project, ProjectController.copy_project)

module.exports = projectRoutes2
