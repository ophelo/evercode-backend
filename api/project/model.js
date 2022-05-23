const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const projectSchema = mongoose.Schema({
  UPID: {
    type: String,
    default: function genUUID() {
      return uuidv4();
    },
  },
  name: { type: String },
  language: { type: String },
  description: { type: String },
  owner: { type: String, required: true, ref: "User" },
  policy: { type: String },
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
