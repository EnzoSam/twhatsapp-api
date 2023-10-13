class Change {
    constructor(_messageId, _status,_timestamp, _text, _chatId) {
        this.messageId = _messageId;
        this.status = _status;
        this.timestamp = _timestamp;
        this.text = _text;
        this.chatId = _chatId;
    }
  }

  module.exports = Change;