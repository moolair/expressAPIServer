const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Leaderschema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        default: ''
    },
    abbr: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

var Leaders = mongoose.model('Leader', Leaderschema);

module.exports = Leaders;