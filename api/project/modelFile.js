const mongoose = require('mongoose');
const Project = require('./model');

const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
  code: { type: String, default: 'N{b7j(utCI9' }
})

fileSchema.pre('remove', async function(next){
  await Project.updateOne({_id: this.project},{
    $pull: {body: this._id}
  });
  next();
})
const File = mongoose.model('File', fileSchema)
module.exports = File
