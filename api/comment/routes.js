const express = require('express')
const Project = require('./model')
const escapeStringRegexp = import('escape-string-regexp')
const { User, Profile } = require('../user/model')
const { param } = require('../project/routes')
const { find } = require('underscore')
const commentRoutes = express.Router()



commentRoutes.post('/:_id/addComment', async (req, res) => {
  const user = await User.findOne({
    email: req.auth['https://evercode.com/email']
  })

  Comment.create({ commentor: user._id, commnetText: req.body.commentText })
    .then( async cm =>{
      await cm.newComment(req.params._id);
      return res.json(cm)
    }).catch(err => {return res.status(400).json({ message: err.message })})
})


commentRoutes.post('/:_idComment/replyComment', async (req, res) => {
  const user = await User.findOne({
    email: req.auth['https://evercode.com/email']
  })

  Comment.create({ commentor: user._id, commentText: req.body.commentText })
    .then( async cm =>{
      await cm.replyComment(req.params._idComment);
      return res.json(cm)
    }).catch(err => {return res.status(400).json({ message: err.message })})
})



commentRoutes.patch(':_id/:commntId/modify', async (req, res) =>{

  const user = await User.findOne({
    email: req.auth['https://evercode.com/email']
  })

if (user._id.toString() !== req.body.commentor.toString()) { return res.status(403).json({ message: 'Forbidden' }) }
else{
  try{
    await Comment.UpdateOne({ _id: req.params.commntId }, {commentText: req.body.commentText })
    return res.status(201).json({ message: 'Updated'});
  }catch(err) {return res.status(400).json({ message: err.message })}
}
})


commentRoutes.delete(':_id/:commnetId', getComment, async (req, res) => {

  const user = await User.findOne({
    email: req.auth['https://evercode.com/email']
  })

if (user._id.toString() === req.comment.commentor.toString() || req.body.owner.toString() === user._id.toString()) { 
    try{
      Project.UpdateOne({ _id: req.params._id }, { $pull: { comments: req.params._idComment }})
      await req.comment.remove();
      return res.json({ message: 'Deleted comment' })
    }catch(err){
      return res.status(500).json({ message: err.message })
    }

}else { return res.status(403).json({ message: 'Forbidden' }) }
})

commentRoutes.get(':_id/allComment', async (req, res) => {
  try{
    const project = await Project.findById(req.params._id)
    const comments = await Comment.findMany({ _id: { $in: project.comments}})
    if(comments == null){ return res.status(404).json({"error": "there no comments"})}
    else{ return res.status(200).json(comments) }
  }catch(err){return res.status(400).json({ message: err.message })}
})


async function getComment(req,next){
  let comment
  try{
    comment = await Comment.findById(req.params._idComment)
    if(comment != null ){req.comment = comment} else{ return res.status(404).json({ message: 'Cannot find comment ' }) }
  }catch(err){ return res.status(400).json({ message: err.message }) }
  next();
}

module.exports = commentRoutes