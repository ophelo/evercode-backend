const express = require('express')
const Project = require('../project/model')
const { getUser } = require('../middleware/auth')
const Reaction = require('./model')
const Meta = require('../project/meta')
const reactionRoutes = express.Router()

//new reaction
reactionRoutes.post('/:_id/addReaction', getUser, async (req, res) =>{
  try{
  const project = Project.findById(req.params._id);
  if(req.user._id.toString() === project._id.toString() ){res.status(403).json({ message: 'Forbidden' })}
  else{
    const reaction = await Reaction.findOne({ reacter: req.user._id, projectReacted: req.params._id })
    if(reaction != null ){
          const meta = await Meta.findOne({project : req.params._id})
          if(!meta) throw new Error('meta not found');
          else  await meta.modifyMeta(reaction.reactionVal, req.body.reactionVal);
          reaction.reactionVal = req.body.reactionVal;
          reaction.save();
          return res.json(reaction);
    }
        else{
          const newReaction = await Reaction.create({ reacter: user._id, projectReacted: req.params._id, reactionVal: req.body.reactionVal })
          const meta = await Meta.findOne({project : req.params._id})
          if(!meta) throw new Error('meta not found');
          else  await meta.updateMeta(req.body.reactionVal);
          return res.json(newReaction);
    }
  }
  }catch(err){return res.status(500).json({ message: err.message })}
})

reactionRoutes.delete('/:_id/delete/:idReaction', getUser,async (req, res) =>{
try{
if (req.user._id.toString() === req.body.reacter.toString()){ 
  const reaction = await Reaction.findById(req.params.idReaction)
  const meta = await Meta.findOne({project : req.params._id})
  if(!meta) throw new Error('meta not found');
  else await meta.updateOnDelete(reaction.reactionVal);
  reaction.delete();
  
  return res.json({ message: 'Deleted reaction' })
  }else{ return res.status(403).json({ message: 'Forbidden' })}
  }catch(err){
   return res.status(500).json({ message: err.message })
  }
})

module.exports = reactionRoutes