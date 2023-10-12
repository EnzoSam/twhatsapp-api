var axios = require('axios');

function sendMessage(data) {
  var config = {
    method: 'post',
    url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
    headers: {
      'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: data
  };
  return axios(config);
}

function getTextMessageData(recipient, text) {
  return JSON.stringify({
    "messaging_product": "whatsapp",
    "preview_url": false,
    "recipient_type": "individual",
    "to": recipient,
    "type": "text",
    "text": {
        "body": text
    }
  });
}

function getTemplateMessageData(_recipient, _templateName, _documentId, _fileName) {

  if(!_recipient)
    return undefined;
  if(!_templateName)
    return undefined;
  if(!_documentId)
    return undefined;
  if(!_fileName)
    return undefined;

  return JSON.stringify({
    "messaging_product": "whatsapp",
    "preview_url": false,
    "recipient_type": "individual",
    "to": _recipient,
    "type": "template",
    "template": {
        "name": _templateName,
        "components":[
          {
            type:"header",
            parameters:[
              {
                type:"document",
                document:
                {
                  id:_documentId,
                  filename:_fileName
                }
              }
            ]
          }
        ],
        language: 
        { 
          code: "es" 
        }
    }
  });
}

module.exports = {
  sendMessage: sendMessage,
  getTextMessageData: getTextMessageData,
  getTemplateMessageData:getTemplateMessageData
};
