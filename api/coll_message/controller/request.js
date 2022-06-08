const { Profile } = require('../../user/model')
const { CollaborativeRequest } = require('../models/collRequest')

exports.request_delete = async (req, res) => {
  const cr = await CollaborativeRequest.findOne({sender: req.user._id, _id: req.params.reqestId })
  if (!cr) return res.status(404).json({error: "Not found!"})
  await cr.unlinkProject();
  await cr.remove()
    .catch(err => {
      return res.status(500).json({error: "internal error!"})
    })
  return res.status(204).json()
}

exports.request_send = async (req, res) => {
  await CollaborativeRequest.create({ sender: req.user._id, receiver: req.params.receiverId, project: req.params.projectId  })
    .then(async cr => {
      await cr.linkProject()
      return res.status(200).json(cr)
    })
    .catch(err => {
      return res.status(403).json({ error: err.message })
    })
}

exports.request_list = async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id }, 'collaborative_requests -_id')
    .populate({
      path: 'collaborative_requests',
      select: '-__v -send_at',
      match: {receiver: req.user._id},
      populate: {
        path: 'project',
        select: '-__v'
      }
    })
  if (!profile) return res.status(404).json({error: "No profile found!"})
  return res.status(200).json(profile.collaborative_requests)
}

exports.request_action = async (req, res) => {
  const request = await CollaborativeRequest.findById(req.params.requestId)

  if (!request) return res.status(404).json({ error: 'request not found!' })
  if (request.receiver.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'forbidden!' })

  switch (req.params.cmd) {
    case 'accept':
      await request.accept()
      break
    case 'refuse':
      await request.refuse()
      break
    default:
      return res.status(400).json({ error: 'bad request!' })
  }

  await request.remove()

  const profile = await Profile.findOne({ user: req.user._id })
  if (!profile) return res.status(404).json({error: "No profile found!"})

  return res.status(200).json(profile)
}
