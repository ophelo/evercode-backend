const express = require('express')
const Project = require('./model')
const File = require('./modelFile')
const escapeStringRegexp = require('escape-string-regexp')
const { deleteMany } = require('./model')
const projectRoutes = express.Router()

//create new project
projectRoutes.post('/addProject',async (req, res) => {

  const file = new File({
    fileName: req.body.title,
    code: req.body.code
  })

    const project = new Project({
      title: req.body.title,
      owner: req.body.owner,
      language: req.body.language,
      description: req.body.description,
      shared: req.body.shared
    })

  try{
    const newFile = await file.save()
    project.body.push(newFile)
    const newProject = await project.save()
    res.status(201)
  }catch(err){
    res.status(400).json({ message: err.message })
  }
})

//project by id
projectRoutes.get('/project/:_id', getProject , async (req, res) =>{
  try{
    const filteredProject = res.project.map(val => {
        return { title: val.title,
                 language: val.language,
                 description: val.description,
                 date: val.date,
                 body: val.body}})
    return res.status(200).json( filteredProject)
  }catch(err){
    return res.status(500).json({ message: err.message })
  }
})

/*by owner id -> title,language,description.. */
projectRoutes.get('/myproject/:owner', async (req, res) =>{
  try{
    const projects = await Project.find({ owner: req.params.owner })
    if(!!projects){
      const filteredProjects = projects.map(val => {
        return { title: val.title,
                 language: val.language,
                 description: val.description,
                 date: val.date,
                 body: val.body}})
      return res.status(200).json(filteredProjects)
    }else return res.status(404).json({ message: "NO Projects for you"})
  }catch(err){
    return res.status(500).json({ message: err.message })
  }
})

//list of personal projects
projectRoutes.get('/project/myprojects', async (req, res) =>{
  try{
    const projects = await Project.find({ _id: { $in: req.body.projectList } })
    if(!!projects){
      const filteredProjects = projects.map(val => {
        return { title: val.title,
                 language: val.language,
                 description: val.description,
                 date: val.date,
                 body: val.body}})
      return res.status(200).json(filteredProjects)

    }else return res.status(404).json({ message: "NO Projects for you"})

  }catch(err){
    return res.status(500).json({ message: err.message })
  }
})

//global research
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
      projects = await Project.find({ shared: true })
    }
    if(!projects){
      return res.status(404).json({ message: "no public project" })
    }
      return res.status(200).json(projects)
  }catch(err){
    res.status(500).json({ message: err.message })
  }
})


//get files of a project by id
projectRoutes.get('/project/code/:_id', getProject, async (req, res) => {
  try{
    const files = await File.find({ _id: { $in: res.project.body } })
    res.status(200).json(files)
  }catch(err){
    res.status(500).json({ message: err.message })
  }
})

//delete a project by id
projectRoutes.delete('/projects/:_id', getProject, async (req, res) => {
  try{
    await File.deleteMany({ _id: { $in: res.project.body } })
    await res.project.delete()
    res.json({ message: "Deleted Project" })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//delete single file by id
projectRoutes.delete('project/:_id/:idFile', getProject, async (req, res) => {
  try{
    await File.findOneAndDelete({ _id: req.params.idFile })
    res.json({ message: "Deleted file" })
  }catch(err){
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
//wrong type of assign
 if(!!req.body.isCollaborative){
   res.project.isCollaborative = req.body.isCollaborative
   res.project.collaborators = req.body.collaborators
 } 

 try {
  res.project.date = Date.now()
  const updatedProject = await res.project.save()
  res.status(201)
 } catch (err) {
   res.status(500).json({ message: err.message})
 }

})

//save code on files
projectRoutes.patch('/project/code/save', async (req, res) => {
  try{
    let file = await File.findById(req.body._id)
    file.fileName = req.body.fileName
    file.code = req.body.code
    res.project.date = Date.now()
  const updatedFile = await file.save()
  const updatedProject = await res.project.save()
  res.status(201)
  }catch(err){
   res.status(500).json({ message: err.message})
  }
})

//create new file for a project
projectRoutes.patch('/projects/code/:_id', getProject, async (req, res) => {
  try{
    const file = new File({
      fileName: req.body.fileName,
      code: req.body.code
    })
    res.project.date = Date.now()
    const savedFile = await file.save()
    res.project.body.push(savedFile)
    const savedProject = await res.project.save()
    res.json(savedFile)

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
