const express = require('express')
const Project = require('../project/model')
const escapeStringRegexp = import('escape-string-regexp')
const { User, Profile } = require('../user/model')
const { param } = require('../project/routes')
const { find } = require('underscore')
const Reaction = require('./model')
const reactionRoutes = express.Router()

//new reaction
reactionRoutes.post(':_id/addReaction', async (req, res) =>{
  const user = await User.findOne({
    email: req.auth['https://evercode.com/email']
  })
  try{
const reaction = await Reaction.find({ reacter: user._id, projectReacted: req.params._id })
if(reaction != null ){ return res.status(400).json({reaction}) }
    else{ 
      Reaction.create({ reacter: user._id, projectReacted: req.params._id })
      .then( async react => {
          react.updateProject(req.params._id)
      } )
    }
  }catch(err){return res.status(500).json({ message: err.message })}
})

reactionRoutes.delete(':_id/delete/:idReaction', async (req, res) =>{
  const user = await User.findOne({
    email: req.auth['https://evercode.com/email']
  })
if (user._id.toString() === req.body.reacter.toString()){ 
 try{
  await Reaction.delete({ _id: req.params.idReaction })
  .then(async react => {
    react.updateOnDelateProject(req.params._id)
  })
  return res.json({ message: 'Deleted reaction' })
  }catch(err){
   return res.status(500).json({ message: err.message })
  }}else{ return res.status(403).json({ message: 'Forbidden' })}
})


module.exports = reactionRoutes