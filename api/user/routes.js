const express = require('express');
const { User, Profile, FriendRequest} = require('./model');
const mongoose = require('mongoose')

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /listings.
const userRoutes = express.Router()

userRoutes.post('/firstConfig', async (req, res, next) => {
  //mongoose.connection.db.dropCollection('profiles');
  const user_obj = req.auth;
  try {
    const user = await User.findOne({email: user_obj["https://evercode.com/email"]});
    if (!user) {
      user = await User.create({
        email: user_obj["https://evercode.com/email"],
        username: req.body.username
      })
      await user.save();
    }
    const profile = await Profile.findOneAndUpdate({user: user._id}, {$set: {fav_lng: req.body.fav_lng, bio: req.body.bio} }, {new: true});
    if (!profile){
      profile = await Profile.create({user: user._id, fav_lng: req.body.fav_lng, bio: req.body.bio})
    }
    console.log(profile);
    console.log(user);
    return res.status(200).json({ "status": "ok" });
  } catch(err) {
    next(err);
  }
  
})

userRoutes.post('/send_friend_request', async (req,res) => {
  const user_obj = req.auth;
  const user = await User.find({email: user_obj.email});
  //const profile = await Profile.findById(id='62707701571ff275412ab4b5');
  const friend_profile = await Profile.find({user: '62707738a27bc209faeb2126'});
  const friend_request = await FriendRequest.create({sender: user._id})
  console.log(friend_profile[0].friend_requests);
  friend_profile[0].friend_requests.push(friend_request._id);
  friend_profile[0].save();
  return res.json(friend_profile[0]);
})

userRoutes.get('/add_friend', async (req, res) => {
  const user_obj = req.auth;
  const user = await User.find({email: user_obj.email});
  const profile = await Profile.find({user: '62707738a27bc209faeb2126'});
  const requests = profile[0].friend_requests;
  requests.forEach((request) => {
    console.log(request);
    profile[0].friends.push(request.sender);
  })
  profile[0].friend_requests = [];
  profile[0].save()
  .catch((err) => {
    return res.status(500).send(err.message);
  });
  return res.json(profile[0]); 
  
})

module.exports = userRoutes
