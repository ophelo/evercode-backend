const express = require('express');
const { User, Profile, FriendRequest} = require('./model');

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /listings.
const userRoutes = express.Router()

// This section will help you get a list of all the documents.
userRoutes.get('/users', async (req, res) => {
  // if (!req.oidc.isAuthenticated()) {
  //   res.json('Unauthorized');
  //   return
  // }
  const users = await User.find({})
  res.json(users)
})

userRoutes.get('/profile', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    res.json('Unauthorized');
    return
  }
  res.json(req.oidc.user);
})

userRoutes.get('/check_profile', async (req, res) => {
  // if (!req.oidc.isAuthenticated()) {
  //   res.json('Unauthorized');
  //   return
  // }
  const profile = await Profile.find({user: '62707738a27bc209faeb2126'});
  res.json(profile[0]);
})

userRoutes.get('/send_friend_request', async (req,res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.json('Unauthorized');
  }
  const user = await User.findById(id='627076df5c01795d36cfbc96');
  //const profile = await Profile.findById(id='62707701571ff275412ab4b5');
  const friend_profile = await Profile.find({user: '62707738a27bc209faeb2126'});
  const friend_request = await FriendRequest.create({sender: user._id})
  console.log(friend_profile[0].friend_requests);
  friend_profile[0].friend_requests.push(friend_request._id);
  friend_profile[0].save();
  return res.json(friend_profile[0]);
})

userRoutes.get('/add_friend', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    res.json('Unauthorized');
    return
  }
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

// This section will help you get a list of all the documents.
userRoutes.route('/addUser').get(async function (req, res) {
  console.log("Entro nell'api: ");
  const user = await User.create({
    name: 'prova',
    age: 12,
  })
  await user.save();
  const profile = await Profile.create({user: user._id})
  return res.json(profile);
})

module.exports = userRoutes
