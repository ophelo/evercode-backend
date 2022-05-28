const express = require('express')
const { User, Profile } = require('./model')

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

module.exports = userRoutes
