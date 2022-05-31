const express = require('express')
const Project = require('./model')
const escapeStringRegexp = import('escape-string-regexp')
const { User, Profile } = require('../user/model')
const { param } = require('../project/routes')
const commentRoutes = express.Router()

commentRoutes.post('/:_id/add', async (req, res) => {
  const user = await User.findOne({
    email: req.auth['https://evercode.com/email']
  })

if (user._id.toString() === req.body.owner.toString()) { return res.status(403).json({ message: 'Forbidden' }) }
   else{
    const comment = new Comment({
     commentor: user._id,
     commnet: req.body.comment,
     commented: req.params._id,
     reference: req.body.comment_id
    })

     try {
       const newComment = await comment.save()
           return res.status(201).json(newComment);
     } catch (err) {return res.status(400).json({ message: err.message })}
    }
})


module.exports = projectRoutes