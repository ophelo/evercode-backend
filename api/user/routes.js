const express = require('express')
const { FriendRequest } = require('../friend/models/friendRequest')
const { User, Profile } = require('./model')
const { getUser } = require('../middleware/auth')

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
        bio: req.body.bio,
        friend_requests: []
      })
    }
    console.log(profile)
    return res.status(200).json({ status: 'ok' })
  } catch (err) {
    next(err)
  }
})

userRoutes.get('/me', getUser, async (req,res) => {
  const profile = await Profile.findOne({user: req.user._id})
    .populate('user')
  if (!profile) return res.status(404).json({error: "No profile found!"})
  return res.status(200).json(profile);
})

module.exports = userRoutes
