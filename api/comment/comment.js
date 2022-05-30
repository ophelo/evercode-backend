const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
   commentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   comment: { type: String, validate: commentValidator, required: true },
   commented: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
   date: { type: Date, default: Date.now() },
   reference: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
})

function commentValidator (val) {
  return val < 150
}

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment