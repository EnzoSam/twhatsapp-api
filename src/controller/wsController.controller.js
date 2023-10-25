const service = require("../service/wsService.service");

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
  processMessage: function (req, res) {
    try {
      console.log('processMessage---------------------');
      return service.processWebHookMessage(req.body);
    } catch (ex) {
      console.log(ex);
      res.sendStatus(200);
      return ex;
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

module.exports = controller;
