const mongoose = require('mongoose');
const Project  = require('../project/model');

const reactionSchema = new mongoose.Schema({
    reacter: {  type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reactionVal: { type: String, enum: [ 'UpVote', 'DownVote' ], required: true },
    projectReacted: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }
})

const Reaction = mongoose.model('Reaction', reactionSchema)

module.exports = Reaction