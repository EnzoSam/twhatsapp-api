class Message {
  constructor(_id, _chatId ,_content, _changes, _timestamp, _type) {
    this.id = _id;
    this.chatId = _chatId;
    this.content = _content;
    this.chanes = _changes;
    this.timestamp = _timestamp;
    this.type = _type;
  }
}

module.exports = Message;
