const express = require('express')
const Project = require('./model')
const escapeStringRegexp = require('escape-string-regexp')
const projectRoutes = express.Router()

//create new project
projectRoutes.post('/addProject',async (req, res) => {
  const project = new Project({
    title: req.body.title,
    owner: req.body.owner,
    language: req.body.language,
    description: req.body.description,
    shared: req.body.shared,
    isCollaborative: req.body.isCollaborative,
    collaborators: req.body.collaborators
  })
  try{
    const newProject = await project.save()
    res.status(201).json(newProject)
  }catch(err){
    res.status(400).json({ message: err.message })
  }
})

projectRoutes.get('/projects', async (req, res) => {
  try{
    let projects
    if(!!req.body.keyWord){
      const $regex = escapeStringRegexp(req.body.keyWord)
      projects = await Project.find({
        shared: true,
        $or: [
              {title: { $regex, $options: 'i' }}, 
              {description: { $regex, $options: 'i' }}
               ] 
     })
    }else{
      projects = await Project.find({
        shared: true

      })
    }
    if(!projects){
      return res.status(404).json({ message: "no public project" })
    }
      return res.status(200).json(projects)
  }catch(err){
    res.status(500).json({ message: err.message })
  }
})


//get a project by id
projectRoutes.get('/project/:_id', getProject, async (req, res) => {
  res.status(200).json(res.project)
})

//delete a project by id
projectRoutes.delete('/projects/:_id', getProject, async (req, res) => {
  try{
    await res.project.remove()
    res.json({ message: "Deleted Project" })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//put on project by id
projectRoutes.patch('/projects/:_id', getProject, async (req, res) => {

 if(!!req.body.title){
   res.project.title = req.body.title
 } 

 if(!!req.body.description){
   res.project.description = req.body.description
 } 

 if(!!req.body.shared){
   res.project.shared = req.body.shared
 }

 if(!!req.body.isCollaborative){
   res.project.isCollaborative = req.body.isCollaborative
   res.project.collaborators = req.body.collaborators
 } 

 try {
  const updatedProject = await res.project.save()
  res.json(updatedProject)
 } catch (err) {
   res.status(500).json({ message: err.message})
 }

})

projectRoutes.patch('/projects/code/:_id', getProject, async (req, res) => {
  try{
    res.project.body = req.body.body
    const savedProject = await res.project.save()
    res.json(savedProject)

  }catch(err){
    res.status(500).json({ message: err.message })
  }
})

async function getProject (req, res, next) {
  let project
  try {
    project = await Project.findById(req.params._id)
    if(project == null ){
      return res.status(404).json({ message: "Cannot find project " })
    }
  }catch (err){
    return res.status(400).json({ message: err.message })
  }

  res.project = project
  next()
}


module.exports = projectRoutes
