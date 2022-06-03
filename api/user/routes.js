const express = require('express')
const { User, Profile, FriendRequest, CollaborativeRequest } = require('./model')

const userRoutes = express.Router()

/*
The first configuration api create the user and profile obj for a user that has signin with Auth0
and populates the profile attributes
*/

userRoutes.post('/firstConfig', async (req, res, next) => {
  const userObj = req.auth
  try {
    let user = await User.findOne({
      email: userObj['https://evercode.com/email']
    })
    if (!user) {
      user = await User.create({
        email: userObj['https://evercode.com/email'],
        username: req.body.username
      })
      await user.save()
    }
    let profile = await Profile.findOneAndUpdate(
      { user: user._id },
      { $set: { fav_lng: req.body.fav_lng, bio: req.body.bio } },
      { new: true }
    )
    if (!profile) {
      profile = await Profile.create({
        user: user._id,
        fav_lng: req.body.fav_lng,
        bio: req.body.bio
      })
    }
    return res.status(200).json({ status: 'ok' })
  } catch (err) {
    next(err)
  }
})

/*
The send friend request send a friend request to a user in order
to add later to the circle of friends
*/

userRoutes.post("/sendFriendRequest", async (req, res) => {
  const user = await User.findOne({ email: req.auth["https://evercode.com/email"] });
  const friendProfile = await Profile.findOne({ user: req.body.user_id });
  console.log(friendProfile);
  const friendRequest = await FriendRequest.create({ sender: user._id, type: 'RECEIVED'});
  console.log(friendProfile.friend_request);
  friendProfile.friend_requests.push(friendRequest._id);
  await friendProfile.save();
  return res.json(friendRequest);
});

userRoutes.get("/viewFriend", async (req,res) => {
  const user = await User.find({ email: req.auth["https://evercode.com/email"] });
  console.log(user);
  const profile = await Profile.find({user: user._id});
  return res.json(profile.friends);
});

userRoutes.get("/viewFriendRequest", async (req,res) => {
  const user = await User.findOne({ email: req.auth["https://evercode.com/email"] });
  const profile = await Profile.findOne({user: user._id})
  return res.json(profile.friend_requests);
})

userRoutes.post("/addFriend", async (req, res) => {
  const user = await User.findOne({ email: req.auth["https://evercode.com/email"] });
  const profile = await Profile.findOne({user: user._id});

  const requests = profile.friend_requests;
  requests.forEach(async (id) => {
    const r = await FriendRequest.findById(id);
    console.log(r.sender);
    profile.friends.push(r.sender);
    console.log(profile.friends);
  });
  profile.friend_requests = [];
  await profile.save().catch((err) => {
    return res.status(500).send(err.message);
  });
  return res.json(profile);
});

 // ---- ON COLLABORATIVE REQUEST ---- //

userRoutes.get("/viewCollaborativeRequest", async (req,res) => {
  const user = await User.findOne({ email: req.auth["https://evercode.com/email"] });
  const profile = await Profile.findOne({user: user._id})
  return res.json(profile.collaborative_requests);
})

userRoutes.post("/sendCollaborativeRequest", async (req, res) => {
  const user = await User.findOne({ email: req.auth["https://evercode.com/email"] });
  const friendProfile = await Profile.findOne({ user: req.body.user_id });
  console.log(friendProfile);
  const collaborativeRequest = await CollaborativeRequest.create({ sender: user._id, project: req.body.project_id, type: 'RECEIVED'});
  console.log(collaborativeRequest.friend_request);
  friendProfile.collaborative_requests.push(collaborativeRequest._id);
  await friendProfile.save();
  return res.json(collaborativeRequest);
});

userRoutes.post("/acceptCollaboration", async (req, res) => {
  const user = await User.findOne({ email: req.auth["https://evercode.com/email"] });
  const profile = await Profile.findOne({user: user._id});

  const requests = profile.collaborative_requests;
  requests.forEach(async (id) => {
    const r = await CollaborativeRequest.findById(id);
    console.log(r.project);
    profile.projects.push(r.project);
    console.log(profile.projects);
  });
  profile.collaborative_requests = [];
  await profile.save().catch((err) => {
    return res.status(500).send(err.message);
  });
  return res.json(profile);
});

module.exports = userRoutes
