const mongoose = require('mongoose');
const {Profile, User} = require('../../user/model');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true }, // to exist a project must have a title
  owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // to exist must have a project owner
  language: {
    type: String,
    required: true,
    enum: ['cpp', 'javascript', 'python']
  }, // to exist a project need a programming language
  date: { type: Date, defalult: Date.now() }, // date of created document or last save
  description: { type: String, validate: descriptionValidator }, // user define caratteristics of document
  body: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File'}],

  isCollaborative: { type: Boolean, default: false }, // if true collaborativeUser list exist, default false -->personal project
  collab_requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CollaborativeRequest' }],

  shared: { type: Boolean, default: false }, // if true meta used, default false -->private project

  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],

  meta: 
})

projectSchema.methods.getMe = async function () {
  return await User.findOne({
    email: req.auth['https://evercode.com/email']
  })
}

projectSchema.methods.saveProject = async function (req) {
  this.body.forEach(file => file.saveFile())
}

projectSchema.methods.addToMe = async function () {
  const user = this.getMe()
  const profile = await Profile.findOne({user: user._id})
  profile.projects.push(this._id)
  await profile.save()
}

projectSchema.methods.checkOwners = async function (_id) {
  let owners = this.owners
  owners.forEach(owner => { if (owner.toString() === _id.toString()) return true})
  return false
}

projectSchema.methods.checkOwner = async function (_id) {
  let owner = this.owners[0]
  if (owner.toString() === _id.toString()) return true
  return false
}

projectSchema.methods

function descriptionValidator (val) {
  // validator check if description is too big
  return val.length < 250
}


projectSchema.pre('remove', async function(next) {
  await Profile.updateOne({user: this.owner},{
    $pull: {projects: this._id}
  });
  next();
})

projectSchema.methods

const Project = mongoose.model('Project', projectSchema)

module.exports = Project
