const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
   commentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   commentText: { type: String, validate: commentValidator, required: true },
   commented: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
   date: { type: Date, default: Date.now() },
   reference: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
})

function commentValidator (val) {
  return val < 150
}

commentSchema.pre('remove', async function(next){
  comments = await Comment.find({ reference: this._id });
  await Comment.deleteMany( comments );
  next();
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment