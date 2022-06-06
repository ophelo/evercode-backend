const mongoose = require('mongoose');
// const { functions } = require('underscore');
const {Profile, User} = require('../../user/model');
const Comment = require('./comment');
const Meta = require('./meta');
const File = require('./file');
const { methods } = require('underscore');
const { link } = require('fs');

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
  meta: { type: mongoose.Schema.Types.ObjectId, ref: 'Meta'},
  link: { type: String, required: true, unique: true }
})

projectSchema.methods.getMe = async function () {
  return await User.findOne({
    email: req.auth['https://evercode.com/email']
  })
}

projectSchema.methods.upDate = async function () {
  this.date = Date.now()
  await this.save()
}

projectSchema.methods.saveProject = async function (req) {
  req.body.forEach(newfile => {
    let isSaved = false
    this.body.forEach(file => { if(newfile._id == file._id) file.saveFile(newfile); isSaved = true })
    if (!isSaved) newfile.pushFile(this._id)
  })
}

projectSchema.methods.addToUser = async function (_id) {
  const profile = await Profile.updateOne({owner: _id},{ $addToSet: { projects: this._id } })
  await profile.save()
}

projectSchema.methods.setCollaborative = async function (val) {
  if (val.toString() == 'true') this.isCollaborative = true
  this.isCollaborative = false
  return await this.save()
}

projectSchema.methods.getCollaborative = async function () {
  return this.isCollaborative
}

projectSchema.methods.setShared = async function (val) {
  if (val.toString() == 'true') this.shared = true
  this.shared = false
  return await this.save()
}

projectSchema.methods.getShared = async function () {
  return this.shared
}

projectSchema.methods.setLink = async function (link) {
  this.link = link
  return await this.save()
}

projectSchema.methods.getLink = async function () {
  return this.link
}

 // ---- ON OWNERS ---- //

projectSchema.methods.checkOwners = async function (_id) {
  let owners = this.owners
  owners.forEach(owner => {if (owner.toString() === _id.toString()) return true})
  return false
}

projectSchema.methods.checkOwner = async function (_id) {
  let owner = this.owners[0]
  if (owner.toString() === _id.toString()) return true
  return false
}

projectSchema.methods.addOwner = async function (_id) {
  let check = this.checkOwners(_id)
  if (check) return false
  await Profile.updateOne({owner: _id},{ $addToSet: { projects: this._id } })
  this.owners.push(_id)
  return await this.save()
}

 // ---- ON FILES ---- //

projectSchema.methods.getFile = async function (fileId) {
  let id = this.body.find(file => file._id.toString() === fileId.toString());
  if (id == null) return id
  return await File.findById(id)
}

 // ---- ON COMMENTS ---- //

projectSchema.methods.getComment = async function (commId) {
  let id = this.comments.find(comm => comm._id.toString() === commId.toString());
  if (id == null) return id
  return await Comment.findById(id)
}

 // ---- ON META ---- //

projectSchema.methods.getMeta = async function () {
  let id = this.meta
  if (id == null) {
    let meta = new Meta()
    this.meta = meta._id
  }
  return await Meta.findById(id)
}
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
