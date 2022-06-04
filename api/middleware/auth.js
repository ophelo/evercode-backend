const { User } = require('../user/model')

exports.getUser = async (req, res, next) => {
  req.user = await User.findOne({ email: req.auth['https://evercode.com/email'] })
  next()
}
