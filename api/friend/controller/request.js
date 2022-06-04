const { Profile } = require('../../user/model')
const { FriendRequest } = require('../models/friendRequest')

exports.request_delete = async (req, res) => {
  const fr = await FriendRequest.findOne({sender: req.user._id, _id: req.params.reqId })
  if (!fr) return res.status(404).json({error: "Not found!"})
  await fr.unlinkUsers();
  await fr.remove()
    .catch(err => {
      return res.status(500).json({error: "internal error!"})
    })
  return res.status(204).json()
}

exports.request_send = async (req, res) => {
  await FriendRequest.create({ sender: req.user._id, receiver: req.params.friendId })
    .then(async fr => {
      await fr.linkUsers()
      return res.status(200).json(fr)
    })
    .catch(err => {
      return res.status(403).json({ error: err.message })
    })
}

exports.request_list = async (req, res) => {
  let type;
  switch (req.query?.type){
    case 'send':
      type=1
      break
    case 'received':
      type=0
      break
    default:
      return res.status(400).json({error: "bad request"})
  }
  const profile = await Profile.findOne({ user: req.user._id }, 'friend_requests -_id')
    .populate({
      path: 'friend_requests',
      select: '-__v -send_at',
      match: type ? {sender: req.user._id } : { receiver: req.user._id},
      populate: {
        path: type ? 'receiver' : 'sender',
        select: '-__v'
      }
    })
  if (!profile) return res.status(404).json({error: "No profile found!"})
  return res.status(200).json(profile.friend_requests)
}

exports.request_action = async (req, res) => {
  const request = await FriendRequest.findById(req.params.requestId)

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
