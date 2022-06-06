const mongoose = require('mongoose')
const _ = require('underscore')
const { Profile } = require('../../user/model')
const { Project } = require('../../collaborative/models/project')

const Schema = mongoose.Schema


const collRequestSchema = new mongoose.Schema({
  sender: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  receiver: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  project: { type: Schema.Types.ObjectId, required: true, ref: 'Project' },
  send_at: {
    type: Date,
    default: function now () {
      return new Date()
    }
  }
})

collRequestSchema.pre('save', async function (context) {
  let isOwner = false
  const owners = this.project.owners
  owners.forEach(async (id) => {if (id.toString() === this.receiver.toString()) isOwner == true })
  if (isOwner) throw new Error('forbidden operation!')
  if (this.receiver.toString() === this.sender.toString()) throw new Error('forbidden operation!')
  const check1 = await Profile.findOne({ user: this.receiver, projects: this.project })
  if (check1) throw new Error('already collaborator of this project')
  const check2 = await this.constructor.findOne({ receiver: this.receiver, project: this.project })
  if (check2) throw new Error('a collaborative request of this type already exists')
})

collRequestSchema.methods.linkProject = async function () {
  await Project.updateOne({ _id: this.project }, { $addToSet: { collab_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
  await Profile.updateOne({ user: this.receiver }, { $addToSet: { collaborative_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
}

collRequestSchema.methods.unlinkProject = async function () {
  await Project.updateOne({ _id: this.project }, { $pull: { collab_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
  await Profile.updateOne({ user: this.receiver }, { $pull: { collaborative_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
}

collRequestSchema.methods.accept = async function () {
  await Project.updateOne({ _id: this.project }, { $addToSet: { users: this.receiver }, $pull: { collab_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
  await Profile.updateOne({ user: this.receiver }, { $addToSet: { projects: this.project }, $pull: { collaborative_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
}


collRequestSchema.methods.refuse = async function () {
  await Project.updateOne({ _id: this.project }, { $pull: { collab_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
  await Profile.updateOne({ user: this.receiver }, { $pull: { collaborative_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
}

const collRequest = mongoose.model('CollaborativeRequest', collRequestSchema)

collRequest.collection.createIndex({ sender: 1, receiver: 1, project: 1 }, { unique: true })

async () => {
  await collRequest.syncIndexes()
  await collRequest.ensureIndexes({ dropDup: true })
}

module.exports = {
  CollaborativeRequest: collRequest
}
