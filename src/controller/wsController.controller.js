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
    console.log(req.query["hub.mode"]);
    console.log(req.query["hub.verify_token"]);

    if (
      req.query["hub.mode"] == "subscribe" &&
      req.query["hub.verify_token"] == process.env.VERIFY_TOKEN
    ) {
      res.status(200).send(req.query["hub.challenge"]);
    } else {
      res.sendStatus(400);
    }
  },
  processMessage: async function (request, res) {
    console.log("post ");
    console.log(request.body);
    res.sendStatus(200);
    try {
      service
        .processWebHookMessage(request.body)
        .then(() => {
          console.log("ok processMessagePrana");
          res.sendStatus(200);
        })
        .catch((error) => {
          console.log("error processMessagePrana");
          console.log(error);
          //res.sendStatus(200);
        });
    } catch (ex) {
      console.log(ex);
      //res.sendStatus(200);
    }
  },
  sendTemplate(req, res) {
    service
      .sendTemplate(req.body)
      .then((data) => {
        return res
          .status(200)
          .send({ message: "Enviado correctamente", response: data });
      })
      .catch(error);
    {
      return res.status(error.code).send(error);
    }
  },
};

module.exports = controller;
