const { User } = require('../user/model')

exports.getUser = async (req, res, next) => {
  req.user = await User.findOne({ email: req.auth['https://evercode.com/email'] })
    .catch(err => { return res.status(500).json({error: "internal error!"})})
  if (!req.user) return res.status(404).json({error: "no user found!"});
  next()
}
