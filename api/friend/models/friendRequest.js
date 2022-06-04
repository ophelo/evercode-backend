const mongoose = require('mongoose')
const _ = require('underscore')
const { Profile } = require('../../user/model')

const Schema = mongoose.Schema

const friendRequestSchema = new mongoose.Schema({
  sender: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  receiver: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  send_at: {
    type: Date,
    default: function now () {
      return new Date()
    }
  }
})

friendRequestSchema.pre('save', async function (context) {
  if (this.receiver.toString() === this.sender.toString()) throw new Error('forbidden operation!')
  const check1 = await Profile.findOne({ user: this.receiver, friends: this.sender })
  if (check1) throw new Error('already friend with this user')
  const check2 = await this.constructor.findOne({ sender: this.receiver, receiver: this.sender })
  const check3 = await this.constructor.findOne({ sender: this.sender, receiver: this.receiver })
  if (check2 || check3) throw new Error('a friend request of this type already exists')
})

friendRequestSchema.methods.linkUsers = async function () {
  await Profile.updateOne({ user: this.sender }, { $addToSet: { friend_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
  await Profile.updateOne({ user: this.receiver }, { $addToSet: { friend_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
}

friendRequestSchema.methods.unlinkUsers = async function () {
  await Profile.updateOne({ user: this.sender }, { $pull: { friend_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
  await Profile.updateOne({ user: this.receiver }, { $pull: { friend_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
}

friendRequestSchema.methods.accept = async function () {
  await Profile.updateOne({ user: this.sender }, { $addToSet: { friends: this.receiver }, $pull: { friend_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
  await Profile.updateOne({ user: this.receiver }, { $addToSet: { friends: this.sender }, $pull: { friend_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
}

friendRequestSchema.methods.refuse = async function () {
  await Profile.updateOne({ user: this.sender }, { $pull: { friend_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
  await Profile.updateOne({ user: this.receiver }, { $pull: { friend_requests: this._id } })
    .then(() => {})
    .catch(err => console.log(err))
}

const friendRequest = mongoose.model('FriendRequest', friendRequestSchema)

module.exports = {
  FriendRequest: friendRequest
}
