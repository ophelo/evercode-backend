const { User, Profile } = require('../../user/model')
const { FriendRequest } = require('../models/friendRequest')

exports.request_send = async (req, res) => {
  const user = await User.findOne({ email: req.auth["https://evercode.com/email"] });
  FriendRequest.create({ sender: user._id, receiver: req.params.friendId})
    .then(async fr => {
      await fr.linkUsers();
      return res.json(fr)
    })
    .catch(err => {
      return res.status(403).json({error: err.message})
    });
}

exports.request_list = async (req,res) => {
  const user = await User.findOne({ email: req.auth["https://evercode.com/email"] });
  const profile = await Profile.findOne({user: user._id},'friend_requests -_id')
    .populate({
      path: 'friend_requests',
      populate: {
        path: 'sender'
      }
    })
  return res.json(profile.friend_requests);
}

exports.request_action = async (req, res) => {
  const user = await User.findOne({ email: req.auth["https://evercode.com/email"] });
  const request = await FriendRequest.findById(req.params.requestId);

  if (!request) return res.status(404).json({"error": "request not found!"})
  if (request.receiver.toString() !== user._id.toString()) return res.status(403).json({"error": "forbidden!"})
  
  switch (req.params.cmd){
    case 'accept':
      await request.accept();
      break;
    case 'refuse':
      await request.refuse();
      break;
    default:
      return res.status(400).json({"error": "bad request!"})
  }

  await request.remove();

  const profile = await Profile.findOne({user: user._id});

  return res.json(profile);
}

