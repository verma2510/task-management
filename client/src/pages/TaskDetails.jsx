import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TaskDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [task, setTask] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [file, setFile] = useState(null);
    const [gradeData, setGradeData] = useState({}); // { submissionId: { grade: '', feedback: '' } }

    useEffect(() => {
        fetchTask();
        fetchSubmissions();
    }, [id]);

    const fetchTask = async () => {
        try {
            const res = await axios.get(`/api/tasks/${id}`);
            setTask(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const res = await axios.get(`/api/submissions/task/${id}`);
            setSubmissions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            await axios.post(`/api/submissions/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchSubmissions();
            alert('Submitted successfully!');
        } catch (err) {
            alert('Submission failed');
        }
    };

    const handleGrade = async (submissionId) => {
        const data = gradeData[submissionId];
        if (!data) return;
        try {
            await axios.put(`/api/submissions/${submissionId}/grade`, data);
            fetchSubmissions();
            alert('Graded successfully!');
        } catch (err) {
            alert('Grading failed');
        }
    };

    if (!task) return <div>Loading...</div>;

    return (
        <div>
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h1>{task.title}</h1>
                <p>{task.description}</p>
                <div className="mt-4 text-muted">Deadline: {new Date(task.deadline).toDateString()}</div>
            </div>

            {/* Student View */}
            {user.role === 'student' && (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2>Submit Work</h2>
                    {submissions.length > 0 ? (
                        <div className="alert">
                            <p>You have submitted this task.</p>
                            {submissions[0].grade && (
                                <div className="mt-4">
                                    <strong>Grade:</strong> {submissions[0].grade} <br />
                                    <strong>Feedback:</strong> {submissions[0].feedback}
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Upload Image</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} required />
                            </div>
                            <button className="btn btn-primary">Submit Task</button>
                        </form>
                    )}
                </div>
            )}

            {/* Admin View */}
            {user.role === 'admin' && (
                <div>
                    <h2>Submissions</h2>
                    {submissions.length === 0 ? <p>No submissions yet.</p> : (
                        <div className="grid-2">
                            {submissions.map(sub => (
                                <div key={sub._id} className="card">
                                    <h4>Student: {sub.student.username}</h4>
                                    <p>Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                    {/* Link to image - note: requires server static serving of uploads */}
                                    <a href={`http://localhost:5000/${sub.imagePath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary mb-4" style={{ display: 'inline-block' }}>View Image</a>

                                    <div className="form-group border-top pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                        <label>Grade</label>
                                        <input
                                            value={gradeData[sub._id]?.grade || sub.grade || ''}
                                            onChange={e => setGradeData({
                                                ...gradeData,
                                                [sub._id]: { ...gradeData[sub._id], grade: e.target.value, feedback: gradeData[sub._id]?.feedback || sub.feedback }
                                            })}
                                        />
                                        <label className="mt-4">Feedback</label>
                                        <textarea
                                            value={gradeData[sub._id]?.feedback || sub.feedback || ''}
                                            onChange={e => setGradeData({
                                                ...gradeData,
                                                [sub._id]: { ...gradeData[sub._id], feedback: e.target.value, grade: gradeData[sub._id]?.grade || sub.grade }
                                            })}
                                        />
                                        <button onClick={() => handleGrade(sub._id)} className="btn btn-primary mt-4">Save Grade</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskDetails;
