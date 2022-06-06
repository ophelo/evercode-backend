const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  isUsed: { type: Boolean, default: false },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
  code: { type: String, default: 'N{b7j(utCI9' }
})

fileSchema.pre('remove', async function(next){
  await this.pullFile()
  next();
})

fileSchema.methods.saveFile = async function (file) {
  if (this.isUsed) return null
  this.isUsed = true
  if (file.fileName) this.fileName = file.fileName
  if (file.code) this.code = file.code
  return await this.save()
}

fileschema.methods.pushFile = async function (projId) {
  this.project = projId
  await this.save()
  await project.updateOne({_id: projId},{
    $push: {body: this._id}
  });
}

fileschema.methods.pullFile = async function () {
  await project.updateOne({_id: this.project},{
    $pull: {body: this._id}
  });
}

const File = mongoose.model('File', fileSchema)


module.exports = File
