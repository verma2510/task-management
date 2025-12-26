import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SyllabusView from './SyllabusView';
import { useNavigate } from 'react-router-dom';

const SyllabusManager = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [syllabus, setSyllabus] = useState({ subjects: [] });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [viewMode, setViewMode] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchSyllabus(selectedStudent);
        } else {
            setSyllabus({ subjects: [] });
        }
    }, [selectedStudent]);

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/api/users/students');
            setStudents(res.data);
        } catch (err) {
            console.error("Failed to fetch students", err);
        }
    };

    const fetchSyllabus = async (studentId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/syllabus/${studentId}`);
            setSyllabus(res.data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                // No syllabus yet, start fresh
                setSyllabus({ subjects: [], isNew: true });
            } else {
                console.error("Failed to fetch syllabus", err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (syllabus._id) {
                // Update
                const res = await axios.put(`/api/syllabus/${syllabus._id}`, { subjects: syllabus.subjects });
                setSyllabus(res.data); // Update state with latest from server
                setMessage('Syllabus updated successfully');
            } else {
                // Create
                const res = await axios.post('/api/syllabus', { student: selectedStudent, subjects: syllabus.subjects });
                setSyllabus(res.data); // Update with saved data including _id
                setMessage('Syllabus created successfully');
            }
            setTimeout(() => setMessage(''), 3000);
            // Optionally refresh to ensure sync
        } catch (err) {
            console.error(err);
            alert('Failed to save syllabus: ' + (err.response?.data?.error || err.message));
        }
    };

    const deleteSyllabus = async () => {
        if (!confirm('Are you sure you want to delete the entire syllabus for this student?')) return;
        try {
            if (syllabus._id) {
                await axios.delete(`/api/syllabus/${syllabus._id}`);
                setSyllabus({ subjects: [], isNew: true });
                setMessage('Syllabus deleted successfully');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to delete syllabus');
        }
    };

    const addSubject = () => {
        setSyllabus({
            ...syllabus,
            subjects: [...syllabus.subjects, { name: 'New Subject', lessons: [] }]
        });
    };

    const removeSubject = (index) => {
        const newSubjects = [...syllabus.subjects];
        newSubjects.splice(index, 1);
        setSyllabus({ ...syllabus, subjects: newSubjects });
    };

    const updateSubjectName = (index, name) => {
        const newSubjects = [...syllabus.subjects];
        newSubjects[index].name = name;
        setSyllabus({ ...syllabus, subjects: newSubjects });
    };

    const addLesson = (subjectIndex) => {
        const newSubjects = [...syllabus.subjects];
        newSubjects[subjectIndex].lessons.push({
            number: newSubjects[subjectIndex].lessons.length + 1,
            name: 'New Lesson'
        });
        setSyllabus({ ...syllabus, subjects: newSubjects });
    };

    const removeLesson = (subjectIndex, lessonIndex) => {
        const newSubjects = [...syllabus.subjects];
        newSubjects[subjectIndex].lessons.splice(lessonIndex, 1);
        setSyllabus({ ...syllabus, subjects: newSubjects });
    };

    const updateLesson = (subjectIndex, lessonIndex, field, value) => {
        const newSubjects = [...syllabus.subjects];
        newSubjects[subjectIndex].lessons[lessonIndex][field] = value;
        setSyllabus({ ...syllabus, subjects: newSubjects });
    };

    return (
        <div className="syllabus-manager fade-in">
            <h2 className="mb-4">Syllabus Management</h2>
            <button
                className='mb-4 px-4 py-2 btn btn-secondary'
                onClick={() => navigate('/syllabus-view', { state: { syllabus } })}
            >
                View Syllabus
            </button>

            <div className="glass-panel p-4 mb-4">
                <div className="form-group mb-0">
                    <label>Select Student to Manage Syllabus</label>
                    <select
                        className="form-control"
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                    >
                        <option value="">-- Choose a Student --</option>
                        {students.map(s => (
                            <option key={s._id} value={s._id}>{s.username} ({s.email})</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedStudent && (
                viewMode ? (
                    <SyllabusView syllabus={syllabus} />
                ) : (
                    <div className="fade-in">
                        <div className="flex-between mb-4 align-items-center">
                            <h3 className="m-0">Editing Syllabus</h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {syllabus._id && <button className="btn btn-danger" onClick={deleteSyllabus}>Delete All</button>}
                                <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                            </div>
                        </div>
                        {message && <div className="p-3 mb-4" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4caf50', borderRadius: 'var(--radius)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>{message}</div>}

                        {syllabus.subjects.length === 0 && (
                            <div className="glass-panel p-4 text-center text-muted">
                                <p className="mb-3">No subjects added to this syllabus yet.</p>
                                <button className="btn btn-primary" onClick={addSubject}>Add First Subject</button>
                            </div>
                        )}

                        {syllabus.subjects.map((subject, sIndex) => (
                            <div key={sIndex} className="glass-panel p-4 mb-4" style={{ borderLeft: '4px solid var(--primary)' }}>
                                <div className="flex-between mb-3 align-items-center">
                                    <input
                                        type="text"
                                        value={subject.name}
                                        onChange={(e) => updateSubjectName(sIndex, e.target.value)}
                                        className="input-minimal"
                                        style={{ padding: '0.4rem 0.8rem' }}
                                        placeholder="Subject Name"
                                    />
                                    <button
                                        className="btn btn-danger"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                        onClick={() => removeSubject(sIndex)}
                                    >
                                        Delete Subject
                                    </button>
                                </div>

                                <div className="lessons-container pl-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {subject.lessons.map((lesson, lIndex) => (
                                        <div key={lIndex} className="lesson-item">
                                            <div style={{ display: 'flex', gap: '1rem', flex: 1, alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span className="text-muted" style={{ fontSize: '0.9rem' }}>No.</span>
                                                    <input
                                                        type="number"
                                                        value={lesson.number}
                                                        onChange={(e) => updateLesson(sIndex, lIndex, 'number', e.target.value)}
                                                        className="form-control"
                                                        style={{ width: '60px', padding: '0.4rem', textAlign: 'center' }}
                                                        placeholder="#"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={lesson.name}
                                                    onChange={(e) => updateLesson(sIndex, lIndex, 'name', e.target.value)}
                                                    className="form-control"
                                                    placeholder="Lesson Name"
                                                    style={{ flex: 1, padding: '0.4rem 0.8rem' }}
                                                />
                                            </div>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => removeLesson(sIndex, lIndex)}
                                                style={{ padding: '0.25rem 0.6rem', lineHeight: 1, fontSize: '1.2rem' }}
                                                title="Remove Lesson"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <ButtonAddLesson onClick={() => addLesson(sIndex)} />
                                </div>
                            </div>
                        ))}

                        {syllabus.subjects.length > 0 && (
                            <button className="btn btn-secondary mt-2 w-100 p-3" style={{ borderStyle: 'dashed' }} onClick={addSubject}>
                                + Add New Subject
                            </button>
                        )}
                    </div>
                )
            )}
        </div>
    );
};

const ButtonAddLesson = ({ onClick }) => (
    <button
        className="btn btn-light btn-sm mt-2"
        onClick={onClick}
        style={{ width: 'fit-content', opacity: 0.8, fontSize: '0.85rem' }}
    >
        + Add Lesson
    </button>
);

export default SyllabusManager;
