const mongoose = require('mongoose');
const Project  = require('../project/model');

const reactionSchema = new mongoose.Schema({
    reacter: {  type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reactionVal: { type: String, enum: [ 'UpVote', 'DownVote' ], required: true },
    projectReacted: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }
})
/*
reactionSchema.methods.updateProject = async function(_idProject){
switch(this.reactionVal){
    case 'UpVote': 
        await Project.updateOne({ _id: _idProject }, { $inc:{ meta: {upVote: "+1" }}});
        break;
    case 'DownVote': 
        await Project.updateOne({ _id: _idProject }, { $inc:{ meta: { downVote: "+1" }}});
        break;
    default:
      return res.status(400).json({"error": "bad request!"}) 
}
}

reactionSchema.methods.updateOnDeleteProject = async function(_idProject){
switch(this.reactionVal){
    case 'UpVote': 
        await Project.updateOne({ _id: _idProject }, { $inc: { meta: { upVote: "-1" }}});
        break;
    case 'DownVote': 
        await Project.updateOne({ _id: _idProject }, { $inc: { meta: { downVote: "-1" }}});
        break;
    default:
      return res.status(400).json({"error": "bad request!"}) 
}
}
*/

const Reaction = mongoose.model('Reaction', reactionSchema)

module.exports = Reaction