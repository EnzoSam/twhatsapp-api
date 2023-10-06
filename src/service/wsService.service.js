//const admin = require('firebase-admin');
//const db = admin.database();

exports.test = async function () {
  console.log("WSService Ok");
};
/*
module.exports.processMessage = processMessage;

function processMessage(body) {
  let promise = new Promise((resolve, reject) => {
    try {
      db.ref("messages").push(body);
      console.log('guardo okk!!!!');
      resolve();
    } catch (ex) {
      reject(ex);
    }
  });

  return promise;
}
*/
