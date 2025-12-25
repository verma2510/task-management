const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { auth, admin } = require('../middleware/auth');

// Create Task (Admin only)
router.post('/', auth, admin, async (req, res) => {
    try {
        const { title, description, deadline, assignedStudents } = req.body;

        // assignedStudents should be an array of User IDs
        const task = new Task({
            title,
            description,
            deadline,
            assignedStudents,
            createdBy: req.user.userId
        });

        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Tasks
router.get('/', auth, async (req, res) => {
    try {
        let tasks;
        if (req.user.role === 'admin') {
            // Admin sees tasks they created
            tasks = await Task.find({ createdBy: req.user.userId }).populate('assignedStudents', 'username email');
        } else {
            // Student sees tasks assigned to them
            tasks = await Task.find({ assignedStudents: req.user.userId }).populate('createdBy', 'username');
        }
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Single Task
router.get('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        // Access control
        if (req.user.role !== 'admin' && !task.assignedStudents.includes(req.user.userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(task);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Task
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        // Check user
        if (task.createdBy.toString() !== req.user.userId) {
            return res.status(401).json({ error: 'User not authorized' });
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

