const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Homework Model
 */
const homeworkSchema = new Schema({
    title: String,
    deadline: Date,
    links: Object
});
