const mongoose = require('mongoose')
const _ = require('underscore')

const Schema = mongoose.Schema

const TIMEOUT_STATUS = 30

const opts = { toJSON: { virtuals: true } }

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  last_activity: { type: Date, default: new Date() }
}, opts)

const profileSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  bio: { type: String },
  fav_lng: {
    type: String,
    enum: ['c++', 'c', 'html', 'javascript', 'typescript', 'python'],
    default: 'javascript',
    required: true
  },
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friend_requests: [{ type: Schema.Types.ObjectId, ref: 'FriendRequest' }],
  collaborative_requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CollaborativeRequest', unique: true }],
})

userSchema.virtual('status').get(function() {
  var checkTime = new Date();
  checkTime.setSeconds(checkTime.getSeconds() - TIMEOUT_STATUS)

  return this.last_activity >= checkTime ? "online" : "offline";
});

profileSchema.methods.checkProjects = async function (val){
  this.projects.forEach(project => { if (project.toString() === val.toString()) return true})
  return false
}

profileSchema.pre('save', function (next) {
  this.friends = _.uniq(this.friends)
  next()
})

const user = mongoose.model('User', userSchema)
const profile = mongoose.model('Profile', profileSchema)

async () => {
  profile.syncIndexes()
  profile.ensureIndexes()
}

module.exports = {
  User: user,
  Profile: profile,
}
