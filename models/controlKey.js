let mongoose = require('mongoose');

let controlKeySchema = mongoose.Schema({
  code:{
    type: String,
    required: true
  },
  accessLevel:{
    type: String,
    required: true
  }
})

module.exports = mongoose.model('ControlKey', controlKeySchema);
