const express = require("express");
const { User, Profile, FriendRequest } = require("./model");

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /listings.
const userRoutes = express.Router();

userRoutes.post("/firstConfig", async (req, res, next) => {
  const userObj = req.auth;
  try {
    let user = await User.findOne({
      email: userObj["https://evercode.com/email"],
    });
    if (!user) {
      user = await User.create({
        email: userObj["https://evercode.com/email"],
        username: req.body.username,
      });
      await user.save();
    }
    let profile = await Profile.findOneAndUpdate(
      { user: user._id },
      { $set: { fav_lng: req.body.fav_lng, bio: req.body.bio } },
      { new: true }
    );
    if (!profile) {
      profile = await Profile.create({
        user: user._id,
        fav_lng: req.body.fav_lng,
        bio: req.body.bio,
      });
    }
    return res.status(200).json({ status: "ok" });
  } catch (err) {
    next(err);
  }
});

userRoutes.post("/send_friend_request", async (req, res) => {
  const userObj = req.auth;
  const user = await User.find({ email: userObj.email });
  // const profile = await Profile.findById(id='62707701571ff275412ab4b5');
  const friendProfile = await Profile.find({ user: req.body.user_id });
  const friendRequest = await FriendRequest.create({ sender: user._id });
  console.log(friendProfile[0].friend_request);
  friendProfile[0].friend_request.push(friendRequest._id);
  friendProfile[0].save();
  return res.json(friendProfile[0]);
});

userRoutes.get("/add_friend", async (req, res) => {
  // const userObj = req.auth
  // const user = await User.find({ email: userObj.email })
  const profile = await Profile.find({ user: "62707738a27bc209faeb2126" });
  const requests = profile[0].friend_requests;
  requests.forEach((request) => {
    console.log(request);
    profile[0].friends.push(request.sender);
  });
  profile[0].friend_requests = [];
  profile[0].save().catch((err) => {
    return res.status(500).send(err.message);
  });
  return res.json(profile[0]);
});

module.exports = userRoutes;
