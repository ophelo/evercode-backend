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

if (user._id.toString() === req.body.owner.toString()) { return res.status(403).json({ message: 'Forbidden' }) }
   else{
    const comment = new Comment({
     commentor: user._id,
     commnetText: req.body.commentText,
     commented: req.params._id,
     reference: req.body.comment_id
    })

     try {
       const newComment = await comment.save()
           return res.status(201).json(newComment);
     } catch (err) {return res.status(400).json({ message: err.message })}
    }
})

commentRoutes.patch(':_id/:commntId', async (req, res) =>{

  const user = await User.findOne({
    email: req.auth['https://evercode.com/email']
  })

if (user._id.toString() !== req.body.commentor.toString()) { return res.status(403).json({ message: 'Forbidden' }) }
else{
  comment = await Comment.findById(req.params.commntId)
  if(comment != null){
    comment.commentText = req.body.commentText
  
  try{
    await comment.save()
    return res.status(201).json(res.comment);
  }catch(err){
    return res.status(500).json({ message: err.message })
  }
}else{ return res.status(404).json({ message: 'Cannot find comment ' }) }
}
})


commentRoutes.delete(':_id/:commntId', async (req, res) => {

  const user = await User.findOne({
    email: req.auth['https://evercode.com/email']
  })

if (user._id.toString() === req.body.commentor.toString() || req.body.owner.toString() === user._id.toString()) { 
  const comment = await Comment.findById(req.params.commntId)
  if( comment != null ){
    try{
      await comment.remove();
      return res.json({ message: 'Deleted commet' })
    }catch(err){
      return res.status(500).json({ message: err.message })
    }
  }else{ return res.status(404).json({ message: 'Cannot find comment ' }) }

}else { return res.status(403).json({ message: 'Forbidden' }) }
})

module.exports = projectRoutes