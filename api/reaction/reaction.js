const mongoose = require('mongoose')
const { Project } = require('../project/model');

const reactionSchema = new mongoose.Schema({
    reacter: {  type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reaction: { type: String, enum: [ 'UpVote', 'DownVote' ], required: true },
    projectReacted: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }
})

reactionSchema.pre('save', async function(next){
/*await Project.updateOne({_id: this.projectReacted},{
    if(this.reaction === ){

    }else if( )
});
next();*/
})
const Reaction = mongoose.model('Reaction', reactionSchema)

module.exports = Reaction