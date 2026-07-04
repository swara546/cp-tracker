const express = require('express');
const cpRouter = express.Router();

const cpController = require('../controller/authController');

cpRouter.post("/login",cpController.login)
cpRouter.post("/register",cpController.register)

module.exports = cpRouter;