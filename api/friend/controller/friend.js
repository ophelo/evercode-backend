const { Profile } = require('../../user/model')

exports.friend_list = async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id })
    .populate({
      path: 'friends'
    })
  if (!profile) return res.status(404).json({ error: 'profile not found!' })
  return res.status(200).json(profile.friends)
}
