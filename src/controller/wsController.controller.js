const service = require("../service/wsService.service");
const async = require('async');

var controller = {
  test: function (req, res) {
    return res.status(200).send({
      message: "WSController OK.",
    });
  },
  test1: function (req, res) {
    service.test1();

    return res.status(200).send({
      message: "WSController OK.",
    });
  },
  verify: function (req, res) {
    if (
      req.query["hub.mode"] == "subscribe" &&
      req.query["hub.verify_token"] == process.env.VERIFY_TOKEN
    ) {
      res.status(200).send(req.query["hub.challenge"]);
    } else {
      res.sendStatus(400);
    }
  },
  processMessage: function (request, res) {
    try {
      requestQueue.push(request.body, error => {
        if (error) {
          console.error('Error al procesar la solicitud:', error);
        } else {
          console.log("ok processMessagePrana");
          res.sendStatus(200);
          console.log('processMessage/////////////////');
        }
      });
    } catch (ex) {
      console.log(ex);
      res.sendStatus(200);
    }
  },
  sendTemplate(req, res) {
    service
      .sendTemplateMessage(req.body)
      .then((data) => {
        return res
          .status(200)
          .send({ message: "Enviado correctamente", response: data });
      })
      .catch((error) => {
        if (error && error.code) return res.status(error.code).send(error);
        else return res.status(500).send(error);
      });
  },
  getMediaUrl(req, res) {
    service
      .getMediaUrl(req.params.mediaId)
      .then((data) => {
        res.status(200).send(data.url);
      })
      .catch((error) => {
        {
          if (error && error.code) return res.status(error.code).send(error);
          else return res.status(500).send(error);
        }
      });
  },
  download(req, res) {
    service
      .downloadMedia(req.params.mediaId)
      .then((data) => {
        res.setHeader("Content-Disposition", "attachment; ");
        res.setHeader("Content-Type", data.mimeType);

        res.send(data.file);
      })
      .catch((error) => {
        {
          if (error && error.code) return res.status(error.code).send(error);
          else return res.status(500).send(error);
        }
      });
  },
};

const requestQueue = async.queue(async (task, callback) => {
  try {
    console.log('processMessage---------------------');
    await service  
    .processWebHookMessage(task);
    callback();
  } catch (error) {
    callback(error);
  }
}, 1); 

module.exports = controller;
