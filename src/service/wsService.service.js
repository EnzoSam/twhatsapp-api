const admin = require("firebase-admin");
const db = admin.database();
const helper = require("./whatsappHelper");
const chatService = require("./whatsapp/chat.service");
const contactService = require("./whatsapp/contact.service");
const changeService = require("./whatsapp/change.service");
const messageService = require("./whatsapp/message.service");
const { response } = require("express");

function test() {
  console.log("WSService Ok");
}

function test1() {
  /*
  contactService.insert({id:'5493751446485', name:'Enzo'})
  .then(contactInserted=>
    {
      chatService.insert({contact:contactInserted,messages:[]}).then
      (chatInserted=>
        {
          console.log(chatInserted);
        }
        );
    });*/

  /*
  chatService
    .verifyChat("5493751446485")
    .then((dat) => {
      console.log(dat);
    })
    .catch((err) => {
      console.log(err);
    });*/

  chatService
    .verifyChat("5493751446485")
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    });
}

module.exports = {
  test,
  test1,
  processWebHookMessage,
  sendTemplateMessage,
  getMediaUrl,
  downloadMedia,
};

function processWebHookMessage(body) {
  let promise = new Promise((resolve, reject) => {
    try {
      let contact = getContactFromWebhookObject(body);
      if (contact) {
        contactService
          .verifyContact(contact.id, contact.name)
          .then((contactVerify) => {
            let change = getChangeFromWebhookObject(body);
            if (change) {
              chatService
                .verifyChat(contact.id)
                .then((chat) => {
                  change.chatId = chat.id;
                  changeService
                    .insert(change)
                    .then((changeInserted) => {
                      chat.lastChangeId = changeInserted.id;
                      chatService
                        .actualizarChat(chat)
                        .then((chatUpdated) => {
                          resolve(chatUpdated);
                        })
                        .catch((error) => {
                          reject(error);
                        });
                    })
                    .catch((error) => {
                      console.log(error);
                      reject(error);
                    });
                })
                .catch((error) => {
                  reject(error);
                });
            } else {
              let message = getMessageFromWebhookObject(body);
              if (message) {
                chatService
                  .verifyChat(contact.id)
                  .then((chat) => {
                    message.chatId = chat.id;
                    messageService
                      .insert(message)
                      .then((messageUpdated) => {
                        chat.lastMessageId = messageUpdated.id;
                        chatService
                          .actualizarChat(chat)
                          .then((chatUpdated) => {
                            resolve(chatUpdated);
                          })
                          .catch((error) => {
                            reject(error);
                          });
                      })
                      .catch((error) => {
                        reject(error);
                      });
                  })
                  .catch((error) => {
                    reject(error);
                  });
              }
              else
              {
                resolve();
                console.log('Tipo de mensaje no contemplado');
                console.log(JSON.stringify(body));
              }
            }
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        console.log(body);
        reject({ code: 500, message: "Contacto no encontdado", error: body });
      }
    } catch (ex) {
      reject(ex);
    }
  });

  return promise;
}

function sendTemplateMessage(params) {
  let promise = new Promise((resolve, reject) => {
    try {
      let template = helper.getTemplateMessageData(
        params.recipient,
        params.templateName,
        params.documentId,
        params.fileName
      );
      if (template) {
        helper
          .sendMessage(template)
          .then((data) => {
            if (
              data.data &&
              data.data.messages &&
              data.data.messages.length > 0
            ) {
              contactService
                .verifyContact(params.recipient, params.recipient)
                .then((contactVerify) => {
                  let message = messageService.instanceMessage(
                    data.data.messages[0].id,
                    null,
                    params,
                    [],
                    Date.now(),
                    "template"
                  );
                  chatService
                    .verifyChat(params.recipient)
                    .then((chat) => {
                      message.chatId = chat.id;
                      messageService
                        .insert(message)
                        .then((messageUpdated) => {
                          resolve(messageUpdated);
                        })
                        .catch((error) => {
                          reject(error);
                        });
                    })
                    .catch((error) => {
                      console.log(error);
                      reject(error);
                    });
                })
                .catch((error) => {
                  reject(error);
                });
            } else {
              reject({
                code: 500,
                message: "La API no respondio con valores.",
                error: data,
              });
            }
          })
          .catch((error) => {
            reject({
              code: 500,
              message: "Error en peticion a API WS.",
              error: error,
            });
          });
      } else {
        reject({
          code: 500,
          message: "Parametros invalidos.",
          error: undefined,
        });
      }
    } catch (ex) {
      reject({ code: 500, message: "Eror Catch ", error: ex });
    }
  });

  return promise;
}

function getContactFromWebhookObject(apiObject) {
  let contact = undefined;
  if (
    apiObject.entry[0].changes[0].value.contacts &&
    apiObject.entry[0].changes[0].value.contacts.length > 0
  ) {
    contact = contactService.instanceContact(
      apiObject.entry[0].changes[0].value.contacts[0].wa_id,
      apiObject.entry[0].changes[0].value.contacts[0].profile.name
    );
  }

  if (!contact) {
    if (
      apiObject.entry[0].changes[0].value.statuses &&
      apiObject.entry[0].changes[0].value.statuses.length > 0 &&
      apiObject.entry[0].changes[0].value.statuses[0].recipient_id
    ) {
      contact = contactService.instanceContact(
        apiObject.entry[0].changes[0].value.statuses[0].recipient_id,
        apiObject.entry[0].changes[0].value.statuses[0].recipient_id
      );
    }
  }

  return contact;
}

function getChangeFromWebhookObject(apiObject) {
  let change = undefined;
  if (
    apiObject.entry.length > 0 &&
    apiObject.entry[0].changes.length > 0 &&
    apiObject.entry[0].changes[0].value &&
    apiObject.entry[0].changes[0].value.statuses &&
    apiObject.entry[0].changes[0].value.statuses.length > 0
  ) {
    let text = "";
    if (
      apiObject.entry[0].changes[0].value.statuses[0].errors &&
      apiObject.entry[0].changes[0].value.statuses[0].errors.length > 0
    ) {
      text = apiObject.entry[0].changes[0].value.statuses[0].errors[0].title;
    }

    change = changeService.instanceChange(
      apiObject.entry[0].changes[0].value.statuses[0].id,
      apiObject.entry[0].changes[0].value.statuses[0].status,
      apiObject.entry[0].changes[0].value.statuses[0].timestamp,
      text
    );
  }
  return change;
}

function getMessageFromWebhookObject(apiObject) {
  let message = undefined;

  if (
    apiObject.entry.length > 0 &&
    apiObject.entry[0].changes.length > 0 &&
    apiObject.entry[0].changes[0].value &&
    apiObject.entry[0].changes[0].value.messages &&
    apiObject.entry[0].changes[0].value.messages.length > 0 &&
    apiObject.entry[0].changes[0].value.messages[0].text &&
    apiObject.entry[0].changes[0].value.messages[0].text.body    
  ) {
    message = messageService.instanceMessage(
      apiObject.entry[0].changes[0].value.messages[0].id,
      null,
      apiObject.entry[0].changes[0].value.messages[0].text.body,
      [],
      apiObject.entry[0].changes[0].value.messages[0].timestamp,
      "text"
    );
  }

  return message;
}

function getMediaUrl(mediaId) {
  return new Promise((resolve, reject) => {
    try {
      helper.getMediaUrl(mediaId).then((data) => {
        if (data && data.data) {
          resolve(data.data);
        } else {
          reject({
            error: 500,
            message: "Sin respuesta al recuperar url media",
            error: data,
          });
        }
      });
    } catch (ex) {
      reject({
        error: 500,
        message: "Error al recuperar url media",
        error: ex,
      });
    }
  });
}

function downloadMedia(mediaId) {
  return new Promise((resolve, reject) => {
    try {
      getMediaUrl(mediaId)
        .then(medaData => {
          helper
            .downloadMedia(medaData.url).then(response =>
              {
                resolve(
                  {
                    mimeType:medaData.mime_type,
                    file: response.data                    
                  }
                  );
                //console.log(JSON.stringify(response.data));
              }
           );
        })
        .catch((error) => {
          reject({
            error: 500,
            message: "Error al recuperar url media",
            error: error,
          });
        });
    } catch (ex) {
      reject({
        error: 500,
        message: "Error al recuperar url media",
        error: ex,
      });
    }
  });
}
