class Change {
    constructor(_messageId, _status,_timestamp, _text) {
        this.messageId = _messageId;
        this.status = _status;
        this.timestamp = _timestamp;
        this.text = _text;
    }
  }

  module.exports = Change;