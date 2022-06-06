const mongoose = require('mongoose');
const Project = require('../project/model');

const commentSchema = new mongoose.Schema({
   commentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   commentText: { type: String, validate: commentValidator, required: true },
   date: { type: Date, default: Date.now() },
   reference: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
})

function commentValidator (val) {
  return val.length < 250
}

commentSchema.pre('remove', async function(){
  await Comment.findOneAndRemove({ _id: { $in: this.reference } });
})
commentSchema.methods.newComment = async function(idProject){
 await Project.updateOne({_id: idProject },{ $push: { comments: this._id}})
}

commentSchema.methods.replyComment = async function(idComment){
 await Comment.findByIdAndUpdate({_id: idComment },{ $push: { reference: this._id}})
}
/*
commentSchema.pre('find', async function(next){
  console.log("trigger")
  if(this.reference != null ){
  const comments = await Comment.find({ _id: { $in: this.reference } });
  res.comments += comments
  console.log("ci passo")
  }
  next();
})
commentSchema.methods.findReplyes = async function(_id){
  const comments = await Comment.find({ _id: { $in: this.reference } });
  res.comments += comments
  console.log("ci passo")
}
*/
const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment