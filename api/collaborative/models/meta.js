const mongoose = require('mongoose');

const metaSchema = new mongoose.Schema({
  upVote: { type: Number, default: 0 }, // number of upVote >0 only if shared true
  downVote: { type: Number, default: 0 }, // number of downVote >0 only if shared true
  copied: { type: Number, default: 0 }, // number of time the document is copied
  getLink: { type: Number, default: 0 }, // number of time get the link
  views: { type: Number, default: 0 } // number of time the project was opened by other user != owner
})

fileSchema.methods.editViews = async function (type) {
  switch (type) {
    case 'up':
      
      break;
    case 'down':
      
      break;
    default:
      break;
  }
  if (this.isUsed) return null
  this.isUsed = true
  if (file.fileName) this.fileName = file.fileName
  if (file.code) this.code = file.code
  return await this.save()
}

const Meta = mongoose.model('Meta', metaSchema)

module.exports = Meta
