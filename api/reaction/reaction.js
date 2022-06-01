const mongoose = require('mongoose')

const reactionSchema = new mongoose.Schema({
    reacter: {  type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reaction: { type: String, enum: [ 'UpVote', 'DownVote' ], required: true },
    projectReacted: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }
})

reactionSchema.pre('save', async function(next){
//find project increment meta

next();
})
const Reaction = mongoose.model('Reaction', reactionSchema)

module.exports = Reaction