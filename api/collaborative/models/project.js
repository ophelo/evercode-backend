const mongoose = require('mongoose');
const { Profile } = require('../../user/model');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true }, // to exist a project must have a title
  owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // to exist must have a project owner
  language: {
    type: String,
    required: true,
    enum: ['cpp', 'javascript', 'python']
  }, // to exist a project need a programming language
  creationDate: { type: Date, defalult: Date.now() }, // date of created document or last save
  lastSave: { type: Date }, // date of created document or last save
  description: { type: String, validate: descriptionValidator }, // user define caratteristics of document
  body: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File'}],

  isCollaborative: { type: Boolean, default: false }, // if true collaborativeUser list exist, default false -->personal project
  collab_requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CollaborativeRequest' }],

  shared: { type: Boolean, default: false }, // if true meta used, default false -->private project
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  meta: { type: mongoose.Schema.Types.ObjectId, ref: 'Meta'},
})

projectSchema.methods.upDate = async function () {
  this.lastSave = Date.now()
  await this.save()
}

projectSchema.methods.saveBody = async function (req) {
  req.body.forEach(newfile => {
    let isSaved = false
  this.body.forEach(file => { if(newfile._id == file._id) {
      file.saveFile(newfile)
      isSaved = true 
    }})
    if (!isSaved) newfile.pushFile(this._id)
  })
}

projectSchema.methods.addToUser = async function (_id) {
  await Profile.updateOne({owner: _id},{ $addToSet: { projects: this._id } })
  await this.owners.push(_id)
  await this.save()
}

projectSchema.methods.setCollaborative = async function (val) {
  if (val.toString() == 'true') this.isCollaborative = true
  else this.isCollaborative = false
  return await this.save()
}

projectSchema.methods.setShared = async function (val) {
  if (val.toString() == 'true') this.shared = true
    this.shared = false 
  return await this.save()
}
 // ---- ON OWNERS ---- //

projectSchema.methods.checkOwners = async function (_id) {
  if (_id == 'undefined') return false
  return this.owners.findIndex((user) => {return user._id.toString() === _id.toString()}) !== -1
}

projectSchema.methods.checkOwner = async function (_id) {
  let owner = this.owners[0]
  if (owner.toString() === _id.toString()) return true
  return false
}

function descriptionValidator (val) {
  // validator check if description is too big
  return val.length < 250
}

projectSchema.pre('remove', async function(next) {
  await Profile.updateMany({user: { $in: this.owners }},{
    $pull: {projects: this._id}
  });
  next();
})

const Project = mongoose.model('Project', projectSchema)

module.exports = Project
