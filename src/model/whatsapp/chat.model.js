class Chat {
    constructor(_contactId, _messages, _lastChangeId) {
        this.contactId = _contactId;
        this.messages = _messages;
        this.lastChangeId = _lastChangeId;
    }
  }

module.exports = Chat;