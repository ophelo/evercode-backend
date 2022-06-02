const express = require('express')
const Project = require('./model')
const escapeStringRegexp = import('escape-string-regexp')
const { User, Profile } = require('../user/model')
const { param } = require('../project/routes')
const { find } = require('underscore')
const commentRoutes = express.Router()

//new reaction

//delete reaction


module.exports = reactionRoutes