const admin = require("firebase-admin");
const db = admin.database();
const Message = require("../../model/whatsapp/message.model");

function test() {
  console.log("Message sevice Ok");
}

module.exports = { test, insert, getById,instanceMessage };

function ref() {
  return db.ref("message1");
}

function instanceMessage(_id,_chatId,_content, _changes, _timestamp,_type) {
  return new Message(_id, _chatId,_content,_changes, _timestamp,_type);
}

function insert(_message) {
  let promise = new Promise((resolve, reject) => {
    try {
      ref()
        .push(_message)
        .then(() => {
          resolve(_message);
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

function getById(_messageId) {
  let promise = new Promise((resolve, reject) => {
    try {
      const chats = ref()
        .orderByKey()
        .equalTo(_messageId)
        .once("value", (data) => {
          resolve(data.val());
        });
    } catch (ex) {
      reject(ex);
    }
  });

  return promise;
}
