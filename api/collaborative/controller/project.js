const { Project, File } = require('../models')
const { Profile } = require('../../user/model')
const escapeStringRegexp = require('escape-string-regexp')
const { User, Profile } = require('../user/model')

exports.project_create = async (req,res) => {
  try {
    const project = new Project({
      title: req.body.title,
      language: req.body.language,
      description: req.body.description,
    })
    project.upDate()
    await project.save();
    project.addToUser(req.user.id)
    return res.status(201).json(project);
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
}

exports.project_delete = async (req, res) => {
  try {
    if (!req.project.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
    await File.deleteMany({ _id: { $in: req.project.body } })
    await req.project.delete();
    res.json({ message: 'Deleted Project' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.add_file = async (req,res) => {
  try {
    let proj = await Project.findById(req.params.progId)
    proj.checkOwners(req.user._id)
    const file = new File({
      fileName: req.body.name,
      code: req.body.code,
      project: req.params._id
    })
    file.pushFile(req.params.progId)
    req.project.upDate()
    await req.project.save()
    return res.status(201).json(file);
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
}

exports.project_list = async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.user._id});
    if (profile.projects) {
      const filteredProjects = await profile.projects.map(async (val) => {
        const project = await Project.findById(val);
        if (!project) return {}
        return {
          id: project._id,
          title: project.title,
          language: project.language,
          description: project.description,
          date: project.date,
          body: project.body
        }
      });
      return res.status(200).json(await Promise.all(filteredProjects))
    } else return res.status(404).json({ message: 'NO Projects for you' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.owner_projects = async (req, res) => {
  try {
    const profile = Profile.findOne({user: req.params.owner})
    const projects = profile.projects
    if (projects) {
      const filteredProjects = projects.filter(val => {
        let proj = await Project.findById(val)
        if(proj.shared || (!proj.shared && proj.checkOwners(req.user._id))) return true
        return false
      })
      const deserializedProject = filteredProjects.map((val) => {
        let proj = await Project.findById(val)
        return {
          title: proj.title,
          language: proj.language,
          description: proj.description,
          date: proj.date,
          body: proj.body
        }
      })
      return res.status(200).json(deserializedProject)
    } else return res.status(404).json({ message: 'NO Projects for you' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.check_access = async (req, res) => {
  if (!req.project.shared && !req.project.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
  return res.status(200).json(req.project)
}

exports.get_project = async (req,res,next) => {
  let project
  try {
    project = await Project.findById(req.params._id)
    if (project == null) {
      return res.status(404).json({ message: 'Cannot find project ' })
    }
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
  req.project = project
  next()
}

exports.search = async (req, res) => {
  try {
    let projects
    if (req.body.keyWord) {
      const $regex = escapeStringRegexp(req.body.keyWord)
      projects = await Project.find({
        shared: true,
        $or: [
          { title: { $regex, $options: 'i' } },
          { description: { $regex, $options: 'i' } }
        ]
      })
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
}

exports.get_files = async (req, res) => {
  try {
    if (!req.project.shared && !req.project.checkOwners(req.user._id)) { return res.status(403).json({ message: 'Forbidden' }) }
    const file = await File.find({ _id: { $in: req.project.body } })
    return res.status(200).json(file)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.delete_file = async (req, res) => {
  try {
    // if (res.project.owner.toString() !== user._id.toString()) { return res.status(403).json({ message: 'Forbidden' }) }
    if (!req.project.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
    const file = await File.findById({ _id: req.params.idFile });
    await file.pullFile()
    return res.json({ message: 'Deleted file' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.copy_project = async (req, res) => {
  try {
    if (!req.project.shared) return res.status(403).json({ message: 'Forbidden' })

    // creation of new copied project with new owner
    const newProject = new Project({
      title: req.project.title,
      owners: [req.user._id],
      language: req.project.language,
      description: req.project.description
    })
      // copy of single files inside project
    newProject.saveBody(req.project)

    //add new Project to owners list
    newProject.addToUser(req.user._id)
    
      await req.project.save()
      await newProject.save()
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.remove_owner = async (req, res) => {
  try {
    // if (res.project.owner.toString() !== user._id.toString()) { return res.status(403).json({ message: 'Forbidden' }) }
    if (!req.project.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
    let index = req.project.owners.indexOf(req.params.idOwner)
    if (index > 0 && index < req.project.owners.length)req.project.owners.splice(index,1)
    else return res.status(404).json({ message: 'no owner found with this id'})
    if (req.project.owners.length < 1) await req.project.remove()
    req.project.upDate()
    await req.project.save()
    return res.json({ message: 'Removed owner' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.set_collaborative = async (req, res) => {
  try{
    if (req.project.checkOwner(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
    res.project.setCollaborative(req.params.val)
    req.project.upDate()
    await req.project.save()
    return res.status(201).json(res.project);
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.set_shared = async (req, res) => {
  try{
    if (req.project.checkOwner(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
    res.project.setShared(req.params.val)
    req.project.upDate()
    await req.project.save()
    return res.status(201).json(res.project);
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}
exports.update_project = async (req, res) => {
   try {
  if (!req.project.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })

  if (req.body.title) {
    req.project.title = req.body.title
  }

  if (req.body.description) {
    req.project.description = req.body.description
  }
    req.project.upDate()
    await req.project.save()
    return res.status(201).json(res.project);
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.save_code = async (req, res) => {
  try {
    // if (res.project.owner.toString() !== user._id.toString()) { return res.status(403).json({ message: 'Forbidden' }) }
    if (!req.project.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
      const file = await File.findById(req.params.idFile)
      const updatedFile = file.saveFile(req.file)
    if (file == null) res.status(403).json({message: 'file in unavailable state'})
      req.project.upDate()
      res.status(200).json(updatedFile)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
