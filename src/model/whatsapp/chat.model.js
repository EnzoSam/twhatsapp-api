class Chat {
    constructor(_contactId, _messages, _lastMessageId) {
        this.contactId = _contactId;
        this.messages = _messages;
        this.lastMessageId = _lastMessageId;
    }
  }

module.exports = Chat;