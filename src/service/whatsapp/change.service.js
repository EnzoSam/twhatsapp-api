const admin = require("firebase-admin");
const db = admin.database();
const Change = require("../../model/whatsapp/change.model");

function test() {
  console.log("Change sevice Ok");
}

module.exports = { test, insert, getChatByContactId,verifyChat,instanceChange };

function ref() {
  return db.ref("change");
}

function instanceChange(_messageId, _status, _timestamp, _text) {
  return new Change(_messageId, _status, _timestamp,_text);
}

function insert(_chat) {
  let promise = new Promise((resolve, reject) => {
    try {
      ref()
        .push(_chat)
        .then(() => {
          resolve(_chat);
        })
        .catch((error) => {
          reject(error);
        });
    } catch (ex) {
      reject(ex);
    }
  });

  return promise;
}

function getChatByContactId(_contactId) {
  let promise = new Promise((resolve, reject) => {
    try {
      const chats = ref()
        .orderByChild("contact/id")
        .equalTo(_contactId)
        .once("value", (data) => {
          resolve(data.val());
        });
    } catch (ex) {
      reject(ex);
    }
  });

  return promise;
}

function verifyChat(_contactId) {
  let promise = new Promise((resolve, reject) => {
    try {
      const chats = ref()
        .orderByChild("contact/id")
        .equalTo(_contactId)
        .once("value", (data) => {
          if (data.val()) {
            resolve(data.val());
          } else {
            let chat = instanceChat(_contactId);
            insert(chat)
              .then((chatInserted) => {
                resolve(chatInserted);
              })
              .catch((error) => {
                reject(error);
              });
          }
        });
    } catch (ex) {
      reject(ex);
    }
  });

  return promise;
}
