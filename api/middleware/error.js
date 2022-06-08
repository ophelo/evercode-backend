
exports.errController = (err, req, res, next) => {
  const error = { ...err }
  error.message = err.message
  console.log(error)
  switch (error) {
    case error.name === 'ValidationError':
      return res.status(400).json({ error: error.message })
    case error.code === '11000':
      return res.status(400).json({ error: error.message })
  }
  return res.status(500).json({ error: "Internal error!" })
}