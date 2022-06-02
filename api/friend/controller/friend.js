const { User, Profile } = require('../../user/model')

exports.friend_list = async (req,res) => {
  const user = await User.findOne({ email: req.auth["https://evercode.com/email"] });
  // console.log(user);
  const profile = await Profile.findOne({user: user._id})
    .populate({
      path: 'friends'
    });
  // console.log(profile);
  return res.json(profile.friends);
}