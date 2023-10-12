const admin = require("firebase-admin");
const db = admin.database();
const Chat = require("../../model/whatsapp/chat.model");

function test() {
  console.log("Chat sevice Ok");
}

module.exports = { test, insert, getChatByContactId,verifyChat,actualizarChat };

function ref() {
  return db.ref("chat");
}

function instanceChat(_contactId) {
  return new Chat(_contactId, [], null);
}

function insert(_chat) {
  let promise = new Promise((resolve, reject) => {
    try {
      ref()
        .push(_chat)
        .then(data => {          
          _chat.id = data.key;
          resolve(_chat);
        })
        .catch(error => {
          reject(error);
        });
    } catch (ex) {
      console.log(ex);
      reject(ex);
    }
  });

  return promise;
}

function getChatByContactId(_contactId) {
  let promise = new Promise((resolve, reject) => {
    try {
      const chats = ref()
        .orderByChild("contactId")
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
        .orderByChild("contactId")
        .equalTo(_contactId)
        .once("value", (data) => {
          if (data.val()) {
            console.log('encontro chat***********');
            resolve(data.val());
          } else {
            console.log('NO encontro chat***********');
            let chat = instanceChat(_contactId);
            insert(chat)
              .then(chatInserted => {
                console.log('iNSERTO chat***********');
                resolve(chatInserted);
              })
              .catch(error => {
                console.log('eRRPR chat***********');
                console.log(ERROR);
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


function actualizarChat(_chat) {
  let promise = new Promise((resolve, reject) => {
    try {
      ref().child(_chat.id).set(_chat)
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