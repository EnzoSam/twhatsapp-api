var express = require('express');
var WSController = require('../controller/wsController.controller');
var service = require('../service/wsService.service');
const asyncLib = require('async');

var router = express.Router();

router.get("/webhook", WSController.verify);  
//router.post("/webhook", WSController.processMessage);
router.get("/", WSController.test); 
router.get("/test1", WSController.test1); 
router.post("/sendtemplate", WSController.sendTemplate); 
router.get("/media/:mediaId", WSController.getMediaUrl);
router.get("/media/download/:mediaId", WSController.download);



const taskQueue = asyncLib.queue((taskData, taskCallback) => {
    
    console.log(taskCallback);
    try {
      service.processWebHookMessage(taskData).then(data=>
        {
          console.log('Finalizo cola.****************');
          taskCallback(); 
        });    
    } catch (error) {
        console.log(error);
        taskCallback(error);
    }
  }, 1);


  router.post('/webhook', (req, res) => {
    const solicitud = req.body;
  
    taskQueue.push(solicitud, (error) => {
      if (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(200);
      } else {
        console.error('OK*********', error);
        res.status(200);
      }
    });
  });
  



module.exports = router;