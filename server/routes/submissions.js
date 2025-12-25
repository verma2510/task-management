const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Submission = require('../models/Submission');
const Task = require('../models/Task');
const { auth, admin } = require('../middleware/auth');

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append extension
    }
});
const upload = multer({ storage: storage });

// Submit Work (Student only)
router.post('/:taskId', auth, upload.single('image'), async (req, res) => {
    try {
        // Check if task exists and assigned
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        if (!task.assignedStudents.includes(req.user.userId)) {
            return res.status(403).json({ error: 'Not assigned to this task' });
        }

        // Check existing submission? Allow overwrite? Let's check.
        const existing = await Submission.findOne({ task: req.params.taskId, student: req.user.userId });
        if (existing) {
            return res.status(400).json({ error: 'Already submitted' });
        }

        const submission = new Submission({
            task: req.params.taskId,
            student: req.user.userId,
            imagePath: req.file.path,
        });

        await submission.save();
        res.status(201).json(submission);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Grade Submission (Admin only)
router.put('/:id/grade', auth, admin, async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        const submission = await Submission.findByIdAndUpdate(
            req.params.id,
            { grade, feedback },
            { new: true }
        );
        res.json(submission);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Submissions for a Task (Admin) or Self (Student)
router.get('/task/:taskId', auth, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const submissions = await Submission.find({ task: req.params.taskId }).populate('student', 'username');
            res.json(submissions);
        } else {
            const submission = await Submission.findOne({ task: req.params.taskId, student: req.user.userId });
            res.json(submission ? [submission] : []);
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
