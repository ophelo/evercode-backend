const mongoose = require('mongoose');

const metaSchema = new mongoose.Schema({
  upVote: { type: Number, default: 0 }, // number of upVote >0 only if shared true
  downVote: { type: Number, default: 0 }, // number of downVote >0 only if shared true
  copied: { type: Number, default: 0 }, // number of time the document is copied
  views: { type: Number, default: 0 } // number of time the project was opened by other user != owner
})

metaSchema.methods.editStatus = async function (type) {
  if(type.upVote) {
    switch (type.upVote.toString()) {
      case 'up':
        this.upVote += 1
        break;
      case 'down':
        this.upVote -= 1
        break;
      default:
        break;
    }
  }
  if(type.downVote) {
    switch (type.downVote.toString()) {
      case 'up':
        this.downVote += 1
        break;
      case 'down':
        this.downVote -= 1
        break;
      default:
        break;
    }
  }
  if(type.copied) this.copied += 1
  if(type.views) this.views += 1
  return await this.save()
}

metaSchema.methods.copyUp = async function () {
  this.copied += 1
  return await this.save()
}

metaSchema.methods.viewsUp = async function () {
  this.views += 1
  return await this.save()
}

const Meta = mongoose.model('Meta', metaSchema)

module.exports = Meta
