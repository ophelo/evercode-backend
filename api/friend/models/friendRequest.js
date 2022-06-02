const mongoose = require('mongoose')
const _ = require('underscore')
const {Profile} = require('../../user/model')

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

friendRequestSchema.pre('save', async function() {
  const profile = await Profile.findOne({friends: this.sender })
  if (profile || this.receiver.toString() === this.sender.toString())
    throw new Error('forbidden operation!');
})

friendRequestSchema.methods.linkUsers = async function(){
  await Profile.updateOne({user: this.sender},{ $addToSet: { friend_requests: this._id }})
    .then(templates => console.log(templates))
  .catch(err => console.log(err));
  await Profile.updateOne({user: this.receiver},{ $addToSet: { friend_requests: this._id }})
    .then(templates => console.log(templates))
  .catch(err => console.log(err));
}

friendRequestSchema.methods.accept = async function(){
  await Profile.updateOne({user: this.sender},{ $addToSet: { friends: this.receiver }, $pull: { friend_requests: this._id }})
    .then(templates => console.log(templates))
  .catch(err => console.log(err));
  await Profile.updateOne({user: this.receiver},{ $addToSet: { friends: this.sender }, $pull: { friend_requests: this._id }})
    .then(templates => console.log(templates))
  .catch(err => console.log(err));
}

friendRequestSchema.methods.refuse = async function(){
  await Profile.updateOne({user: this.sender},{ $pull: { friend_requests: this._id }})
    .then(templates => console.log(templates))
  .catch(err => console.log(err));
  await Profile.updateOne({user: this.receiver},{ $pull: { friend_requests: this._id }})
    .then(templates => console.log(templates))
  .catch(err => console.log(err));
}

const friendRequest = mongoose.model('FriendRequest', friendRequestSchema)

friendRequest.collection.createIndex({'sender': 1, 'receiver': 1 }, {unique: true})

async () => {
  await friendRequest.syncIndexes();
  await friendRequest.ensureIndexes({dropDup: true});
}


module.exports = {
  FriendRequest: friendRequest
}
