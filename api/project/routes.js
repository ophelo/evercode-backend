const express = require('express')
const Project = require('./model')
const File = require('./modelFile')
const escapeStringRegexp = import('escape-string-regexp')
const { User, Profile } = require('../user/model')
const projectRoutes = express.Router()

// create new project
projectRoutes.post('/add', async (req, res) => {
  const user = await User.findOne({
    email: req.auth['https://evercode.com/email']
  })
  const file = new File({
    fileName: 'file',
    code: req.body.code
  })

  const project = new Project({
    title: req.body.title,
    owner: user._id,
    language: req.body.language,
    description: req.body.description,
    shared: req.body.shared
  })

  try {
    const newFile = await file.save()
    project.body.push(newFile)
    await project.save()
    const profile = await Profile.findOne({ user: user._id })
    profile.projects.push(project)
    await profile.save()
    return res.status(201).json(project)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

//  project by id ( per aprire un progetto specifico)
projectRoutes.get('/:_id', getProject, async (req, res) => {
  if (!res.project.shared) {
    const user = await User.findOne({
      email: req.auth['https://evercode.com/email']
    })
    if (user._id.toString() !== res.project.owner.toString()) { return res.status(403).json({ message: 'Forbidden' }) }
  }
  return res.status(200).json(res.project)
})

/* by owner id -> title,language,description.. */
projectRoutes.get('/owner/:owner', async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.auth['https://evercode.com/email']
    })
    const projects = await Project.find({ owner: req.params.owner })
    if (projects) {
      const filteredProjects = projects.filter(val => val.shared || (!val.shared && req.params.owner.toString() === user._id.toString()))
      const deserializedProject = filteredProjects.map((val) => {
        return {
          title: val.title,
          language: val.language,
          description: val.description,
          date: val.date,
          body: val.body
        }
      })
      return res.status(200).json(deserializedProject)
    } else return res.status(404).json({ message: 'NO Projects for you' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

// list of personal projects
projectRoutes.get('/view/my', async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.auth['https://evercode.com/email']
    })
    const profile = await Profile.findOne({ user: user._id })
    if (profile.projects) {
      const filteredProjects = await profile.projects.map(async (val) => {
        const project = await Project.findById(val)
        if (!project) return {}
        return {
          id: project._id,
          title: project.title,
          language: project.language,
          description: project.description,
          date: project.date,
          body: project.body
        }
      })
      return res.status(200).json(await Promise.all(filteredProjects))
    } else return res.status(404).json({ message: 'You have no Projects :( ' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

// global research
// projectRoutes.get('/search', async (req, res) => {
//   try {
//     let projects
//     if (req.body.keyWord) {
//       const $regex = escapeStringRegexp(req.body.keyWord)
//       projects = await Project.find({
//         shared: true,
//         $or: [
//           { title: { $regex, $options: 'i' } },
//           { description: { $regex, $options: 'i' } }
//         ]
//       })
//     } else {
//       projects = await Project.find({ shared: true })
//     }
//     if (!projects) {
//       return res.status(404).json({ message: 'no public project' })
//     }
//     return res.status(200).json(projects)
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }
// })

// get files of a project by id
projectRoutes.get('/:_id/viewFiles', getProject, async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.auth['https://evercode.com/email']
    })
    if (!res.project.shared && res.project.owner.toString() !== user._id.toString()) { return res.status(403).json({ message: 'Forbidden' }) }
    const files = await File.find({ _id: { $in: res.project.body } })
    res.status(200).json(files)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// delete a project by id
projectRoutes.delete('/:_id', getProject, async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.auth['https://evercode.com/email']
    })
    if (res.project.owner.toString() !== user._id.toString()) { return res.status(403).json({ message: 'Forbidden' }) }
    await File.deleteMany({ _id: { $in: res.project.body } })
    await res.project.delete()
    res.json({ message: 'Deleted Project' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// delete single file by id
projectRoutes.delete('/:_id/file/:idFile', getProject, async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.auth['https://evercode.com/email']
    })
    if (res.project.owner.toString() !== user._id.toString()) { return res.status(403).json({ message: 'Forbidden' }) }
    const file = await File.findById({ _id: req.params.idFile })
    await file.remove()
    return res.json({ message: 'Deleted file' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

// put on project by id
projectRoutes.patch('/:_id', getProject, async (req, res) => {
  const user = await User.findOne({
    email: req.auth['https://evercode.com/email']
  })
  if (res.project.owner.toString() !== user._id.toString()) { return res.status(403).json({ message: 'Forbidden' }) }

  if (req.body.title) {
    res.project.title = req.body.title
  }

  if (req.body.description) {
    res.project.description = req.body.description
  }

  if (req.body.shared) {
    res.project.shared = req.body.shared
  }
  // wrong type of assign
  if (req.body.isCollaborative) {
    res.project.isCollaborative = req.body.isCollaborative
    res.project.collaborators = req.body.collaborators
  }

  try {
    res.project.date = Date.now()
    await res.project.save()
    return res.status(201).json(res.project)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

// save code on file
projectRoutes.patch('/:_id/file/:idFile', getProject, async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.auth['https://evercode.com/email']
    })
    if (res.project.owner.toString() !== user._id.toString()) { return res.status(403).json({ message: 'Forbidden' }) }
    const file = await File.findById(req.params.idFile)
    file.fileName = req.body.fileName
    file.code = req.body.code
    res.project.date = Date.now()
    const updatedFile = await file.save()
    res.status(200).json(updatedFile)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// create new file for a project
projectRoutes.post('/:_id/addFile', getProject, async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.auth['https://evercode.com/email']
    })
    const project = await Project.findById(req.params._id)
    if (project.owner.toString() !== user._id.toString()) { return res.status(403).json({ message: 'Forbidden' }) }

    const file = new File({
      fileName: req.body.fileName,
      code: req.body.code,
      project: req.params._id
    })
    res.project.date = Date.now()
    const savedFile = await file.save()
    res.project.body.push(savedFile)
    await res.project.save()
    res.json(savedFile)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

async function getProject (req, res, next) {
  let project
  try {
    project = await Project.findById(req.params._id)
    if (project == null) {
      return res.status(404).json({ message: 'Cannot find project ' })
    }
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }

  res.project = project
  next() // vai alla prossima route
}

// Paginated Project Research ( sia nome che descrizione ) 
projectRoutes.get('/search', async (req, res) => {
  try {
    let projects
    let n = 10
    let page = req.params.page ?? 1
    if (req.body.keyWord) {
      const $regex = escapeStringRegexp(req.body.keyWord)
      projects = await Project.find({
        shared: true,
        $or: [
          { title: { $regex, $options: 'i' } },
          { description: { $regex, $options: 'i' } }
        ]
      }).skip((n*page) - n)
      .limit(n)
    } else {
      projects = await Project.find({ shared: true })
    }
    if (!projects) {
      return res.status(404).json({ message: 'no public project' })
    }
    return res.status(200).json(projects)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
module.exports = projectRoutes
