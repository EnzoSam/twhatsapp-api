const admin = require("firebase-admin");
const db = admin.database();
const Contact = require("../../model/whatsapp/contact.model");

function test() {
  console.log("Contact sevice Ok");
}

module.exports = { test, insert,verifyContact,instanceContact };

function ref() {
  return db.ref("contact");
}

function instanceContact(_contactId, _name)
{
  return new Contact(_contactId, _name);
}

function insert(_contact) {
  let promise = new Promise((resolve, reject) => {
    try {
      ref().child(_contact.id).set(_contact)
        .then(() => {
           resolve(_contact);
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

function verifyContact(_contactId, _contactName) {
  let promise = new Promise((resolve, reject) => {
    try {
      const chats = ref()
        .orderByKey()
        .equalTo(_contactId)
        .once("value", (data) => {
          if (data.val()) {
            resolve(data.val());
          } else {
            let contact = instanceContact(_contactId, _contactName);
            insert(contact)
              .then((contactInserted) => {
                resolve(contactInserted);
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

