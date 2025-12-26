const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    number: { type: Number, required: true },
    name: { type: String, required: true }
});

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lessons: [lessonSchema]
});

const syllabusSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    subjects: [subjectSchema]
}, { timestamps: true });

module.exports = mongoose.model('Syllabus', syllabusSchema);
