var express = require('express');
var WSController = require('../controller/wsController.controller');

var router = express.Router();

router.get("/webhook", WSController.verify);  
router.post("/webhook", WSController.processMessage);
router.get("/", WSController.test); 
router.get("/test1", WSController.test1); 
router.post("/sendtemplate", WSController.sendTemplate); 
router.get("/media/:mediaId", WSController.getMediaUrl);

module.exports = router;