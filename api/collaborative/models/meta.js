const mongoose = require('mongoose');

const opts = { toJSON: { virtuals: true } }
const metaSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', },
    upVote: { type: Number, default: 0 }, // number of upVote >0 only if shared true
    downVote: { type: Number, default: 0 }, // number of downVote >0 only if shared true
    copied: { type: Number, default: 0 }, // number of time the document is copied
    getLink: { type: Number, default: 0 }, // number of time get the link
    views: { type: Number, default: 0 } // number of time the project was opened by other user != owner
}, opts);

metaSchema.virtual('Votes').get(function(){ return this.upVote - this.downVote})

metaSchema.methods.visualize = async function() {
    this.views += 1
    await this.save()
}

metaSchema.methods.updateMeta = async function(val){
switch(val){
    case 'UpVote': 
        this.upVote = this.upVote + 1;
        await this.save();
        break;
    case 'DownVote': 
        this.downVote = this.downVote + 1;
        await this.save();
        break;
    default:
      return res.status(400).json({"error": "bad request!"}) 
}
}

metaSchema.methods.modifyMeta = async function(preVal, val){
switch(preVal){
    case 'UpVote': 
        this.upVote = this.upVote - 1;
        await this.save();
        break;
    case 'DownVote': 
        this.downVote = this.downVote - 1;
        await this.save();
        break;
    default:
      return res.status(400).json({"error": "bad request!"}) 
}
switch(val){
    case 'UpVote': 
        this.upVote = this.upVote + 1;
        await this.save();
        break;
    case 'DownVote': 
        this.downVote = this.downVote + 1;
        await this.save();
        break;
    default:
      return res.status(400).json({"error": "bad request!"}) 
}
}

metaSchema.methods.updateOnDelete = async function(val){
switch(val){
    case 'UpVote': 
        this.upVote = this.upVote - 1;
        await this.save();
        break;
    case 'DownVote': 
        this.downVote = this.downVote - 1;
        await this.save();
        break;
    default:
      return res.status(400).json({"error": "bad request!"}) 
}
}

const Meta = mongoose.model('Meta', metaSchema)

module.exports = Meta
