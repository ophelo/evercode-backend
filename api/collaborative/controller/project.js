const Project = require('../models/project')
const  File = require('../models/file')
const { Profile } = require('../../user/model')
const escapeStringRegexp = import('escape-string-regexp')

exports.project_create = async (req,res) => {
  try {
    const project = new Project({
      title: req.body.title,
      language: req.body.language,
      description: req.body.description,
    })
    await project.upDate()
    await project.addToUser(req.user.id)
    await project.save()
    return res.status(201).json(project);
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.project_delete = async (req, res) => {
  try {
    if (await req.project.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
    await File.deleteMany({ _id: { $in: req.project.body } })
    await req.project.remove();
    res.json({ message: 'Deleted Project' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.add_file = async (req,res) => {
  try {
    let proj = await Project.findById(req.params.progId)
    if(!await proj.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
    const file = new File({
      fileName: req.body.fileName,
      code: req.body.code,
      project: req.params._id
    })
    await file.pushFile(req.params.progId)
    await proj.upDate()
    await proj.save()
    return res.status(201).json(file);
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
}

exports.project_list = async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.user._id})
      .populate({
        path: 'projects',
        match: { length: {$gte: 0}},
        select: 'title language description date body owners isCollaborative shared',
        populate: {
          path: 'body'
    }
      })
    if(!profile) return res.status(404).json({ message: 'Profile not found' })
    return res.status(200).json(profile.projects)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.owner_projects = async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.params.owner})
      .populate({
      path: 'projects',
      match: { length: {$gte: 0}},
      select: 'title language description date body',
      populate: {
        path: 'body'
    }
    })
    const projects = profile.projects
    if (projects) {
      projects.forEach(proj => { if(!(proj.shared || proj.checkOwners(req.user._id))) projects.pull(proj) }) // quando lo vedrai deciderai cosa fare con la match, grazie <3
      return res.status(200).json(projects)
    } else return res.status(404).json({ message: 'NO Projects for you' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.check_access = async (req, res) => {
  try {
  if (!(req.project.shared || await req.project.checkOwners(req.user._id))) return res.status(403).json({ message: 'Forbidden' })
  let project = await req.project.populate({
    path: 'owners',
    select: 'username'
  })
  return res.status(200).json(project)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
}

exports.get_project = async (req,res,next) => {
  try {
  let project
  project = await Project.findById(req.params._id)
  if(!await project.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
  if (project == null) return res.status(404).json({ message: 'Cannot find project ' })
  req.project = project
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
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
          { email: { $regex, $options: 'i' } }
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
    if (!(req.project.shared || await req.project.checkOwners(req.user._id))) { return res.status(403).json({ message: 'Forbidden' }) }
    const file = await File.find({ _id: { $in: req.project.body } }).populate('fileName', 'code')
    return res.status(200).json(file)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.delete_file = async (req, res) => {
  try {
    // if (res.project.owner.toString() !== user._id.toString()) { return res.status(403).json({ message: 'Forbidden' }) }
    if (!(await req.project.checkOwners(req.user._id))) return res.status(403).json({ message: 'Forbidden' })
    const file = await File.findById({ _id: req.params.idFile });
    await file.remove()
    req.project.save()
    return res.json({ message: 'Deleted file' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.copy_project = async (req, res) => {
  try {
    if (!req.project.shared) return res.status(403).json({ message: 'Forbidden' })
    if (!await req.project.checkOwners(req.owner._id)) return res.status(403).json({ message: 'Already owned' })

    // creation of new copied project with new owner
    const newProject = new Project({
      title: req.project.title,
      owners: [req.user._id],
      language: req.project.language,
      description: req.project.description
    })
      // copy of single files inside project
    await newProject.saveBody(req.project)

    //add new Project to owners list
    await newProject.addToUser(req.user._id)
    await newProject.upDate()
    
      await newProject.save()
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.add_owner = async (req,res) => {
  try {
    if(!await req.project.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
    if(await req.project.checkOwners(req.params.idOwner)) return res.status(403).json({ message: 'Already Owner' })
    await req.project.owners.push(req.params.idOwner)
    await req.project.upDate()
    await req.project.save()
    return res.status(201).json(req.project);
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
}

exports.remove_owner = async (req, res) => {
  try {
    if (!await req.project.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
    let index = await req.project.owners.indexOf(req.params.idOwner)
    if (index > 0 && index < req.project.owners.length) req.project.owners.splice(index,1)
    else return res.status(404).json({ message: 'no owner found with this id'})
    if (req.project.owners.length < 1) await req.project.remove()
    await req.project.upDate()
    await req.project.save()
    return res.json({ message: 'Removed owner' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.set_collaborative = async (req, res) => {
  try{
    if (!await req.project.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
    await req.project.setCollaborative(req.body.val)
    await req.project.upDate()
    await req.project.save()
    return res.status(201).json(res.project);
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.set_shared = async (req, res) => {
  try{
    if (!await req.project.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
    await req.project.setShared(req.body.val)
    await req.project.upDate()
    await req.project.save()
    return res.status(201).json(res.project);
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.update_project = async (req, res) => {
   try {
  if (!await req.project.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })

  if (req.body.title) {
    req.project.title = req.body.title
  }

  if (req.body.description) {
    req.project.description = req.body.description
  }
    await req.project.upDate()
    await req.project.save()
    return res.status(201).json(res.project);
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.save_code = async (req, res) => {
  try {
    if (!await req.project.checkOwners(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
    const file = await File.findById(req.params.idFile)
    file.code = req.body.code
    await file.save()
    if (file == null) res.status(403).json({message: 'file in unavailable state'})
    await req.project.upDate()
    res.status(200).json(file)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
