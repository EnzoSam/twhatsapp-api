const admin = require("firebase-admin");
const db = admin.database();
const helper = require("./whatsappHelper");
const chatService = require("./whatsapp/chat.service");
const contactService = require("./whatsapp/contact.service");
const changeService = require("./whatsapp/change.service");
const messageService = require("./whatsapp/message.service");

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

  chatService.getChatByContactId("5493751446485");
}

module.exports = {
  test,
  test1,
  processWebHookMessage,
  sendTemplateMessage,
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
            }
          })
          .catch((error) => {
            reject(error);
          });
      }
      //db.ref("messages").push(body);
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
          .then(data => {
            console.log('data ***********************');
            console.log(data.data);
            if (data.data && data.data.messages && data.data.messages.length > 0) {
              console.log('data.data.messages****************');
              console.log(data.data.messages);
              contactService
                .verifyContact(params.recipient, params.recipient)
                .then(contactVerify => {
                  console.log('contactVerify***********');
                  console.log(contactVerify);
                  let message = messageService.instanceMessage(
                    data.data.messages[0].id,
                    null,
                    params,
                    [],
                    Date.now(),
                    "template"
                  );
                  console.log('verifyChat***********');
                  chatService
                    .verifyChat(contactVerify.id)
                    .then(chat => {
                      console.log('chat***********');
                      console.log(chat);
                      message.chatId = chat.id;
                      messageService
                        .insert(message)
                        .then(messageUpdated => {
                          chat.lastMessageId = messageUpdated.id;
                          chatService
                            .actualizarChat(chat)
                            .then(chatUpdated => {
                              resolve(chatUpdated);
                            })
                            .catch(error => {
                              reject(error);
                            });
                        })
                        .catch(error => {
                          reject(error);
                        });
                    })
                    .catch(error => {
                      reject(error);
                    });
                })
                .catch(error => {
                  reject(error);
                });
            }
            else
            {
              reject({
                code: 500,
                message: "La API no respondio con valores.",
                error: data
              });
            }            
          })
          .catch(error => {
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
      contactService.instanceContact(
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
    apiObject.entry[0].changes[0].value.messages.length > 0
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
