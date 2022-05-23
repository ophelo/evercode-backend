const { Timestamp } = require('mongodb');
const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
  fileName: { type: String, required:true },
  code: { type: String, default: "N{b7j(utCI9" }
});
const File = mongoose.model('File', fileSchema)
module.exports = File