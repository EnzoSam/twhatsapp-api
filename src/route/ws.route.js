
var express = require('express');
var WSController = require('../controller/wsController.controller');

var router = express.Router();

router.get("/", WSController.test); 
router.get("/webhook", WSController.verify);  
router.post("/webhook", WSController.processMessage);

module.exports = router;