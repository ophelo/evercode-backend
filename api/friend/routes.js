const express = require('express')
const { User, Profile } = require('../user/model')
const { FriendRequest } = require('./model')

const userRoutes = express.Router()

/*
The send friend request send a friend request to a user in order
to add later to the circle of friends
*/
userRoutes.post("/add/:friendId", async (req, res) => {
  const user = await User.findOne({ email: req.auth["https://evercode.com/email"] });
  FriendRequest.create({ sender: user._id, receiver: req.params.friendId})
    .then(async fr => {
      await fr.linkUsers();
      return res.json(fr)
    })
    .catch(err => {
      return res.status(403).json({error: err.message})
    });
});

userRoutes.get("/", async (req,res) => {
  const user = await User.findOne({ email: req.auth["https://evercode.com/email"] });
  console.log(user);
  const profile = await Profile.findOne({user: user._id});
  console.log(profile);
  const friends = profile.friends?.map(async friendID =>{
    return await Profile.findById(friendID)
  });
  return res.json(await Promise.all(friends));
});

userRoutes.get("/request", async (req,res) => {
  const user = await User.findOne({ email: req.auth["https://evercode.com/email"] });
  const profile = await Profile.findOne({user: user._id})
  return res.json(profile.friend_requests);
})

userRoutes.post("/request/:requestId/:cmd", async (req, res) => {
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
});

userRoutes.post("/request/:requestId/refuse", async (req, res) => {
  const user = await User.findOne({ email: req.auth["https://evercode.com/email"] });
  const request = await FriendRequest.findById(req.params.requestId);

  if (!request) return res.status(404).json({"error": "request not found!"})
  if (request.receiver.toString() !== user._id.toString()) return res.status(403).json({"error": "forbidden!"})
  
  await request.refuse();
  await request.remove();

  const profile = await Profile.findOne({user: user._id});

  return res.json(profile);
});

module.exports = userRoutes
