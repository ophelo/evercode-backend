const mongoose = require('mongoose')
const _ = require('underscore')

const Schema = mongoose.Schema

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true }
})

const friendRequestSchema = new mongoose.Schema({
  type: { type: String, default: 'SEND', enum: ['SEND', 'RECEIVED'] },
  sender: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  send_at: {
    type: Date,
    default: function now () {
      return new Date()
    }
  }
})

const profileSchema = new mongoose.Schema({
  user: { type: String, required: true, ref: 'User' },
  bio: { type: String },
  fav_lng: {
    type: String,
    enum: ['c++', 'c', 'html', 'javascript', 'typescript', 'python'],
    default: 'javascript'
  },
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User', unique: true }],
  friend_requests: [
    { type: Schema.Types.ObjectId, ref: 'FriendRequest', unique: true }
  ]
})

const user = mongoose.model('User', userSchema)
const friendRequest = mongoose.model('FriendRequest', friendRequestSchema)
profileSchema.pre('save', function (next) {
  this.friends = _.uniq(this.friends)
  next()
})
const profile = mongoose.model('Profile', profileSchema)

module.exports = {
  User: user,
  Profile: profile,
  FriendRequest: friendRequest
}
