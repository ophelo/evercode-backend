const mongoose = require('mongoose');
const Project = require('./project');

const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  isUsed: { type: Number, default: 0 },
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

fileSchema.methods.pushFile = async function (projId) {
  this.project = projId
  await this.save()
  await Project.updateOne({_id: projId},{
    $push: {body: this._id}
  });
}

fileSchema.methods.pullFile = async function () {
  await Project.updateOne({_id: this.project},{
    $pull: {body: this._id}
  });
}

fileSchema.methods.lock = async function (val) {
  if(this.isUsed == 0) this.isUsed = val
}

fileSchema.methods.unlock = async function (val) {
  if(this.isUsed == val) this.isUsed = 0
}

const File = mongoose.model('File', fileSchema)


module.exports = File
