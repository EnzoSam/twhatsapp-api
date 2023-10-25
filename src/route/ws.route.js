var express = require('express');
var WSController = require('../controller/wsController.controller');
var service = require('../service/wsService.service');
const async = require('async');

var router = express.Router();

router.get("/webhook", WSController.verify);  
//router.post("/webhook", WSController.processMessage);
router.get("/", WSController.test); 
router.get("/test1", WSController.test1); 
router.post("/sendtemplate", WSController.sendTemplate); 
router.get("/media/:mediaId", WSController.getMediaUrl);
router.get("/media/download/:mediaId", WSController.download);



const requestQueue = async.queue(async (task, callback) => {
    
    console.log(callback);
    try {
      await service.processWebHookMessage(task);
      callback(); // Llama a callback() cuando la solicitud se ha completado
    } catch (error) {
        console.log(error);
      callback(error); // Llama a callback() con un error en caso de fallo
    }
  }, 1);


  router.post('/webhook', (req, res) => {
    const solicitud = req.body;
  
    // Agrega la solicitud a la cola
    requestQueue.push(solicitud, (error) => {
      if (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(200);
      } else {
        res.status(200);
      }
    });
  });
  



module.exports = router;