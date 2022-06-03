const mongoose = require('mongoose');
const { Profile, User } = require('../user/model');
const File = require('./modelFile');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true }, // to exist a project must have a title
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // to exist must have a project owner
  language: {
    type: String,
    required: true,
    enum: ['cpp', 'javascript', 'python']
  }, // to exist a project need a programming language
  date: { type: Date, defalult: Date.now() }, // date of created document or last save
  description: { type: String, validate: descriptionValidator }, // user define caratteristics of document
  body: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File'}],
  isCollaborative: { type: Boolean, default: false }, // if true collaborativeUser list exist, default false -->personal project

  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  shared: { type: Boolean, default: false }, // if true meta used, default false -->private project

  comments: [
    {
      commentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // to exist must have a project owner
      comment: { type: String, validate: commentValidator },
      date: { type: Date, default: Date.now() }
    }
  ],

  meta: {
    upVote: { type: Number, default: 0 }, // number of upVote >0 only if shared true
    downVote: { type: Number, default: 0 }, // number of downVote >0 only if shared true
    copied: { type: Number, default: 0 }, // number of time the document is copied
    getLink: { type: Number, default: 0 }, // number of time get the link
    visual: { type: Number, default: 0 } // number of time the project was opened by other user != owner
  }
})

function descriptionValidator (val) {
  // validator check if description is too big
  return val.length < 250
}

function commentValidator (val) {
  return val < 150
}

projectSchema.pre('remove', async function(next) {
  await Profile.updateOne({user: this.owner},{
    $pull: {projects: this._id}
  });
  next();
})

const Project = mongoose.model('Project', projectSchema)

// module.exports = Project
