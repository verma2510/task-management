const express = require('express');
const Syllabus = require('../models/Syllabus');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

// Get ALL Syllabi (Admin only)
router.get('/', auth, admin, async (req, res) => {
    try {
        const syllabi = await Syllabus.find().populate('student', 'username email');
        res.json(syllabi);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Syllabus for a Student (Admin or the student themselves)
router.get('/:studentId', auth, async (req, res) => {
    try {
        // Access control: Admin or the specific student
        // req.user.userId comes from auth middleware decoding the token
        // Use loose equality for safety if types differ, or strict if confident.
        if (req.user.role !== 'admin' && req.user.userId !== req.params.studentId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const syllabus = await Syllabus.findOne({ student: req.params.studentId }).populate('student', 'username email');
        if (!syllabus) {
            // It's not an error if a student has no syllabus, just return empty null or 404
            return res.status(404).json({ error: 'Syllabus not found' });
        }
        res.json(syllabus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Syllabus (Admin only)
router.post('/', auth, admin, async (req, res) => {
    try {
        const { student, subjects } = req.body;

        let syllabus = await Syllabus.findOne({ student });
        if (syllabus) {
            return res.status(400).json({ error: 'Syllabus already exists for this student' });
        }

        syllabus = new Syllabus({
            student,
            subjects
        });

        await syllabus.save();
        res.status(201).json(syllabus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Syllabus (Admin only)
router.put('/:id', auth, admin, async (req, res) => {
    try {
        const { subjects } = req.body;
        const syllabus = await Syllabus.findByIdAndUpdate(
            req.params.id,
            { subjects },
            { new: true }
        );
        if (!syllabus) {
            return res.status(404).json({ error: 'Syllabus not found' });
        }
        res.json(syllabus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Syllabus (Admin only)
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const syllabus = await Syllabus.findByIdAndDelete(req.params.id);
        if (!syllabus) {
            return res.status(404).json({ error: 'Syllabus not found' });
        }
        res.json({ message: 'Syllabus deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
