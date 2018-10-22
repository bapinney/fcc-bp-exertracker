const mongoose = require('mongoose');
const shortid = require('shortid');

const ExerciseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        maxlength: [100, 'Description too long.  Max 100 Chars.']
    },
    duration: {
        type: Number,
        required: true,
        min: [1, 'Duration must be at least one minute']
    },
    date: {
        type: Date, 
        default: Date.now
    },
    userId: {
        type: String,
        required: true
    }
})

const Exercise = mongoose.model('Exercise', ExerciseSchema);
module.exports = Exercise;