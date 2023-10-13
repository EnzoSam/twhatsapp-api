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
         ref()
        .orderByChild("contactId")
        .equalTo(_contactId)
        .once("value", data => {
          resolve(data.val());
        });
    } catch (ex) {
      reject(ex);
    }
  });

  return promise;
}

function verifyChat(_contactId) {
  let obj;
  let promise = new Promise((resolve, reject) => {
    try {
        ref()
        .orderByChild("contactId")
        .equalTo(_contactId).limitToFirst(1)
        .once("value", data => {
          if (data.val()) { 
            let chat;
            data.forEach(x=>{
              chat.id = x.key;
              chat = x.val()
            });            
            resolve(chat);
          } else {
            let chat = instanceChat(_contactId);
            insert(chat)
              .then(chatInserted => {
                resolve(chatInserted);
              })
              .catch(error => {
                console.log('eRRPR chat***********');
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