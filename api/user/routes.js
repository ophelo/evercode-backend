const express = require('express')
const { User, Profile } = require('./model')
const { getUser } = require('../middleware/auth')
const { management } = require('../../config/auth')

const userRoutes = express.Router()

userRoutes.get('/checkProfile', (req, res) => {
  const userObj = req.auth;
  management.getUser({id: userObj.sub}, (err,user) => {
    if(err) return res.status(500).json({error: "broken connection with auth0"})
    if(user.user_metadata?.first_config) return res.status(200).json({status: true});
    return res.status(200).json({status: false})
  })
})

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
    management.updateUserMetadata({id: userObj.sub},{first_config: true}, (err,user) => {
      console.log(err)
      if (err) return res.status(500).json({error: "auth0 connection failed!"})
      console.log(user)
      return res.status(200).json({status: 'ok'})
    })
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
