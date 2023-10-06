const WsService = require("../service/wsService.service");

var controller = {
  test: function (req, res) {
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
      res.send(req.query["hub.challenge"]);
    } else {
      res.sendStatus(400);
    }
  },
  processMessage: async function (request, res) {
    try {
      WsService.processMessage(request.body)
        .then(() => {
          console.log('ok processMessagePrana');
          res.sendStatus(200);
        })
        .catch((error) => {
          console.log('error processMessagePrana');
          console.log(error);
          //res.sendStatus(200);
        });
    } catch (ex) {
      console.log(ex);
      //res.sendStatus(200);
    }
  }};

module.exports = controller;
