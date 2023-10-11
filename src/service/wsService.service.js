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
  chatService
    .verifyChat("5493751446485")
    .then((dat) => {
      console.log(dat);
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = {
  test,
  test1,
  processWebHookMessage,
  sendMessage,
};

function processWebHookMessage(body) {
  let promise = new Promise((resolve, reject) => {
    try {
      let contact = getContactFromWebhookObject(body);
      if (contact) {
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
                    chat.lastMessage = messageUpdated;
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
      }
      //db.ref("messages").push(body);
    } catch (ex) {
      reject(ex);
    }
  });

  return promise;
}

function sendMessage(params) {
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
            resolve(data);
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

      resolve();
    } catch (ex) {
      reject({ code: 500, message: "Eror", error: ex });
    }
  });
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
      apiObject.entry[0].changes[0].value.messages[0].id, null,
      apiObject.entry[0].changes[0].value.messages[0].text.body,
      [],
      apiObject.entry[0].changes[0].value.messages[0].timestamp, 'text'
    );
  }

  return message;
}
