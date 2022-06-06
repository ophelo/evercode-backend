const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  commentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // to exist must have a project owner
  comment: { type: String, validate: commentValidator },
  date: { type: Date, default: Date.now() }
})

commentSchema.pre('remove', async function(next){
  await this.pullComment()
  next();
})

commentSchema.methods.editComment = async function (text) {
  this.comment = text
  return await this.save()
}

commentSchema.methods.pushComment = async function (projId) {
  this.project = projId
  await this.save()
  await project.updateOne({_id: projId},{
    $push: {comments: this._id}
  });
}

commentSchema.methods.pullComment = async function () {
  await project.updateOne({_id: this.project},{
    $pull: {comments: this._id}
  });
}

function commentValidator (val) { return val < 150 }

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
