const mongoose = require('mongoose')

const reactionSchema = new mongoose.Schema({
    reacter: {  type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reaction: { type: String, enum: [ 'UpVote', 'DownVote' ], required: true },
})

const Reaction = mongoose.model('Reaction', reactionSchema)

module.exports = Reaction