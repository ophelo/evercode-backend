const express = require('express')
const Project = require('../project/model')
const Comment = require('./model')
const { User } = require('../user/model')
const { getUser } = require('../middleware/auth')
const commentRoutes = express.Router()



commentRoutes.post('/:_id/addComment', getUser, async (req, res) => {
  await  Comment.create({ commentor: req.user._id, commentText: req.body.commentText })
    .then( async cm =>{
     await cm.newComment(req.params._id);
     return res.json(cm)
    })
    .catch(err => {return res.status(400).json({ message: err.message })})
})


commentRoutes.post('/:_idComment/replyComment', getUser, async (req, res) => {
 await Comment.create({ commentor: req.user._id, commentText: req.body.commentText })
    .then( async cm =>{
     await cm.replyComment(req.params._idComment)
      return res.json(cm)
    }).catch(err => {return res.status(400).json({ message: err.message })})
})



commentRoutes.patch('/modify/:_idComment', getUser, async (req, res) =>{

  const user = await User.findOne({
    email: req.auth['https://evercode.com/email']
  })

if (user._id.toString() !== req.body.commentor) { return res.status(403).json({ message: 'Forbidden' }) }
else{
  try{
    await Comment.updateOne({ _id: req.params._idComment }, {commentText: req.body.commentText })
    return res.status(201).json({ message: 'Updated'});
  }catch(err) {return res.status(400).json({ message: err.message })}
}
})


commentRoutes.delete('/:_id/delete/:_idComment', getUser, getComment, async (req, res) => {
if (req.user._id.toString() === req.comment.commentor.toString() || req.body.owner.toString() === req.user._id.toString()) { 
    try{
      await Project.updateOne({ _id: req.params._id }, { $pull: { comments: req.params._idComment }})
      const comment = await Comment.findById(req.params._idComment);
      comment.delete(comment._id)
      return res.json({ message: 'Deleted comment' })
    }catch(err){
      return res.status(500).json({ message: err.message })
    }
}else { return res.status(403).json({ message: 'Forbidden' }) }
})

commentRoutes.get('/:_id/allComment', getUser, async (req, res) => {
  try{
    const project = await Project.findById(req.params._id)
    const comments = await Comment.find({ _id: { $in: project.comments}})
    if(comments == null){ return res.status(404).json({"error": "there no comments"})}
    else{ return res.status(200).json(comments) }}catch(err){return res.status(400).json({ message: err.message })}
})

commentRoutes.get('/:_idComment/getReplys', getComment, async (req, res) => {
  try{
    const comment = await Comment.findById( req.params._idComment,'-_id reference')
    .populate({
      path: 'reference',
      select: '-__v'
  })
    if(comment == null){ return res.status(404).json({"error": "there no comments"})}
    else{ return res.status(200).json(comment.reference) }
  }catch(err){ return res.status(400).json({ message: err.message })}
})

async function getComment(req,res,next){
  let comment
  try{
    comment = await Comment.findById(req.params._idComment)
    if(comment != null ){req.comment = comment} else{ return res.status(404).json({ message: 'Cannot find comment ' }) }
  }catch(err){ return res.status(400).json({ message: err.message }) }
  next()
}

module.exports = commentRoutes