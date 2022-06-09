const Project = require('../models/project')
const  File = require('../models/file')
const  Meta = require('../models/meta')
const { Profile } = require('../../user/model')
const escapeStringRegexp = import('escape-string-regexp')

exports.project_create = async (req, res, next) => {
  try {
    const project = new Project({
      title: req.body.title,
      language: req.body.language,
      description: req.body.description,
    })
    const meta = await Meta.create({project: project._id});
    project.meta= meta._id; 
    await project.upDate()
    await project.addToUser(req.user._id)
    await project.save()
    return res.status(201).json(project);
  } catch (err) {
    next(err)
  }
}

exports.project_delete = async (req, res, next) => {
  try {
    const check = await req.project.checkOwners(req.user._id)
    if (!check) return res.status(403).json({ message: 'Forbidden' })
    await File.deleteMany({ _id: { $in: req.project.body } })
    await req.project.remove();
    return res.status(204).json({ message: 'Deleted Project' })
  } catch (err) {
    next(err)
  }
}

exports.add_file = async (req, res, next) => {
  try {
    let proj = await Project.findById(req.params.progId)
    const check = await proj.checkOwners(req.user._id)
    if(!check) return res.status(403).json({ message: 'Forbidden' })
    const file = new File({
      fileName: req.body.fileName,
      code: req.body.code,
      project: req.params.progId
    })
    await file.pushFile(req.params.progId)
    await proj.upDate()
    await proj.save()
    return res.status(201).json(file);
  } catch (err) {
    next(err)
  }
}

exports.project_list = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({user: req.user._id})
      .populate({
        path: 'projects',
        match: { length: {$gte: 0}},
        select: 'title language description lastSave body owners isCollaborative shared',
        populate: {
          path: 'body'
        }
      })
    if(!profile) return res.status(404).json({ message: 'Profile not found' })
    return res.status(200).json(profile.projects)
  } catch (err) {
    next(err)
  }
}

exports.owner_projects = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({user: req.params.owner})
      .populate({
      path: 'projects',
      select: 'title language shared owners description body lastSave',
      populate: {
        path: 'body'
    }
    })
    if(!profile) return res.status(404).json({ error: 'Profile not found' })
    const projects = profile.projects
    if (projects) {
      return res.status(200).json(projects.filter((proj) => {return proj.shared || proj.checkOwners(req.user._id)} ))
    } else return res.status(404).json({ message: 'NO Projects for you' })
  } catch (err) {
    next(err)
  }
}

exports.check_access = async (req, res, next) => {
  try {
    if (!req.project) return res.status(404).json({error: "project not found"})
    let project = await req.project
      .populate([
        {
          path: 'owners',
          select: 'username'
        },
        {
          path: 'meta',
        }
      ])
    await project.meta.visualize()
    return res.status(200).json(project)
  } catch (err) {
    next(err)
  }
}

exports.get_project = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params._id)
    if (project == null) return res.status(404).json({ message: 'Cannot find project ' })
    if (!(project.shared || await project.checkOwners(req.user._id))) return res.status(403).json({ message: 'Forbidden' })
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
    console.log(err.name)
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
    let meta = await Meta.findById(req.project.meta)
    meta.copied += 1
    await meta.save()

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
    if (!await req.project.checkOwners(req.params.idOwner)) return res.status(400).json({ message: 'User is not an owner' })
    let index = await req.project.owners.indexOf(req.params.idOwner)
    if (index >= 0 && index < req.project.owners.length) req.project.owners.splice(index,1)
    else return res.status(404).json({ message: 'no owner found with this id'})
    if (req.project.owners.length < 1) { await req.project.remove(); return res.status(200).json({ message: 'Removed owner and project' })}
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
    const meta = await Meta.create({project: req.project._id});
    req.project.meta= meta._id; 
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
