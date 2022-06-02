const mongoose = require('mongoose');
const Project = require('../project/model');

const commentSchema = new mongoose.Schema({
   commentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   commentText: { type: String, validate: commentValidator, required: true },
   date: { type: Date, default: Date.now() },
   reference: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
})

function commentValidator (val) {
  return val < 150
}

commentSchema.pre('remove', async function(next){
  const comments = await Comment.findMany({ _id: { $in: this.reference } });
  await Comment.removeMany( comments );
  next();
})

commentSchema.methods.newComment = async function(idProject){
  await Project.updateOne({_id: idProject },{ $push: { comments: this._id}})
}

commentSchema.methods.replyComment = async function(idComment){
  await Comment.updateOne({_id: idComment },{ $push: { reference: this._id}})
}

commentSchema.pre('find', async function(next){
  const comments = await Comment.findMany({ _id: { $in: this.reference } });
  req.comments = comments
  next();
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment